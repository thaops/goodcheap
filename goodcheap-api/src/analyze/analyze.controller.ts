import { Body, Controller, Post } from '@nestjs/common';
import { AnalyzeService } from './analyze.service';
import { UnfurlService } from '../unfurl/unfurl.service';
import { ProductDTO } from '../common/types';

@Controller('analyze')
export class AnalyzeController {
  constructor(
    private readonly analyze: AnalyzeService,
    private readonly unfurl: UnfurlService,
  ) {}

  /**
   * Body cho phép:
   * { url: "https://vt.tiktok.com/..." }
   *  hoặc
   * { product: ProductDTO }
   */
  @Post()
  async analyzeUrl(@Body() body: { url?: string; product?: ProductDTO }): Promise<any> {
    const product =
      body.product ?? (body.url ? await this.unfurl.fromUrl(body.url) : null);

    if (!product) {
      throw new Error('Require "url" or "product" in body');
    }

    const analysis = await this.analyze.analyzeProduct(product);
    const actions = this.analyze.getActions(product);

    const now = new Date().toISOString();
    const platform = this.platformFromUrl(product.finalUrl || '');
    const productId = this.productIdFromUrl(product.finalUrl || '');
    const currency = product.currency || 'VND';

    // Map product images -> [{url,...}]
    const images = (product.images || []).map((u: string) => ({ url: u }));

    // Seller mapping (best-effort from our fields)
    const seller = (product as any).shopName || (product as any).sellerName
      ? {
          name: (product as any).shopName || (product as any).sellerName,
          rating: product.ratingAvg,
          ratingCount: product.reviewCount,
          verified: undefined,
        }
      : undefined;

    // Basic price mapping
    const price = product.price
      ? { value: product.price, currency, collectedAt: now }
      : undefined;

    // Static rubric weights (can be tuned later)
    const rubricWeights = {
      soundQuality: 0.25,
      battery: 0.15,
      micCall: 0.15,
      noiseControl: 0.1,
      comfortFit: 0.1,
      durability: 0.1,
      connectivity: 0.1,
      warrantySupport: 0.05,
    } as const;

    const originalUrl = product.finalUrl || '';
    const cleanUrl = this.canonicalizeUrl(originalUrl);

    let mappedAspects = (analysis.aspects || []).map((a: any) => {
      // Đồng bộ khóa máy–người
      const normalizedName = this.normalizeAspectName(a.name);
      const viLabel = a.name === 'Tổng quan' ? 'Tổng quan' : (a.label || a.name || normalizedName || 'Tổng quan');
      return {
        name: normalizedName || 'overview',
        label: viLabel,
        importanceWeight: (rubricWeights as any)[a.name] ?? undefined,
        metrics: this.defaultMetricsForAspect(normalizedName || 'overview'),
        score: a.score,
        confidence: analysis.confidence ?? undefined,
        pros: a.pros || [],
        cons: a.cons || [],
        prosDetailed: Array.isArray(a.pros) ? a.pros.map((p: string) => ({ text: p })) : [],
        consDetailed: Array.isArray(a.cons) ? a.cons.map((c: string) => ({ text: c })) : [],
        risks: [],
        improvements: [],
        fitFor: [],
        tradeOffs: [],
        evidenceIds: [],
        quotes: (a.positiveQuotes || a.negativeQuotes)
          ? [
              ...(a.positiveQuotes || []).map((t: string) => ({ text: t })),
              ...(a.negativeQuotes || []).map((t: string) => ({ text: t })),
            ]
          : [],
      };
    });
    const requiredAspectKeys = ['overview','soundQuality','battery','micCall','noiseControl','comfortFit','durability','connectivity','warrantySupport'];
    mappedAspects = this.alignAspectsToRubric(mappedAspects, requiredAspectKeys);
    // Evidence Binding: reduce confidence if pros/cons lack evidenceIds
    mappedAspects = mappedAspects.map(a => {
      const hasClaims = (a.pros?.length || 0) + (a.cons?.length || 0) > 0;
      if (hasClaims && (!a.evidenceIds || a.evidenceIds.length === 0)) {
        a.confidence = Math.min(a.confidence ?? 1, 0.55);
      }
      return a;
    });

    // Evidence: at least the product page itself
    const evidence = (originalUrl)
      ? [
          {
            id: 'prod:page',
            type: 'productPage',
            source: platform || 'web',
            url: originalUrl, // giữ link gốc (có thể có tracking)
            fetchedAt: now,
            reliability: 0.6,
            snippet: (product.description || '').slice(0, 180) || undefined,
            notes: 'Trang sản phẩm, có khả năng thiên vị.',
          },
        ]
      : [];

    // Analysis summary mapping
    const summary = analysis.summary || undefined;

    // Build data integrity + gate verdict
    const overallScore = analysis.goodCheapScore;
    const rawVerdict = (analysis as any).decision?.verdict as string | undefined;
    const rawReasons = ((analysis as any).decision?.rationale || []) as string[];
    const reasons = this.sanitizeReasons(rawReasons);
    const requiredAspects = requiredAspectKeys;
    const dataIntegrity = this.buildDataIntegrity({
      overallScore,
      verdict: rawVerdict,
      reasons,
      aspects: mappedAspects,
      requiredAspects,
      productUrl: originalUrl,
      canonicalUrl: cleanUrl,
      buyUrl: actions.buyUrl,
      citationsCount: evidence.length,
    });
    let finalVerdict: 'buy'|'consider'|'avoid'|'hold' = (rawVerdict as any) || 'consider';
    if (overallScore < 60 || dataIntegrity.status !== 'valid') {
      finalVerdict = 'hold';
    }

    // Chuẩn hóa citations: object { evidenceId, note, quote? }
    const citations = evidence.map(e => ({ evidenceId: e.id, note: 'Nguồn tham chiếu' }));

    return {
      schemaVersion: '1.0.0',
      meta: {
        locale: 'vi-VN',
        currency,
        timestamp: now,
        runId: undefined,
        platform,
        productId,
      },
      product: {
        title: product.title,
        canonicalUrl: cleanUrl,
        images,
        seller: seller || { name: undefined, rating: undefined, ratingCount: undefined, verified: undefined },
        price,
        rating: product.ratingAvg ? { value: product.ratingAvg, count: product.reviewCount } : undefined,
        specs: (product as any).specs || { ipRating: undefined, codec: undefined, driverSize: undefined, battery: undefined },
        warranty: (product as any).warranty || undefined,
        returnPolicy: (product as any).returnPolicy || undefined,
        claims: Array.isArray((product as any).claims) ? (product as any).claims.map((t: string) => ({ text: t, verified: false })) : [],
      },
      aiAnalysis: {
        model: process.env.ANALYZE_MODEL || 'gemini-1.5-flash',
        method: ['rubric-scoring', 'aspect-sentiment'],
        hallucinationRisk: 'medium',
        biasNotes: 'Nguồn sản phẩm có thiên vị; đã yêu cầu evidence cho pros/cons.',
        limitations: 'Không phải phép đo lab; phụ thuộc dữ liệu công khai.',
        citations,
        confidenceDrivers: [
          evidence.length <= 1 ? 'Chỉ có trang bán, thiếu review độc lập' : 'Có từ 2 nguồn trở lên',
          mappedAspects.some(a => (a.pros?.length||0)+(a.cons?.length||0)>0 && (!a.evidenceIds || a.evidenceIds.length===0)) ? 'Một số pros/cons thiếu evidence' : 'Pros/cons đã gắn evidence',
        ],
      },
      evidence,
      rubric: {
        weights: rubricWeights,
        scoringScale: '0-5',
        formula: 'overall = SUM((score/5)*weight) * 100',
      },
      aspects: mappedAspects,
      scoring: {
        aspectScores: this.buildAspectScores(mappedAspects, rubricWeights),
      },
      analysis: {
        overallScore: overallScore,
        confidence: analysis.confidence ?? undefined,
        topDrivers: this.buildAspectScores(mappedAspects, rubricWeights)
          .filter(s => s.name !== 'overview')
          .map(s => ({ name: s.name, contribution: s.contribution }))
          .sort((a,b) => (b.contribution??0) - (a.contribution??0))
          .slice(0,3),
        summary: summary || 'Dữ liệu chưa đủ hoặc đang được xác minh.',
        coverage: { filledKeySpecsPercent: undefined },
      },
      decision: {
        verdict: finalVerdict,
        reasons,
        nextChecks: [],
      },
      dataIntegrity,
      statusMessage: dataIntegrity.status !== 'valid' ? {
        userFriendly: 'Dữ liệu hiện chưa nhất quán nên chúng tôi tạm dừng khuyến nghị mua. Sẽ cập nhật khi xác minh xong.',
        technical: 'DataIntegrityError: ' + dataIntegrity.issues.map(i=>i.code).join(', '),
      } : undefined,
      actions: {
        alerts: [
          { type: 'priceDrop', thresholdPercent: 10, currency, platform: platform || 'tiktok' },
          { type: 'ratingCount', minCount: 300, minAvg: 4.2 },
        ],
        buyUrl: actions.buyUrl,
      },
    };
  }

  private platformFromUrl(u: string | undefined): string | undefined {
    if (!u) return undefined;
    try {
      const h = new URL(u).hostname;
      if (h.includes('tiktok')) return 'tiktok';
      if (h.includes('shopee')) return 'shopee';
      if (h.includes('lazada')) return 'lazada';
      return h;
    } catch {
      return undefined;
    }
  }

  private productIdFromUrl(u: string | undefined): string | undefined {
    if (!u) return undefined;
    try {
      const url = new URL(u);
      // TikTok product id patterns
      const m = url.pathname.match(/product\/(\d+)/) || url.pathname.match(/(\d{6,})/);
      return m?.[1];
    } catch {
      return undefined;
    }
  }

  private canonicalizeUrl(u: string): string | undefined {
    if (!u) return undefined;
    try {
      const url = new URL(u);
      return `${url.origin}${url.pathname}`; // bỏ query/fragment (tracking)
    } catch {
      return u;
    }
  }

  private alignAspectsToRubric(aspects: any[], requiredNames: string[]) {
    if (!aspects || aspects.length === 0) return aspects;
    // Nếu có một mục "Tổng quan" duy nhất, vẫn giữ, nhưng ưu tiên tạo khung cho requiredNames nếu thiếu
    const names = new Set(aspects.map(a=> this.normalizeAspectName(a.name)));
    // Chuẩn hóa tên + label
    aspects = aspects.map(a => ({
      ...a,
      name: this.normalizeAspectName(a.name) || 'overview',
      label: a.name === 'Tổng quan' ? 'Tổng quan' : (a.label || a.name || 'Tổng quan'),
      metrics: a.metrics && a.metrics.length ? a.metrics : this.defaultMetricsForAspect(this.normalizeAspectName(a.name) || 'overview'),
    }));
    for (const n of requiredNames) {
      if (!names.has(n)) {
        const viMap: Record<string,string> = {
          overview: 'Tổng quan',
          soundQuality: 'Chất lượng âm thanh',
          battery: 'Thời lượng pin',
          micCall: 'Đàm thoại/MIC',
          noiseControl: 'Chống ồn',
          comfortFit: 'Đeo/thoải mái',
          durability: 'Độ bền',
          connectivity: 'Kết nối',
          warrantySupport: 'Bảo hành/Hỗ trợ',
        };
        aspects.push({ name: n, label: viMap[n] || n, metrics: this.defaultMetricsForAspect(n), pros: [], cons: [], evidenceIds: [], confidence: 0.5 });
      }
    }
    return aspects;
  }

  private normalizeAspectName(name?: string): string | undefined {
    if (!name) return undefined;
    const trimmed = name.trim();
    if (/^tổng quan$/i.test(trimmed)) return 'overview';
    // giữ nguyên các khóa tiếng Anh đã chuẩn
    return trimmed;
  }

  private defaultMetricsForAspect(name: string) {
    const metrics: Record<string, any[]> = {
      overview: [
        { key: 'valueForMoney', label: 'Giá trị/giá', direction: 'higherBetter', unit: 'ratio', target: { value: 0.7, unit: 'ratio' }, applicability: 'applicable' },
      ],
      soundQuality: [
        { key: 'detail', label: 'Chi tiết/độ tách lớp', direction: 'higherBetter', unit: 'ratio', target: { value: 0.7, unit: 'ratio' }, applicability: 'applicable' },
        { key: 'bassControl', label: 'Kiểm soát bass', direction: 'higherBetter', unit: 'ratio', target: { value: 0.6, unit: 'ratio' }, applicability: 'applicable' },
      ],
      battery: [
        { key: 'playbackHours', label: 'Giờ nghe', direction: 'higherBetter', unit: 'hour', target: { value: 6, unit: 'hour' }, applicability: 'applicable' },
      ],
      micCall: [
        { key: 'clarity', label: 'Độ rõ MIC', direction: 'higherBetter', unit: 'ratio', target: { value: 0.7, unit: 'ratio' }, applicability: 'applicable' },
      ],
      noiseControl: [
        { key: 'ancDepth', label: 'Độ triệt ồn (dB)', direction: 'higherBetter', unit: 'dB', target: { value: 20, unit: 'dB' }, applicability: 'unknown' },
      ],
      comfortFit: [
        { key: 'comfort', label: 'Độ thoải mái', direction: 'higherBetter', unit: 'ratio', target: { value: 0.7, unit: 'ratio' }, applicability: 'applicable' },
      ],
      durability: [
        { key: 'ipRating', label: 'Chuẩn IP', direction: 'matchBetter', unit: 'ip', target: ['IPX4','IP55'], applicability: 'applicable' },
      ],
      connectivity: [
        { key: 'latency', label: 'Độ trễ (ms)', direction: 'lowerBetter', unit: 'ms', target: { value: 100, unit: 'ms' }, applicability: 'applicable' },
        { key: 'codec', label: 'Codec', direction: 'matchBetter', unit: 'set', target: ['AAC','aptX'], applicability: 'applicable' },
      ],
      warrantySupport: [
        { key: 'warrantyMonths', label: 'Bảo hành (tháng)', direction: 'higherBetter', unit: 'month', target: { value: 12, unit: 'month' }, applicability: 'applicable' },
      ],
    };
    return metrics[name] || metrics.overview;
  }

  private buildAspectScores(aspects: any[], rubricWeights: Record<string, number>) {
    // scoreRaw: 0-5 nếu có; scoreWeighted = (scoreRaw/5) * weight; contribution = scoreWeighted
    return aspects.map(a => {
      const name = a.name;
      const weight = rubricWeights[name as keyof typeof rubricWeights] ?? 0;
      const scoreRaw = typeof a.score === 'number' ? a.score : undefined;
      const scoreWeighted = typeof scoreRaw === 'number' ? (scoreRaw / 5) * weight : undefined;
      const contribution = scoreWeighted;
      return { name, scoreRaw, scoreWeighted, weight, evidenceIds: a.evidenceIds || [], contribution, rationale: undefined };
    });
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
    // verdict consistency
    if (params.verdict === 'buy' && (params.overallScore ?? 0) <= 60) {
      issues.push({ code: 'verdict_inconsistent', severity: 'high', message: 'overallScore thấp nhưng verdict=buy', paths: ['$.analysis.overallScore','$.decision.verdict'] });
    }
    // aspects schema mismatch
    const names = new Set((params.aspects||[]).map(a=>a.name));
    const missing = params.requiredAspects.filter(n=>!names.has(n));
    if (missing.length) {
      issues.push({ code: 'aspects_schema_mismatch', severity: 'medium', message: `Thiếu khía cạnh: ${missing.join(', ')}`, paths: ['$.aspects','$.rubric.weights'] });
    }
    // missing evidence bindings (giữ invalid đến khi mỗi pros/cons có evidence)
    const hasClaimsNoEvidence = (params.aspects||[]).some(a => ((a.pros?.length||0)+(a.cons?.length||0))>0 && (!a.evidenceIds || a.evidenceIds.length===0));
    if (hasClaimsNoEvidence) {
      issues.push({ code: 'missing_evidence', severity: 'medium', message: 'Pros/cons thiếu evidenceIds', paths: ['$.aspects[*].pros','$.aspects[*].cons'] });
    }
    // invalid metric direction & mixed target types
    const validDirections = new Set(['higherBetter','lowerBetter','matchBetter']);
    for (const a of (params.aspects||[])) {
      if (Array.isArray(a.metrics)) {
        const dirInvalid = a.metrics.some((m: any) => m.direction && !validDirections.has(m.direction));
        if (dirInvalid) {
          issues.push({ code: 'invalid_metric_direction', severity: 'medium', message: `Hướng metric không hợp lệ ở ${a.name}`, paths: [`$.aspects[name=${a.name}].metrics[*].direction`] });
        }
        const types = new Set(a.metrics.map((m: any) => Array.isArray(m.target) ? 'array' : (m.target && typeof m.target === 'object' ? 'object' : typeof m.target)));
        if (types.size > 1) {
          issues.push({ code: 'mixed_target_types', severity: 'low', message: `Target có nhiều kiểu trong ${a.name}`, paths: [`$.aspects[name=${a.name}].metrics[*].target`] });
        }
      }
    }
    // empty citations
    if (!params.citationsCount || params.citationsCount <= 0) {
      issues.push({ code: 'empty_citations', severity: 'low', message: 'Thiếu citations trong aiAnalysis', paths: ['$.aiAnalysis.citations'] });
    }
    // buyUrl tracking được phép nhưng ghi chú cảnh báo
    try {
      if (params.buyUrl) {
        const u = new URL(params.buyUrl);
        if ((u.search && u.search.length > 1) || u.hash) {
          issues.push({ code: 'buy_url_has_tracking', severity: 'low', message: 'buyUrl chứa tham số tracking', paths: ['$.actions.buyUrl'] });
        }
      }
    } catch {}
    // category guard (tai nghe) dựa trên reasons lạc chủ đề
    const kw = /(màn hình|cảm biến|pin\s*\d+\s*ngày)/i;
    if ((params.reasons||[]).some(r=>kw.test(r))) {
      issues.push({ code: 'category_mismatch', severity: 'high', message: 'Reasons có từ khoá không thuộc tai nghe', paths: ['$.decision.reasons'] });
    }
    const status = issues.length ? 'invalid' : 'valid';
    return {
      status,
      issues,
      recommendation: status === 'valid' ? undefined : "Set verdict='hold' cho đến khi sửa dữ liệu và bổ sung evidence.",
      coverage: {
        requiredAspects: params.requiredAspects,
        presentAspects: Array.from(names),
        filledKeySpecsPercent: undefined,
      },
    };
  }

  private sanitizeReasons(reasons: string[]): string[] {
    if (!Array.isArray(reasons)) return [];
    const banned = [/\bmàn hình\b/i, /\bcảm biến\b/i, /\bpin\s*\d+\s*ngày\b/i];
    return reasons.filter(r => !banned.some(rx => rx.test(r || '')));
  }
}
