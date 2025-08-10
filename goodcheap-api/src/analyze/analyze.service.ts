import { Injectable, ServiceUnavailableException, BadRequestException, UnauthorizedException, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProductDTO, AnalysisDTO, AlternativeItem, ActionsDTO, ReviewItem } from '../common/types';
import { ReviewsService } from '../reviews/reviews.service';

@Injectable()
export class AnalyzeService {
  private gemini: GoogleGenerativeAI | null;
  private modelName: string;
  private readonly logger = new Logger(AnalyzeService.name);

  constructor(private readonly reviewsService: ReviewsService) {
    const key = process.env.GOOGLE_API_KEY?.trim();
    this.modelName = process.env.ANALYZE_MODEL || 'gemini-1.5-flash';
    this.gemini = key ? new GoogleGenerativeAI(key) : null;
  }

  private norm(v: number | undefined | null, min = 0, max = 1) {
    if (v == null) return 0.5;
    const x = Math.max(min, Math.min(max, v));
    return (x - min) / (max - min);
  }

  /** Score cơ bản từ rating/reviewCount, có thể nâng cấp sau */
  calcScore(p: ProductDTO): number {
    const q = this.norm(p.ratingAvg, 0, 5);      // 0..1
    const r = this.norm(
      p.reviewCount ? Math.log10((1 + p.reviewCount)) : undefined,
      0, 4
    ); // log để không "nặng" shop quá lớn
    const quality = 0.7 * q + 0.3 * r;
    const priceFairness = 0.5; // placeholder, sẽ thay bằng median phân khúc
    let score = 100 * (0.65 * quality + 0.35 * priceFairness);

    if (!p.images?.length) score -= 5;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  detectRedFlags(p: ProductDTO): string[] {
    const flags: string[] = [];
    if (!p.title) flags.push('Thiếu tiêu đề rõ ràng');
    if (!p.images?.length) flags.push('Thiếu ảnh sản phẩm');
    // sau này thêm: shop mới, giảm giá ảo, 1★ tăng mạnh 30 ngày, v.v.
    return flags;
  }

  private buildPriceBenchmarks(p: ProductDTO) {
    if (!p.price) return undefined;
    const currency = p.currency;
    // Placeholder heuristic ±10%
    const median = p.price;
    const low = Math.round(p.price * 0.9);
    const high = Math.round(p.price * 1.1);
    return { median, low, high, currency };
  }

  private buildAlternatives(p: ProductDTO): AlternativeItem[] | undefined {
    if (!p.title) return undefined;
    // Placeholder mock alternatives: sau này thay bằng search marketplace
    const title = p.title;
    const currency = p.currency || 'VND';
    const base = p.price || 0;
    const alt: AlternativeItem[] = [
      { title: `${title} (phiên bản cũ)`, price: base ? Math.max(0, Math.round(base * 0.85)) : undefined, currency, score: Math.max(0, this.calcScore(p) - 5) },
      { title: `${title} (đối thủ)`, price: base ? Math.round(base * 0.95) : undefined, currency, score: Math.max(0, this.calcScore(p) - 3) },
    ];
    return alt;
  }

  private buildActions(p: ProductDTO): ActionsDTO {
    return {
      buyUrl: p.finalUrl,
      trackPrice: true,
    };
  }

  async summarizeProsCons(p: ProductDTO) {
    if (!this.gemini) {
      // Cho phép bypass OpenAI khi bật fallback
      if (process.env.ANALYZE_FALLBACK === '1') {
        return { pros: [], cons: [], summary: undefined, confidence: 0.5 };
      }
      throw new ServiceUnavailableException('Missing GOOGLE_API_KEY');
    }

    const reviewsText = (p.reviewsSample || [])
      .map(r => `- (${r.rating ?? 'n/a'}★) ${r.text}`)
      .slice(0, 30) // giới hạn để tiết kiệm token
      .join('\n');

    const base = `${p.title || ''}\n\n${(p.description || '').slice(0, 1500)}\n\nReviews:\n${reviewsText}`;
    const prompt = `
Bạn là trợ lý đánh giá sản phẩm. Dựa trên thông tin sau, hãy tạo:
- pros: 3–6 gạch đầu dòng (ngắn, khách quan)
- cons: 3–6 gạch đầu dòng (rủi ro/nhược điểm khả dĩ)
- summary: 1–2 câu tóm tắt
- confidence: số 0..1 mức tự tin
Nếu thiếu dữ liệu, suy luận hợp lý theo phân khúc (và ghi rõ "có thể").
Trả về JSON: {"pros":[],"cons":[],"summary":"","confidence":0}

Thông tin:
${base}
`;

    try {
      const model = this.gemini.getGenerativeModel({
        model: this.modelName,
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      });
      const resp = await model.generateContent(prompt);
      const text = resp?.response?.text?.() ?? '';
      try {
        const parsed = JSON.parse(text || '{}');
        return {
          pros: parsed.pros || [],
          cons: parsed.cons || [],
          summary: typeof parsed.summary === 'string' ? parsed.summary : undefined,
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : undefined,
        };
      } catch {
        return { pros: [], cons: [], summary: undefined, confidence: undefined };
      }
    } catch (e: any) {
      // Fallback đường tắt khi quota/ lỗi tạm thởi
      if (process.env.ANALYZE_FALLBACK === '1') {
        return { pros: [], cons: [], summary: undefined, confidence: 0.5 };
      }

      const status = e?.status ?? e?.response?.status ?? e?.response?.statusCode;
      const msg = e?.message || 'Gemini request failed';
      if (status === 401) {
        throw new UnauthorizedException('Gemini unauthorized: kiểm tra GOOGLE_API_KEY');
      }
      if (status === 429) {
        throw new HttpException('Gemini quota exceeded (429): kiểm tra plan/billing', HttpStatus.TOO_MANY_REQUESTS);
      }
      throw new BadRequestException(`Gemini error: ${msg}`);
    }
  }

  async decisionAndReviewInsights(p: ProductDTO, baseAnalysis: Pick<AnalysisDTO, 'goodCheapScore' | 'pros' | 'cons' | 'redFlags' | 'summary'>) {
    // Fallback rule-based khi không dùng OpenAI
    if (!this.gemini || process.env.ANALYZE_FALLBACK === '1') {
      return {
        decision: this.ruleVerdict(baseAnalysis.goodCheapScore, baseAnalysis.redFlags),
        reviewInsights: {
          positives: baseAnalysis.pros || [],
          negatives: baseAnalysis.cons || [],
        },
      };
    }

    const context = {
      title: p.title,
      price: p.price,
      currency: p.currency,
      ratingAvg: p.ratingAvg,
      reviewCount: p.reviewCount,
      shopName: p.shopName,
      summary: baseAnalysis.summary,
      pros: baseAnalysis.pros,
      cons: baseAnalysis.cons,
      redFlags: baseAnalysis.redFlags,
    };
    const prompt = `Bạn là cố vấn mua sắm. Hãy dựa vào dữ liệu sau để quyết định có nên mua sản phẩm hay không.
Trả về JSON đúng schema:
{"decision":{"verdict":"buy|consider|avoid","rationale":["..."]},"reviewInsights":{"positives":["..."],"negatives":["..."],"commonComplaints":["..."]}}

Nguyên tắc:
- "buy" khi ưu điểm rõ ràng, rủi ro thấp, điểm tổng cao.
- "consider" khi còn thiếu thông tin, một vài rủi ro có thể chấp nhận.
- "avoid" khi rủi ro cao, điểm thấp, hoặc thông tin đáng ngờ.
- Rationale ngắn gọn, dựa vào các gạch đầu dòng và số liệu.
` + (p.reviewsSample?.length ? `\nMột số review mẫu:\n${p.reviewsSample.slice(0,20).map(r=>`- (${r.rating??'n/a'}★) ${r.text}`).join('\n')}` : '') + `
`;

    try {
      const model = this.gemini.getGenerativeModel({
        model: this.modelName,
        generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
      });
      const resp = await model.generateContent(prompt);
      const text = resp?.response?.text?.() ?? '';
      const parsed = JSON.parse(text || '{}');
      return {
        decision: parsed.decision || this.ruleVerdict(baseAnalysis.goodCheapScore, baseAnalysis.redFlags),
        reviewInsights: parsed.reviewInsights || { positives: baseAnalysis.pros, negatives: baseAnalysis.cons },
      };
    } catch (e: any) {
      if (process.env.ANALYZE_FALLBACK === '1') {
        return {
          decision: this.ruleVerdict(baseAnalysis.goodCheapScore, baseAnalysis.redFlags),
          reviewInsights: { positives: baseAnalysis.pros, negatives: baseAnalysis.cons },
        };
      }
      const status = e?.status ?? e?.response?.status ?? e?.response?.statusCode;
      const msg = e?.message || 'Gemini request failed';
      if (status === 401) {
        throw new UnauthorizedException('Gemini unauthorized: kiểm tra GOOGLE_API_KEY');
      }
      if (status === 429) {
        throw new HttpException('Gemini quota exceeded (429): kiểm tra plan/billing', HttpStatus.TOO_MANY_REQUESTS);
      }
      throw new BadRequestException(`Gemini error: ${msg}`);
    }
  }

  private async buildAspects(p: ProductDTO) {
    // Fallback rule khi không có OpenAI hoặc không có reviews
    const simpleFromProsCons = (pros: string[], cons: string[]) => ([
      { name: 'Tổng quan', pros, cons, positiveQuotes: [], negativeQuotes: [] },
    ]);

    if (!this.gemini || process.env.ANALYZE_FALLBACK === '1' || !(p.reviewsSample?.length)) {
      // Dựa vào summarizeProsCons để ra 1 khối mặc định
      const { pros, cons } = await this.summarizeProsCons(p);
      return simpleFromProsCons(pros, cons);
    }

    const reviews = p.reviewsSample.slice(0, 40).map(r => ({ rating: r.rating, text: r.text })).filter(r => r.text?.trim());
    const prompt = `Hãy phân tích các review dưới đây và chia theo các khía cạnh phổ biến (ví dụ: Chất âm, Pin, Độ bền, Kết nối, Hậu mãi, Đóng gói...).\nMỗi khía cạnh xuất ra JSON:\n{"name":"","pros":[],"cons":[],"positiveQuotes":[],"negativeQuotes":[]}\nLưu ý: quotes là trích dẫn nguyên văn ngắn từ review. Trả về JSON mảng aspects.`;

    try {
      const model = this.gemini.getGenerativeModel({
        model: this.modelName,
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      });
      const resp = await model.generateContent(
        `${prompt}\n\nReviews:\n${reviews.map(r=>`- (${r.rating??'n/a'}★) ${r.text}`).join('\n')}`
      );
      const text = resp?.response?.text?.() ?? '';
      const parsed = JSON.parse(text || '{}');
      const aspects = Array.isArray(parsed) ? parsed : parsed.aspects;
      if (Array.isArray(aspects)) return aspects;
      return simpleFromProsCons([], []);
    } catch (e: any) {
      if (process.env.ANALYZE_FALLBACK === '1') {
        const { pros, cons } = await this.summarizeProsCons(p);
        return simpleFromProsCons(pros, cons);
      }
      const status = e?.status ?? e?.response?.status ?? e?.response?.statusCode;
      const msg = e?.message || 'Gemini request failed';
      if (status === 401) {
        throw new UnauthorizedException('Gemini unauthorized: kiểm tra GOOGLE_API_KEY');
      }
      if (status === 429) {
        throw new HttpException('Gemini quota exceeded (429): kiểm tra plan/billing', HttpStatus.TOO_MANY_REQUESTS);
      }
      throw new BadRequestException(`Gemini error: ${msg}`);
    }
  }

  private buildReviewHighlights(p: ProductDTO): { positive: ReviewItem[]; negative: ReviewItem[] } | undefined {
    const list = p.reviewsSample || [];
    if (!list.length) return undefined;

    const sorter = (a: ReviewItem, b: ReviewItem) => {
      const ai = (a.images?.length || 0) > 0 ? 1 : 0;
      const bi = (b.images?.length || 0) > 0 ? 1 : 0;
      if (ai !== bi) return bi - ai; // ưu tiên có ảnh
      const ah = a.helpfulCount || 0;
      const bh = b.helpfulCount || 0;
      if (ah !== bh) return bh - ah; // ưu tiên nhiều vote hữu ích
      const ar = a.rating ?? 0;
      const br = b.rating ?? 0;
      return br - ar; // mặc định ưu tiên rating cao cho nhóm positive
    };

    const positives = list
      .filter(r => (r.rating ?? 0) >= 4)
      .sort(sorter)
      .slice(0, 3);

    const negatives = list
      .filter(r => (r.rating ?? 0) <= 2)
      .sort((a, b) => {
        // với negative ưu tiên rating thấp
        const ai = (a.images?.length || 0) > 0 ? 1 : 0;
        const bi = (b.images?.length || 0) > 0 ? 1 : 0;
        if (ai !== bi) return bi - ai;
        const ah = a.helpfulCount || 0;
        const bh = b.helpfulCount || 0;
        if (ah !== bh) return bh - ah;
        const ar = a.rating ?? 6;
        const br = b.rating ?? 6;
        return ar - br; // rating thấp trước
      })
      .slice(0, 3);

    return { positive: positives, negative: negatives };
  }

  async analyzeProduct(p: ProductDTO): Promise<AnalysisDTO> {
    // Tự động lấy reviews từ URL nếu chưa có
    if (!p.reviewsSample?.length) {
      const extractedReviews = await this.reviewsService.extractReviews(p);
      if (extractedReviews.length > 0) {
        p.reviewsSample = extractedReviews;
      }
    }

    const goodCheapScore = this.calcScore(p);
    const { pros, cons, summary, confidence } = await this.summarizeProsCons(p);
    const redFlags = this.detectRedFlags(p);
    const priceBenchmarks = this.buildPriceBenchmarks(p);

    const { decision, reviewInsights } = await this.decisionAndReviewInsights(p, {
      goodCheapScore,
      pros,
      cons,
      redFlags,
      summary,
    });

    const aspects = await this.buildAspects(p);
    const reviewHighlights = this.buildReviewHighlights(p);

    return { goodCheapScore, pros, cons, redFlags, summary, confidence, priceBenchmarks, decision, reviewInsights, aspects, reviewHighlights };
  }

  // Public helpers cho controller
  getAlternatives(p: ProductDTO) {
    return this.buildAlternatives(p);
  }

  getActions(p: ProductDTO): ActionsDTO {
    return this.buildActions(p);
  }

  getCautions(p: ProductDTO, analysis: AnalysisDTO): string[] | undefined {
    // Tạm dựa trên redFlags và score thấp
    const cautions = new Set<string>();
    for (const f of analysis.redFlags) cautions.add(f);
    if (analysis.goodCheapScore < 50) cautions.add('Điểm thấp, cân nhắc so sánh thêm');
    return Array.from(cautions);
  }

  private ruleVerdict(score: number, redFlags: string[]) {
    let verdict: 'buy' | 'consider' | 'avoid';
    if (score >= 75 && redFlags.length === 0) verdict = 'buy';
    else if (score >= 55) verdict = 'consider';
    else verdict = 'avoid';

    const rationale: string[] = [];
    rationale.push(`Điểm tổng: ${score}/100`);
    if (redFlags.length) rationale.push(`Rủi ro: ${redFlags.join('; ')}`);
    return { verdict, rationale };
  }
}
