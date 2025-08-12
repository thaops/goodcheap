---
trigger: always_on
---

NestJS – E-commerce Analyzer API
Activation: Always On

0) Scope
Input: url sản phẩm từ TikTok/Shopee/Lazada/…

Pipeline: Normalize URL → Fetch & Extract → Parse & Evidence → LLM Analyze → Persist/Cache → Return

Yêu cầu: Không bịa. Chỉ đưa claim có evidenceIds. Thiếu dữ liệu quan trọng ⇒ verdict="hold".

1) Architecture (Ports & Adapters + Feature-based)
graphql
Sao chép
Chỉnh sửa
src/
  core/                 # cross-cutting (errors, result, logger, config, utils)
  modules/
    analyze/            # -> public API (controllers)
      analyze.controller.ts
      analyze.module.ts
    ingestion/          # normalize url, dedupe, enqueue jobs
    extract/            # HTTP fetch, robots rules, parse OG/JSON-LD/Cheerio
    analyze_llm/        # ports + adapters to LLM providers (OpenAI/Qwen/Ollama)
    product/            # entities, repositories, persistence (Prisma/TypeORM)
    queue/              # BullMQ queues + processors (analyze job)
  infra/
    http/               # got client, rate-limit, timeouts
    persistence/        # Prisma/TypeORM (khuyến nghị PostgreSQL)
    cache/              # Redis (ioredis)
main.ts
UI/Client không gọi thẳng extractor/LLM. Chỉ qua UseCase (AnalyzeProductLinkUseCase) được expose bởi analyze.controller.

2) Endpoints (REST-first)
POST /analyze { url } → 202 Accepted + { jobId } (xử lý async qua queue).

GET /analyze/:jobId → trạng thái + kết quả nếu xong.

GET /health

(tùy chọn) Webhook: /webhooks/analyze/complete khi job xong.

Quy tắc:

Validate url (schema + chặn SSRF), strip tracking params.

Idempotent: cùng canonicalUrl trong 24h ⇒ trả cache.

3) Contracts (Zod-first, dùng lại ở FE)
ts
Sao chép
Chỉnh sửa
// src/core/contracts.ts
import { z } from 'zod';

export const UrlIn = z.object({ url: z.string().url().max(2048) });

// Chuẩn hóa URL (bỏ tracking)
export const CanonicalUrl = z.string().url();

export const Evidence = z.object({
  id: z.string(),              // stable hash theo vị trí DOM/thuộc tính
  source: z.enum(['opengraph','jsonld','dom','api']),
  key: z.string(),             // "title" | "images[0]" | "price.amount" ...
  value: z.any(),
});

export const ProductExtract = z.object({
  title: z.string().min(1).optional(),
  canonicalUrl: CanonicalUrl,
  images: z.array(z.string().url()).optional(),
  price: z.object({
    amount: z.number().nonnegative().optional(),
    currency: z.string().length(3).optional(),
  }).optional(),
  attributes: z.record(z.any()).optional(),
  evidences: z.array(Evidence),
});

export const Analysis = z.object({
  verdict: z.enum(['pass','fail','hold']),
  confidence: z.number().min(0).max(1),
  claims: z.array(z.object({
    key: z.string(),           // "soundQuality", "battery", ...
    summary: z.string(),
    evidenceIds: z.array(z.string()),
  })),
  rubric: z.object({
    weights: z.record(z.number()) // cố định nếu muốn
  }),
  videoPlan: z.object({
    provider: z.string().default('mock'),
    scenes: z.array(z.object({
      type: z.enum(['imageKenBurns','caption','transition']),
      asset: z.string().optional(),
      text: z.string().optional(),
      durationMs: z.number().positive().optional(),
    })),
  }).optional(),
});

export type TProductExtract = z.infer<typeof ProductExtract>;
export type TAnalysis = z.infer<typeof Analysis>;
4) Use case & flow
AnalyzeProductLinkUseCase:

NormalizeUrlService: bỏ utm_*, aff*, ref, _svg, checksum, sắp xếp query, giữ host/path chính.

Deduper (Redis Set): nếu URL đã chạy gần đây ⇒ trả jobId cũ.

Enqueue job analyze (BullMQ) kèm canonicalUrl.

Processor: ExtractService → LLMAnalyzeService → PersistService → cache kết quả.

Nếu extractor thiếu dữ liệu quan trọng ⇒ LLM phải trả verdict="hold" và confidence ≤ 0.7.

5) LLM provider (Ports)
ts
Sao chép
Chỉnh sửa
// src/modules/analyze_llm/ports/llm.port.ts
export interface LlmPort {
  analyzeProduct(input: {
    extract: TProductExtract,
    constraints: { noFabrication: true, language?: string }
  }): Promise<TAnalysis>;
}
Adapters:

OpenAiAdapter (Chat Completions/Responses API)

QwenAdapter (DashScope hoặc open-source server)

OllamaAdapter (cục bộ, tiết kiệm chi phí)

Rule:

Prompt phải liệt kê Evidence và chỉ được dùng chúng.

Nếu claim không có evidenceIds ⇒ loại.

Log token usage và latency (Prometheus metrics).

6) Extractor (HTTP + Parser)
HTTP: got với:

timeout: 10s, http2: true, gzip/deflate/br, maxRedirects: 3

UA tùy chỉnh, chặn content-length > 5MB

SSRF guard: chỉ http/https, block private IP/ranges

Parse theo thứ tự:

JSON-LD (application/ld+json) → Product, Offer

OpenGraph/meta (og:title, og:image, product:price:amount…)

DOM với cheerio (fallback)

Mỗi field map kèm Evidence (id = hash(${source}:${selector}:${index})).

7) Security & Reliability
helmet, CORS whitelists, compression.

Request size limit 1MB; body parser strict JSON.

@nestjs/throttler (VD: 60 req/1m/IP).

Global exception filter → chuẩn hóa lỗi { code, message }.

Queue worker retry: 3 lần, backoff 2^n x 500ms.

Config qua @nestjs/config + Zod schema; không chạy nếu env thiếu.

8) Caching & Idempotency
Redis:

analyze:url:{hash} → jobId

result:{jobId} → JSON Analysis (TTL 24h)

Header Cache-Control: private, max-age=… cho GET result.

ETag theo sha1(body).

9) Persistence (tùy chọn)
PostgreSQL + Prisma:

products(id, canonical_url, last_seen_at, raw_extract)

analyses(id, product_id, verdict, confidence, rubric, video_plan, created_at)

Lưu extract và analysis để truy vết.

10) Coding style & performance
ESLint + Prettier (bật no-explicit-any trong core), strict TS.

Pure service, không logic nặng trong controller.

Use readonly, private fields, DI chuẩn.

Tránh n+1 HTTP fetch; chỉ một fetch trừ khi cần ảnh.

Log bằng pino; level info (prod), debug (dev).

11) Testing
Unit: Normalize, Extract (mock HTML), LLM adapter (mock), UseCase.

E2E: POST /analyze → poll GET /analyze/:id cho flow hạnh phúc + thiếu dữ liệu.

Contract tests: đảm bảo JSON trả về match Analysis schema.

12) CLI & scripts (pnpm)
bash
Sao chép
Chỉnh sửa
pnpm dev            # start app (HMR)
pnpm worker         # start queue worker
pnpm test
pnpm test:e2e
pnpm lint
pnpm format
13) Snippets (để Cascade tái sử dụng)
main.ts

ts
Sao chép
Chỉnh sửa
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.use(helmet());
  app.enableCors({ origin: [/localhost/, /goodcheap\.app$/], credentials: true });
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: false }));
  app.use(compression());

  // Zod pipe (simple)
  app.useGlobalPipes(new ZodValidationPipe()); // tự cài đặt pipe đơn giản

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
AnalyzeController

ts
Sao chép
Chỉnh sửa
@Post()
async enqueue(@Body() dto: unknown) {
  const { url } = UrlIn.parse(dto);
  const canonical = this.normalizeUrl.exec(url);
  const jobId = await this.ingestion.enqueue(canonical);
  return { jobId }; // 202 Accepted
}

@Get(':id')
async status(@Param('id') id: string) {
  return this.ingestion.getResult(id); // { status: 'queued|processing|done|error', result? }
}
NormalizeUrlService (bỏ tracking)

ts
Sao chép
Chỉnh sửa
stripParams(keys = [/^utm_/i, /^aff/i, /^ref$/i, /^_svg$/i, /^checksum$/i]) {
  return (u: string) => {
    const url = new URL(u);
    for (const [k] of url.searchParams) {
      if (keys.some(rx => rx.test(k))) url.searchParams.delete(k);
    }
    url.hash = '';
    return url.toString();
  };
}
14) When to ask (clarify)
Domain lạ/không thuộc TMĐT (không có HTML sản phẩm) ⇒ hỏi lại người dùng.

URL private/auth-required ⇒ trả hold và hướng dẫn cung cấp ảnh/chụp màn hình.

15) PR & commit
Trước khi merge: pnpm lint && pnpm test.

Commit type: feat(analyze): ..., fix(extract): ..., chore(queue): ....