import { Body, Controller, Post, Inject, Logger } from '@nestjs/common';
import { AnalyzeService } from './analyze.service';
import type { ProductDTO } from '../common/types';
import { CommerceReviewResponseSchema } from '../common/schemas/commerceReviewResponse.schema';
import { UnprocessableEntityException } from '@nestjs/common';
import type { UnfurlInterface } from '../common/interfaces/unfurl.interface';
import type { AIInterface } from '../common/interfaces/ai.interface';
import type { ResponseMapperInterface } from '../common/interfaces/response-mapper.interface';
import type { EvidenceValidatorInterface } from '../common/interfaces/evidence-validator.interface';
import type { ReviewsInterface } from '../common/interfaces/reviews.interface';
import { EVIDENCE_AGGREGATOR_TOKEN } from '../common/interfaces/evidence-aggregator.interface';
import type { EvidenceAggregatorInterface } from '../common/interfaces/evidence-aggregator.interface';

@Controller('analyze')
export class AnalyzeController {
  constructor(
    private readonly analyze: AnalyzeService,
    @Inject('UnfurlService') private readonly unfurl: UnfurlInterface,
    @Inject('ResponseMapper') private readonly responseMapper: ResponseMapperInterface,
    @Inject('GeminiService') private readonly geminiService: AIInterface,
    @Inject('EvidenceValidator') private readonly evidenceValidator: EvidenceValidatorInterface,
    @Inject('ReviewsService') private readonly reviewsService: ReviewsInterface,
    @Inject(EVIDENCE_AGGREGATOR_TOKEN) private readonly evidenceAggregator: EvidenceAggregatorInterface,
  ) {}

  private readonly logger = new Logger(AnalyzeController.name);
  // Debug timing theo ENV để có thể tắt/mở khi cần
  private get debugTiming() { return (process.env.GC_DEBUG_TIMING ?? '0') === '1'; }
  private now() { return Date.now(); }
  private dur(msStart: number) { return Date.now() - msStart; }

  /**
   * Body cho phép:
   * { url: "https://vt.tiktok.com/..." }
   *  hoặc
   * { product: ProductDTO }
   */
  @Post()
  async analyzeUrl(@Body() body: { url?: string; product?: ProductDTO; html?: string }): Promise<any> {
    const LLM_ENABLED = (process.env.GC_ENABLE_LLM ?? 'false') === 'true';
    const FALLBACK = (process.env.ANALYZE_FALLBACK ?? '0') === '1';
    const hasGemini = !!this.geminiService && typeof this.geminiService.enrichAnalysis === 'function';
    const CAN_USE_LLM = LLM_ENABLED && !FALLBACK && hasGemini;
    const LLM_STRICT = LLM_ENABLED && ((process.env.GC_LLM_STRICT ?? 'true') === 'true');
    const TTK_ENABLED = ((process.env.GC_ENABLE_TIKTOK_SEARCH ?? '1') === '1');
    const YT_ENABLED = ((process.env.GC_ENABLE_YOUTUBE_SEARCH ?? '1') === '1');
    const AUTO_SCRAPE = ((process.env.GC_AUTO_SCRAPE_REVIEWS ?? '0') === '1');

    const product =
      body.product ?? (body.url ? await this.unfurl.fromUrl(body.url) : null);

    if (!product) {
      throw new Error('Require "url" or "product" in body');
    }

    // Optional: Enrich từ raw HTML (TikTok) nếu được cung cấp trực tiếp
    if (typeof body.html === 'string' && body.html.trim().length > 0) {
      try {
        const tH = this.now();
        if (typeof (this.reviewsService as any)?.extractTikTokFromHtml === 'function') {
          const partial = await (this.reviewsService as any).extractTikTokFromHtml(body.html);
          if (partial && typeof partial === 'object') {
            // merge vào product trước khi các bước khác
            Object.assign(product, partial);
          }
        }
        if (this.debugTiming) this.logger.log(`[timing] html.parse: ${this.dur(tH)}ms enriched=${product?.title ? 'title' : ''}${product?.price ? ',price' : ''}${product?.ratingAvg ? ',rating' : ''}`);
      } catch (e: any) {
        if (this.debugTiming) this.logger.warn(`[timing] html.parse: failed ${e?.message || e}`);
      }
    }

    // Optional: TikTok/YouTube search via Gemini tools to enrich reviewsSample
    let productForAnalyze = { ...product } as ProductDTO;
    // Thu thập các link video để đưa vào response.product.videos
    const collectedVideos: Array<{ url: string; type: 'creator_review' | 'ugc' | 'external' }> = [];

    // Parse productId từ TikTok URL nếu thiếu (finalUrl hoặc canonicalUrl)
    try {
      const urlForId = productForAnalyze.finalUrl || (productForAnalyze as any).canonicalUrl || '';
      if ((!productForAnalyze.productId || productForAnalyze.productId === '') && urlForId.includes('tiktok.com')) {
        const m = urlForId.match(/\/product\/(\d{8,})/i);
        if (m?.[1]) productForAnalyze.productId = m[1];
      }
    } catch {}
    if (TTK_ENABLED && typeof (this.geminiService as any)?.searchTikTokReviews === 'function') {
      const tTk = this.now();
      try {
        const timeoutMs = Math.max(5000, Math.min(30000, Number(process.env.TIKTOK_SEARCH_TIMEOUT_MS || 12000)));
        // Truyền productForAnalyze để tận dụng productId đã parse
        const tiktokPromise = (this.geminiService as any)
          .searchTikTokReviews(productForAnalyze)
          .then((arr: any[]) => (Array.isArray(arr) ? arr : []))
          .catch(() => []);
        const timed = await Promise.race<unknown>([
          tiktokPromise,
          new Promise((resolve) => setTimeout(() => resolve('__timeout__'), timeoutMs)),
        ]);
        const tiktokReviews = timed === '__timeout__' ? [] : (timed as any[]);
        if (tiktokReviews.length) {
          const existing = Array.isArray(product.reviewsSample) ? product.reviewsSample : [];
          const merged = [...existing, ...tiktokReviews.map((r, i) => ({
            id: String(r.id ?? `tt_${i}`),
            rating: typeof r.rating === 'number' ? r.rating : undefined,
            text: String(r.text || r.title || r.url || ''),
            images: Array.isArray(r.images) ? r.images : undefined,
            authorName: r.authorName ? String(r.authorName) : undefined,
            source: 'tiktok_video',
            createdAt: r.date || r.createdAt || undefined,
            url: r.url,
          }))];
          productForAnalyze = { ...productForAnalyze, reviewsSample: merged } as any;
          for (const r of tiktokReviews) {
            if (r?.url && typeof r.url === 'string') {
              collectedVideos.push({ url: r.url, type: 'creator_review' });
            }
          }
        }
        if (this.debugTiming) this.logger.log(`[timing] tiktok.search: ${this.dur(tTk)}ms found=${tiktokReviews.length}`);
      } catch (e: any) {
        if (this.debugTiming) this.logger.log(`[timing] tiktok.search: failed in ${this.dur(tTk)}ms: ${e?.message || e}`);
      }
    } else if (this.debugTiming) {
      const reason = !TTK_ENABLED ? 'DISABLED' : 'NO_METHOD';
      this.logger.log(`[timing] tiktok.search: skipped (${reason})`);
    }

    // YouTube search (fallback/booster), gộp sau TikTok để ưu tiên TikTok
    if (YT_ENABLED && typeof (this.geminiService as any)?.searchYouTubeReviews === 'function') {
      const tYt = this.now();
      try {
        const timeoutMs = Math.max(4000, Math.min(20000, Number(process.env.YOUTUBE_SEARCH_TIMEOUT_MS || 8000)));
        const ytPromise = (this.geminiService as any)
          .searchYouTubeReviews(productForAnalyze)
          .then((arr: any[]) => (Array.isArray(arr) ? arr : []))
          .catch(() => []);
        const timed = await Promise.race<unknown>([
          ytPromise,
          new Promise((resolve) => setTimeout(() => resolve('__timeout__'), timeoutMs)),
        ]);
        const ytReviews = timed === '__timeout__' ? [] : (timed as any[]);
        if (ytReviews.length) {
          const existing = Array.isArray(productForAnalyze.reviewsSample) ? productForAnalyze.reviewsSample : [];
          const seen = new Set<string>(existing.map((r: any) => (r as any).url || (r as any).text));
          const mapped = ytReviews.map((r, i) => ({
            id: String(r.id ?? `yt_${i}`),
            rating: typeof r.rating === 'number' ? r.rating : undefined,
            text: String(r.text || r.title || r.url || ''),
            images: Array.isArray(r.images) ? r.images : undefined,
            authorName: r.authorName ? String(r.authorName) : undefined,
            source: 'external',
            createdAt: r.date || r.createdAt || undefined,
            url: r.url,
          }));
          const deduped = mapped.filter((m) => {
            const key = (m as any).url || m.text;
            if (!key) return true;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          const merged = [...existing, ...deduped];
          productForAnalyze = { ...productForAnalyze, reviewsSample: merged } as any;
          for (const r of ytReviews) {
            if (r?.url && typeof r.url === 'string') {
              collectedVideos.push({ url: r.url, type: 'creator_review' });
            }
          }
        }
        if (this.debugTiming) this.logger.log(`[timing] youtube.search: ${this.dur(tYt)}ms found=${ytReviews.length}`);
      } catch (e: any) {
        if (this.debugTiming) this.logger.log(`[timing] youtube.search: failed in ${this.dur(tYt)}ms: ${e?.message || e}`);
      }
    } else if (this.debugTiming) {
      const reason = !YT_ENABLED ? 'DISABLED' : 'NO_METHOD';
      this.logger.log(`[timing] youtube.search: skipped (${reason})`);
    }

    // Hợp nhất collectedVideos vào productForAnalyze.videos (trước khi lọc/normalize)
    try {
      const existingVideos = Array.isArray((productForAnalyze as any).videos) ? (productForAnalyze as any).videos : [];
      const mergedVideos = [...existingVideos, ...collectedVideos];
      // de-dup theo URL
      const uniq = new Map<string, any>();
      for (const v of mergedVideos) {
        const url = typeof v?.url === 'string' ? v.url : undefined;
        if (!url) continue;
        if (!uniq.has(url)) uniq.set(url, v);
      }
      (productForAnalyze as any).videos = Array.from(uniq.values());
    } catch {}

    // Lọc chỉ giữ URL video hợp lệ (TikTok video/YouTube), loại bỏ link product page
    if (Array.isArray((productForAnalyze as any).videos)) {
      const isVideoUrl = (u: string): boolean => {
        try {
          const url = new URL(u);
          const h = url.hostname.toLowerCase();
          const p = url.pathname.toLowerCase();
          const isTikTokVideo = h.endsWith('tiktok.com') && /\/video\//.test(p);
          const isTikTokProduct = h.endsWith('tiktok.com') && /\/view\/product\//.test(p);
          const isYouTubeWatch = (h.endsWith('youtube.com') && (p === '/watch' || p.startsWith('/shorts'))) || h === 'youtu.be';
          return (isTikTokVideo || isYouTubeWatch) && !isTikTokProduct;
        } catch { return false; }
      };
      (productForAnalyze as any).videos = (productForAnalyze as any).videos
        .filter((v: any) => typeof v?.url === 'string' && isVideoUrl(v.url))
        // de-dup theo URL
        .filter((v: any, i: number, arr: any[]) => arr.findIndex(x => x?.url === v?.url) === i);
    }

    // Optional: scrape trực tiếp review TikTok platform (Playwright) nếu cho phép
    const isTikTok = ((productForAnalyze.finalUrl || (productForAnalyze as any).canonicalUrl || '')).includes('tiktok.com');
    if (AUTO_SCRAPE && isTikTok && typeof this.reviewsService?.extractReviews === 'function') {
      const tPl = this.now();
      try {
        const timeoutMs = Math.max(5000, Math.min(30000, Number(process.env.REVIEWS_SCRAPE_TIMEOUT_MS || 12000)));
        const scrapePromise = this.reviewsService.extractReviews(productForAnalyze).then(arr => Array.isArray(arr) ? arr : []).catch(() => []);
        const timed = await Promise.race<unknown>([
          scrapePromise,
          new Promise((resolve) => setTimeout(() => resolve('__timeout__'), timeoutMs)),
        ]);
        const platReviews = timed === '__timeout__' ? [] : (timed as any[]);
        if (platReviews.length) {
          const existing = Array.isArray(productForAnalyze.reviewsSample) ? productForAnalyze.reviewsSample : [];
          const merged = [...existing, ...platReviews.map((r, i) => ({
            id: String(r.id ?? `pf_${i}`),
            rating: typeof r.rating === 'number' ? r.rating : (typeof r.rating === 'string' ? Number(r.rating) : undefined),
            text: String(r.text || ''),
            images: Array.isArray(r.images) ? r.images : undefined,
            authorName: r.authorName || r.author || undefined,
            source: 'platform',
            createdAt: r.date || r.createdAt || undefined,
          }))];
          productForAnalyze = { ...productForAnalyze, reviewsSample: merged } as any;
        }
        if (this.debugTiming) this.logger.log(`[timing] platform.reviews: ${this.dur(tPl)}ms found=${platReviews.length}`);
      } catch (e: any) {
        if (this.debugTiming) this.logger.log(`[timing] platform.reviews: failed in ${this.dur(tPl)}ms: ${e?.message || e}`);
      }
    } else if (this.debugTiming) {
      const reason = !AUTO_SCRAPE ? 'DISABLED' : 'NO_METHOD_OR_NOT_TIKTOK';
      this.logger.log(`[timing] platform.reviews: skipped (${reason})`);
    }

    // Optional: extract TikTok meta (price/rating/reviewCount) từ PDP/network JSON
    // Luôn chạy cho TikTok vì nhẹ hơn reviews scraping
    if (isTikTok && typeof (this.reviewsService as any)?.extractTikTokMeta === 'function') {
      const tMt = this.now();
      try {
        const timeoutMs = Math.max(5000, Math.min(30000, Number(process.env.REVIEWS_SCRAPE_TIMEOUT_MS || 12000)));
        const metaPromise = (this.reviewsService as any).extractTikTokMeta(productForAnalyze).then((m: any) => (m && typeof m === 'object') ? m : {}).catch(() => ({}));
        const timed = await Promise.race<unknown>([
          metaPromise,
          new Promise((resolve) => setTimeout(() => resolve('__timeout__'), timeoutMs)),
        ]);
        const meta = timed === '__timeout__' ? {} as any : (timed as any);
        if (meta && Object.keys(meta).length) {
          productForAnalyze = { ...productForAnalyze, ...meta } as any;
        }
        if (this.debugTiming) this.logger.log(`[timing] platform.meta: ${this.dur(tMt)}ms hasMeta=${Object.keys(meta || {}).length > 0}`);
      } catch (e: any) {
        if (this.debugTiming) this.logger.log(`[timing] platform.meta: failed in ${this.dur(tMt)}ms: ${e?.message || e}`);
      }
    }

    const t0 = this.now();
    let analysis = await this.analyze.analyzeProduct(productForAnalyze);
    if (this.debugTiming) this.logger.log(`[timing] analyzeProduct: ${this.dur(t0)}ms`);
    const actions = this.analyze.getActions(productForAnalyze);

    // Enrich analysis with LLM when enabled and available
    if (CAN_USE_LLM) {
      const t1 = this.now();
      // Build minimal evidence from current context: product page + validated video links
      const nowIso = new Date().toISOString();
      const rawUrl: string | undefined = (productForAnalyze as any).finalUrl || (productForAnalyze as any).canonicalUrl;
      const baseEvidence = rawUrl ? [{
        id: 'prod:page',
        type: 'productPage',
        url: rawUrl,
        scrapedAt: nowIso,
        reliability: 0.35,
      }] : [] as Array<any>;
      const videoEvidence = Array.isArray((productForAnalyze as any).videos)
        ? (productForAnalyze as any).videos.map((v: any, idx: number) => ({
            id: `vid:${idx}`,
            type: 'video',
            url: v.url,
            source: v.type || 'external',
            scrapedAt: nowIso,
            reliability: 0.4,
          }))
        : [];
      const evidence = [...baseEvidence, ...videoEvidence];

      const enriched = await this.geminiService.enrichAnalysis({
        productUrl: rawUrl,
        evidence,
        aspects: analysis.aspects,
      });
      analysis = { ...analysis, ...enriched };
      if (this.debugTiming) this.logger.log(`[timing] gemini.enrichAnalysis: ${this.dur(t1)}ms`);
    } else {
      if (this.debugTiming) {
        const reason = !LLM_ENABLED ? 'LLM_DISABLED' : FALLBACK ? 'FALLBACK_ON' : !hasGemini ? 'GEMINI_UNAVAILABLE' : 'UNKNOWN';
        this.logger.log(`[timing] gemini.enrichAnalysis: skipped (${reason})`);
      }
    }

    // Map to evidence-first response schema
    const t2 = this.now();
    const response = this.responseMapper.mapToEvidenceFirstResponse(productForAnalyze as any, analysis, actions);
    if (this.debugTiming) this.logger.log(`[timing] mapToEvidenceFirstResponse: ${this.dur(t2)}ms`);
    
    // Validate evidence references in response
    const t3 = this.now();
    const validation = this.evidenceValidator.validate(response);
    if (this.debugTiming) this.logger.log(`[timing] evidenceValidator.validate: ${this.dur(t3)}ms`);
    if (!validation.isValid && LLM_STRICT) {
      throw new UnprocessableEntityException({
        message: 'Evidence validation failed',
        errors: validation.errors,
      });
    }
    
    // Ensure system exists and record validation status as warnings (do not extend schema)
    response.system = response.system ?? {};
    if (!validation.isValid) {
      response.system.warnings = [
        ...(response.system.warnings ?? []),
        'Evidence validation failed',
      ];
    }
    
    // Evidence Aggregation & Diagnostics (fail-soft): không thay đổi schema, chỉ bổ sung cảnh báo
    try {
      const tAg = this.now();
      const projected = Array.isArray(response.evidence) ? response.evidence.map((e: any) => {
        const url = typeof e.url === 'string' ? e.url : undefined;
        let source = e.source as string | undefined;
        if (!source && url) {
          try { source = new URL(url).hostname; } catch {}
        }
        return {
          id: String(e.id || ''),
          type: String(e.type || 'unknown'),
          source: String(source || 'unknown'),
          content: String(url || e.note || e.type || ''),
          timestamp: typeof e.scrapedAt === 'string' ? e.scrapedAt : undefined,
        };
      }) : [];
      const aggregated = this.evidenceAggregator.aggregateEvidence(projected as any);
      const contradictions = this.evidenceAggregator.crossReferenceEvidence(aggregated as any);
      const diagnostics = this.evidenceAggregator.generateDiagnostics(aggregated as any);
      const diagMsgs = diagnostics.map(d => `EV:${d.code} (${d.severity}) - ${d.message}`);
      const contraMsgs = contradictions.map(c => `EV:contradiction between ${c.evidenceId1} and ${c.evidenceId2}: ${c.contradiction}`);
      if (diagMsgs.length || contraMsgs.length) {
        response.system.warnings = [
          ...(response.system.warnings ?? []),
          ...diagMsgs,
          ...contraMsgs,
        ];
      }
      if (this.debugTiming) this.logger.log(`[timing] evidence.aggregate+diagnostics: ${this.dur(tAg)}ms diag=${diagMsgs.length} contra=${contraMsgs.length}`);
    } catch (e: any) {
      if (this.debugTiming) this.logger.warn(`[timing] evidence.aggregate+diagnostics: failed ${e?.message || e}`);
    }
    
    // Validate response against Zod schema
    const t4 = this.now();
    const parsed = CommerceReviewResponseSchema.safeParse(response);
    if (this.debugTiming) this.logger.log(`[timing] zod.safeParse: ${this.dur(t4)}ms`);
    if (!parsed.success) {
      if (LLM_STRICT) {
        throw new UnprocessableEntityException({
          message: 'Response schema validation failed',
          issues: parsed.error.issues,
        });
      }
      // Fail-soft: downgrade verdict and annotate dataIntegrity
      // If validation fails, add a warning to the system field (ensuring initialization)
      response.system = response.system ?? {};
      response.system.warnings = [
        ...(response.system.warnings ?? []),
        'Schema validation failed - response may be incomplete',
      ];
      return response;
    }
    if (this.debugTiming) this.logger.log(`[timing] total: ${this.dur(t0)}ms`);
    return parsed.data;
  }

  private alignAspectsToRubric(aspects: any[], _requiredNames: string[]) {
    // Strict-by-default: do not add or translate aspects. Pass-through from analysis.
    return (aspects || []).map(a => ({
      ...a,
      name: this.normalizeAspectName(a?.name) || a?.name,
      // keep existing metrics; do not inject defaults
      metrics: Array.isArray(a?.metrics) ? a.metrics : [],
      // ensure quotes/fitFor arrays are arrays if present, but do not seed content
      quotes: Array.isArray((a as any)?.quotes) ? (a as any).quotes : [],
      fitFor: Array.isArray((a as any)?.fitFor) ? (a as any).fitFor : [],
    }));
  }

  private buildAspectScores(aspects: any[], rubricWeights: Record<string, number>) {
    // Single source of truth for weights is rubricWeights; do not duplicate weight in aspectScores
    return aspects.map(a => {
      const name = a.name;
      const scoreRaw = typeof a.score === 'number' ? a.score : undefined;
      const scoreWeighted = typeof scoreRaw === 'number' ? (scoreRaw / 5) * (rubricWeights[name as keyof typeof rubricWeights] ?? 0) : undefined;
      return { name, scoreRaw, scoreWeighted };
    });
  }

  private defaultMetricsForAspect(name: string) {
    return [
      { name: 'positive_mentions', observed: undefined, expected: undefined, unit: 'count' },
      { name: 'negative_mentions', observed: undefined, expected: undefined, unit: 'count' },
      { name: 'neutral_mentions', observed: undefined, expected: undefined, unit: 'count' },
      { name: 'avg_sentiment', observed: undefined, expected: undefined, unit: 'score' },
      { name: 'supporting_evidence', observed: undefined, expected: undefined, unit: 'count' },
    ].map(m => ({ ...m, aspect: name }));
  }

  private normalizeAspectName(name?: string): string | undefined {
    if (!name) return undefined;
    const mapping: Record<string, string> = {
      'tổng quan': 'overview',
      'chất lượng âm thanh': 'soundQuality',
      'pin': 'battery',
      'micro trong gọi': 'micCall',
      'chống ồn': 'noiseControl',
      'độ thoải mái': 'comfortFit',
      'độ bền': 'durability',
      'kết nối': 'connectivity',
      'bảo hành hỗ trợ': 'warrantySupport',
    };
    return mapping[name] || name;
  }

  private platformFromUrl(u: string | undefined): string | undefined {
    try {
      const url = new URL(u || '');
      if (url.hostname.includes('tiktok')) return 'tiktok';
      if (url.hostname.includes('shopee')) return 'shopee';
      if (url.hostname.includes('lazada')) return 'lazada';
      return 'other';
    } catch {
      return undefined;
    }
  }

  private productIdFromUrl(u: string | undefined): string | undefined {
    try {
      const url = new URL(u || '');
      // Shopee product id patterns
      if (url.hostname.includes('shopee')) {
        const match = url.pathname.match(/-i\.(\d+)-(\d+)/);
        return match?.[2]; // Return the product ID part
      }
      // Lazada product id patterns
      if (url.hostname.includes('lazada')) {
        const params = new URLSearchParams(url.search);
        return params.get('pid') || undefined;
      }
      // TikTok product id patterns
      const m = url.pathname.match(/product\/(\d+)/) || url.pathname.match(/(\d{6,})/);
      return m?.[1];
    } catch {
      return undefined;
    }
  }

  private buildDataIntegrity(params: {
    overallScore: number;
    verdict?: string;
    reasons: string[];
    aspects: any[];
    requiredAspects: string[];
    productUrl?: string;
    canonicalUrl?: string;
    buyUrl?: string;
    citationsCount: number;
  }) {
    const issues: Array<{code:string;severity:'low'|'medium'|'high';message:string;paths:string[]}> = [];
    // verdict consistency (neutral phrasing, no explicit verdict=buy/hold in message)
    if (typeof params.overallScore === 'number' && params.overallScore <= 60 && params.verdict === 'buy') {
      issues.push({ code: 'verdict_signal_divergence', severity: 'high', message: 'Signals may diverge from the current verdict; please recheck scoring and evidence.', paths: ['$.analysis.overallScore','$.decision.verdict'] });
    }
    // aspects schema mismatch
    const names = new Set((params.aspects||[]).map(a=>a.name));
    const missing = params.requiredAspects.filter(n=>!names.has(n));
    if (missing.length) {
      issues.push({ code: 'aspects_schema_mismatch', severity: 'medium', message: `Thiếu khía cạnh: ${missing.join(', ')}`, paths: ['$.aspects','$.rubric.weights'] });
    }
    // empty citations
    if (!params.citationsCount || params.citationsCount <= 0) {
      issues.push({ code: 'empty_citations', severity: 'low', message: 'Thiếu citations trong aiAnalysis', paths: ['$.aiAnalysis.citations'] });
    }
    // input contract: images minimal
    // Note: images are part of product; we can only warn here via path
    // TODO(verify): refine path to exact first image url
    if (!params.canonicalUrl) {
      issues.push({ code: 'missing_canonical_url', severity: 'high', message: 'Thiếu canonicalUrl đã sanitize.', paths: ['$.product.canonicalUrl'] });
    }
    // Source diversity: need >=3 distinct types: productPage, marketplace(other), independent
    try {
      const evArr = ((params as any).evidence && Array.isArray((params as any).evidence)) ? (params as any).evidence as any[] : [];
      const uniqTypes = new Set(evArr.map((e:any)=>e.type));
      if (uniqTypes.size > 0 && uniqTypes.size < 3) {
        issues.push({ code: 'insufficient_source_diversity', severity: 'medium', message: 'Cần ít nhất 3 nguồn độc lập (productPage, marketplace khác, review độc lập).', paths: ['$.evidence[*].type'] });
      }
    } catch {}
    // Pricing segment required if no currentPrice
    try {
      const pr = (params as any).pricing;
      const hasPrice = pr && typeof pr.currentPrice === 'number';
      const seg = pr?.segment;
      if (!hasPrice && (pr !== undefined) && (!seg || seg === 'unknown')) {
        issues.push({ code: 'missing_pricing_segment', severity: 'medium', message: 'Thiếu pricing.segment khi currentPrice=null.', paths: ['$.pricing.segment'] });
      }
    } catch {}
    // Fail-soft status: 'invalid' only for schema violations; otherwise 'partial' when issues exist
    const schemaViolationCodes = new Set(['aspects_schema_mismatch','invalid_metric_direction','mixed_target_types']);
    const hasSchemaViolation = issues.some(i => schemaViolationCodes.has(i.code));
    const status = hasSchemaViolation ? 'invalid' : (issues.length ? 'partial' : 'valid');
    // coverage completeness: based on observed metrics availability
    const totalMetrics = (params.aspects||[]).reduce((acc, a) => acc + ((a.metrics?.length)||0), 0) || 0;
    const observedCount = (params.aspects||[]).reduce((acc, a) => acc + ((a.metrics||[]).filter((m: any) => m.observed != null).length), 0);
    const completeness = totalMetrics ? Math.round((observedCount / totalMetrics) * 100) : 0;
    return {
      status,
      issues,
      recommendation: undefined,
      coverage: {
        requiredAspects: params.requiredAspects,
        presentAspects: Array.from(names),
        filledKeySpecsPercent: completeness,
      },
    };
  }
}
