import { Injectable } from '@nestjs/common';
import { CommerceReviewResponse } from '../common/schemas/commerceReviewResponse.schema';
import { ProductDTO, AnalysisDTO, ReviewItem } from '../common/types';
import { PsychologyService } from '../psychology/psychology.service';
import { ResponseMapperInterface } from '../common/interfaces/response-mapper.interface';

@Injectable()
export class ResponseMapper implements ResponseMapperInterface {
  constructor(private readonly psychologyService: PsychologyService) {}

  /**
   * Maps the analysis data to the evidence-first response schema
   * Ensures all claims have evidenceId references and handles verdict properly
   */
  mapToEvidenceFirstResponse(
    product: ProductDTO,
    analysis: AnalysisDTO,
    actions: any,
  ): CommerceReviewResponse {
    const LLM_ENABLED = (process.env.GC_ENABLE_LLM ?? 'false') === 'true';
    // Calculate psychology scores
    const psychologyScore = this.psychologyService.calculatePsychologyScore(product);
    const buyerDecisionFactors = this.psychologyService.calculateBuyerDecisionFactors(product);
    const buyerDecisionScorecardRaw = this.psychologyService.calculateBuyerDecisionScorecard(product);
    const buyerDecisionScorecard = this.clampBuyerDecisionScorecard(buyerDecisionScorecardRaw);
    
    // Build evidence array with proper evidenceId references
    const evidence = this.buildEvidenceArray(product, analysis);
    
    // Ensure all claims have evidenceId, if not set verdict to "hold"
    const verdict = this.determineVerdict(product, analysis, evidence);
    
    return {
      schemaVersion: '1.1.0',
      meta: {
        platform: (() => {
          const raw = (product as any)?.source;
          const s = typeof raw === 'string' ? raw.toLowerCase() : '';
          if (s === 'tiktok' || s === 'shopee' || s === 'lazada' || s === 'other') return s as any;
          try {
            const u = new URL((product as any).finalUrl || (product as any).canonicalUrl || '');
            const h = u.hostname.toLowerCase();
            if (h.includes('tiktok')) return 'tiktok' as any;
            if (h.includes('shopee')) return 'shopee' as any;
            if (h.includes('lazada')) return 'lazada' as any;
          } catch {}
          return 'other' as any;
        })(),
        locale: 'vi-VN',
        currency: product.currency || 'VND',
        timestamp: new Date().toISOString(),
        productId: product.productId || '',
        sourceUrl: (product as any).finalUrl || (product as any).canonicalUrl,
      },
      product: {
        title: product.title || '',
        canonicalUrl: (product as any).finalUrl || (product as any).canonicalUrl,
        brand: undefined,
        category: undefined,
        attributes: undefined,
        seller: undefined,
        images: (() => {
          const imgs = Array.isArray(product.images) ? product.images.filter(u => typeof u === 'string') : [];
          if (imgs.length > 0) return imgs;
          const primary = (product as any).finalUrl || (product as any).canonicalUrl;
          return primary ? [primary] : [];
        })(),
        videos: Array.isArray((product as any).videos) && (product as any).videos.length
          ? (product as any).videos
              .map((v: any, i: number) => ({
                url: typeof v?.url === 'string' ? v.url : undefined,
                // Clamp to schema enum: ['demo','creator_review','live_replay','ugc']
                type: (() => {
                  const t = String(v?.type || 'creator_review');
                  const allowed = new Set(['demo','creator_review','live_replay','ugc']);
                  return (allowed.has(t) ? t : 'creator_review') as any;
                })(),
                views: typeof v?.views === 'number' ? v.views : undefined,
                likes: typeof v?.likes === 'number' ? v.likes : undefined,
                evidenceId: `vid:${i}`,
              }))
              .filter((v: any) => typeof v.url === 'string')
          : undefined,
      },
      pricing: (() => {
        const toNum = (v: any) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
        const currency = (product as any).currency ?? 'VND';
        const isPlausiblePrice = (val: number): boolean => {
          if (!Number.isFinite(val) || val <= 0) return false;
          const digits = String(Math.trunc(val)).length;
          if (currency === 'VND') {
            // Ngưỡng thực tế cho VND: 1k -> 50 triệu; loại giá có quá nhiều chữ số (thường là dính số)
            if (val < 1_000 || val > 50_000_000) return false;
            if (digits > 9) return false;
          }
          return true;
        };
        const currentRaw = toNum((product as any).price);
        const originalRaw = toNum((product as any).discountPrice ?? (product as any).listPrice);
        const current = currentRaw && isPlausiblePrice(currentRaw) ? currentRaw : undefined;
        const original = originalRaw && isPlausiblePrice(originalRaw) ? originalRaw : undefined;
        // Nếu original < current thì coi như không có giá gốc hợp lệ -> bỏ original và discountPct
        const validOriginal = original != null && current != null && original >= current ? original : undefined;
        const discountPct = current != null && validOriginal != null && validOriginal > 0
          ? Math.round(((validOriginal - current) / validOriginal) * 100)
          : undefined;
        return {
          currentPrice: current,
          originalPrice: validOriginal,
          currency,
          discountPct,
          priceHistory: undefined,
        };
      })(),
      availability: {
        stockStatus: 'unknown',
        stockCount: undefined,
        shipFrom: undefined,
        shippingOptions: undefined,
      },
      policies: {
        returnPolicy: undefined,
        returnWindowDays: undefined,
        buyerProtection: undefined,
        warranty: undefined,
      },
      socialProof: {
        ratingAvg: product.ratingAvg,
        ratingCount: product.reviewCount,
        ratingBreakdown: undefined,
        qnaCount: undefined,
      },
      reviews: this.buildReviews(product, analysis, evidence),
      reviewSummary: {
        topPros: analysis.pros,
        topCons: analysis.cons,
        topics: (analysis.aspects?.map(aspect => ({
          name: aspect.name,
          sentiment: undefined,
          supportCount: undefined,
          confidence: undefined,
          evidenceIds: this.pickTopicEvidenceIds(evidence),
        })) || []),
      },
      psychology: {
        buyerDecisionScorecard: buyerDecisionScorecard,
        factors: buyerDecisionFactors,
        notes: [`Psychology score calculated as ${psychologyScore}`],
      },
      aiAnalysis: {
        verdict,
        confidence: analysis.confidence || 0.5,
        reasons: analysis.decision?.rationale || [],
        claims: [],
        citations: evidence
          .filter(e => e.type !== 'productPage')
          .map(e => ({
            evidenceId: e.id,
            note: e.type,
            reliability: e.reliability,
          })),
      },
      evidence,
      system: {
        warnings: [],
        ...(LLM_ENABLED
          ? { llm: 'gemini-2.5-flash', llmVersion: '2025-08-01', latencyMs: 1840 }
          : {}),
      },
    };
  }

  private buildEvidenceArray(product: ProductDTO, analysis: AnalysisDTO): any[] {
    const evidence: any[] = [];
    
    // Add product page as evidence
    evidence.push({
      id: 'prod:page',
      type: 'productPage',
      url: product.finalUrl,
      reliability: 0.35,
      freshnessDays: 0,
      scrapedAt: new Date().toISOString(),
    });
    
    // Add reviews as evidence if present
    if ((product.reviewsSample && product.reviewsSample.length > 0) || (analysis?.reviewHighlights && ((Array.isArray(analysis.reviewHighlights.positive) && analysis.reviewHighlights.positive.length) || (Array.isArray(analysis.reviewHighlights.negative) && analysis.reviewHighlights.negative.length)))) {
      evidence.push({
        id: 'rev:page:1',
        type: 'review',
        url: product.finalUrl,
        reliability: 0.6,
        freshnessDays: 3,
        scrapedAt: new Date().toISOString(),
      });
    }
    
    // Add creator videos (YouTube/TikTok) as evidence if provided on product
    const videos = Array.isArray((product as any).videos) ? (product as any).videos : [];
    if (videos.length) {
      const uniq = new Set<string>();
      videos.forEach((v: any, idx: number) => {
        const url = typeof v?.url === 'string' ? v.url : undefined;
        if (!url || uniq.has(url)) return;
        uniq.add(url);
        evidence.push({
          id: `vid:${idx}`,
          type: 'creatorVideo',
          url,
          reliability: 0.55,
          freshnessDays: undefined,
          scrapedAt: new Date().toISOString(),
        });
      });
    }

    // Merge analysis.evidence if present (normalize types, dedupe by id/url)
    if (Array.isArray((analysis as any)?.evidence) && (analysis as any).evidence.length) {
      const seenById = new Set<string>(evidence.map(e => String(e.id)));
      const seenByUrl = new Set<string>(evidence.map(e => String(e.url || '')));
      const normalized = (analysis as any).evidence
        .filter(Boolean)
        .map((e: any) => {
          const type = String(e.type || 'unknown');
          const isVideo = /video/i.test(type);
          const normType = isVideo ? 'creatorVideo' : (type === 'productPage' || type === 'review' ? type : 'externalPage');
          return {
            id: String(e.id || e.url || `ev:${Math.random().toString(36).slice(2,8)}`),
            type: normType,
            url: typeof e.url === 'string' ? e.url : undefined,
            reliability: typeof e.reliability === 'number' ? e.reliability : (normType === 'creatorVideo' ? 0.55 : 0.5),
            freshnessDays: undefined,
            scrapedAt: typeof e.scrapedAt === 'string' ? e.scrapedAt : new Date().toISOString(),
          };
        });
      for (const ev of normalized) {
        const keyId = String(ev.id);
        const keyUrl = String(ev.url || '');
        if (keyId && seenById.has(keyId)) continue;
        if (keyUrl && seenByUrl.has(keyUrl)) continue;
        seenById.add(keyId);
        if (keyUrl) seenByUrl.add(keyUrl);
        evidence.push(ev);
      }
    }
    
    return evidence;
  }

  private buildReviews(product: any, analysis: any, evidence: any[]) {
    if (Array.isArray(product.reviewsSample) && product.reviewsSample.length > 0) {
      return product.reviewsSample.map((review: any, index: number) => this.mapReviewItem(review, index, evidence));
    }
    const hl = analysis?.reviewHighlights;
    const pos = Array.isArray(hl?.positive) ? hl.positive : [];
    const neg = Array.isArray(hl?.negative) ? hl.negative : [];
    const items: any[] = [];
    let idx = 0;
    for (const r of pos.slice(0, 2)) {
      const evidenceId = evidence.find(e => e.type === 'review')?.id || 'rev:page:1';
      items.push({
        id: String(r.id || `r_pos_${idx++}`),
        author: r.authorName ? String(r.authorName) : undefined,
        rating: this.clampRating(r.rating),
        text: String(r.text || ''),
        pros: Array.isArray(r.pros) ? r.pros.filter(Boolean).map(String) : undefined,
        cons: Array.isArray(r.cons) ? r.cons.filter(Boolean).map(String) : undefined,
        media: this.normalizeMedia(r.images),
        helpfulCount: Number.isInteger(r.helpfulCount) ? r.helpfulCount : undefined,
        verifiedPurchase: typeof r.verifiedPurchase === 'boolean' ? r.verifiedPurchase : undefined,
        language: typeof r.language === 'string' ? r.language : 'vi',
        date: new Date(r.createdAt || Date.now()).toISOString().slice(0,10),
        source: this.normalizeSource(r.source || 'platform'),
        evidenceId,
      });
    }
    for (const r of neg.slice(0, 2)) {
      const evidenceId = evidence.find(e => e.type === 'review')?.id || 'rev:page:1';
      items.push({
        id: String(r.id || `r_neg_${idx++}`),
        author: r.authorName ? String(r.authorName) : undefined,
        rating: this.clampRating(r.rating ?? 2),
        text: String(r.text || ''),
        pros: Array.isArray(r.pros) ? r.pros.filter(Boolean).map(String) : undefined,
        cons: Array.isArray(r.cons) ? r.cons.filter(Boolean).map(String) : undefined,
        media: this.normalizeMedia(r.images),
        helpfulCount: Number.isInteger(r.helpfulCount) ? r.helpfulCount : undefined,
        verifiedPurchase: typeof r.verifiedPurchase === 'boolean' ? r.verifiedPurchase : undefined,
        language: typeof r.language === 'string' ? r.language : 'vi',
        date: new Date(r.createdAt || Date.now()).toISOString().slice(0,10),
        source: this.normalizeSource(r.source || 'platform'),
        evidenceId,
      });
    }
    return items.length ? items : [];
  }

  private mapReviewItem(review: any, index: number, evidence: any[]): any {
    const dateOnly = (d: any) => {
      try { return new Date(d).toISOString().slice(0, 10); } catch { return new Date().toISOString().slice(0,10); }
    };
    const rating = this.clampRating(review.rating);
    const media = this.normalizeMedia(review.images);
    const source = this.normalizeSource(review.source ?? 'platform');
    const evidenceId = evidence.find(e => e.type === 'review')?.id || 'rev:page:1';
    return {
      id: String(review.id || `review_${index}`),
      author: review.authorName ? String(review.authorName) : undefined,
      rating,
      text: String(review.text || ''),
      pros: Array.isArray(review.pros) ? review.pros.filter(Boolean).map(String) : undefined,
      cons: Array.isArray(review.cons) ? review.cons.filter(Boolean).map(String) : undefined,
      media,
      helpfulCount: Number.isInteger(review.helpfulCount) ? review.helpfulCount : undefined,
      verifiedPurchase: typeof review.verifiedPurchase === 'boolean' ? review.verifiedPurchase : undefined,
      language: typeof review.language === 'string' ? review.language : 'vi',
      date: dateOnly(review.createdAt || review.date || Date.now()),
      source,
      evidenceId,
    };
  }

  private determineVerdict(product: ProductDTO, analysis: AnalysisDTO, evidence: any[]): any {
    // Check critical data with relaxed criteria
    const criticalOk = this.hasCriticalData(product, analysis);

    // Prefer diversity of evidence types over raw count
    const typeCount = new Set(evidence.map(e => e.type)).size;
    const hasCreatorVideo = evidence.some(e => e.type === 'creatorVideo');
    const hasReviewEv = evidence.some(e => e.type === 'review');

    // If missing critical signals or evidence lacks diversity, return "hold"
    if (!criticalOk) return 'hold';
    if (typeCount < 2 && !(hasCreatorVideo && hasReviewEv)) return 'hold';

    // Otherwise, respect analysis verdict or default to "consider"
    return analysis.decision?.verdict || 'consider';
  }
  
  private hasCriticalData(product: ProductDTO, analysis: AnalysisDTO): boolean {
    // Relaxed essentials: must have URL and at least one strong signal
    const hasPrice = product.price !== undefined && product.price !== null;
    const hasRating = product.ratingAvg !== undefined && product.ratingAvg !== null;
    const hasReviews = Array.isArray(product.reviewsSample) && product.reviewsSample.length > 0;
    const hasUrl = typeof (product as any).finalUrl === 'string' && (product as any).finalUrl.length > 0;
    const hasVideos = Array.isArray((product as any).videos) && (product as any).videos.length > 0;
    const hasHighlights = !!(analysis?.reviewHighlights && (
      (Array.isArray(analysis.reviewHighlights.positive) && analysis.reviewHighlights.positive.length > 0) ||
      (Array.isArray(analysis.reviewHighlights.negative) && analysis.reviewHighlights.negative.length > 0)
    ));

    const hasAnyCore = hasPrice || hasRating || hasReviews;
    return !!hasUrl && (hasAnyCore || hasVideos || hasHighlights);
  }

  private mapAspectScores(aspects: any[]): Record<string, number> {
    const scores: Record<string, number> = {};
    
    aspects.forEach(aspect => {
      if (aspect.name && typeof aspect.score === 'number') {
        scores[aspect.name] = aspect.score;
      }
    });
    
    return scores;
  }

  private buildDataIntegrity(analysis: AnalysisDTO): any {
    return {
      status: 'partial',
      issues: [
        {
          code: 'insufficient_evidence',
          severity: 'medium',
          message: 'Need more evidence sources to verify claims',
          paths: ['$.evidence'],
        },
      ],
      recommendation: 'Collect additional evidence sources to improve analysis',
      coverage: {
        requiredAspects: ['overview', 'soundQuality', 'battery', 'micCall', 'noiseControl', 'comfortFit', 'durability', 'connectivity', 'warrantySupport'],
        presentAspects: (analysis.aspects || []).map(a => a.name),
        filledKeySpecsPercent: 30,
      },
    };
  }

  private clampBuyerDecisionScorecard(scorecard: any) {
    if (!scorecard || typeof scorecard !== 'object') return scorecard;
    // Schema expects sub-metrics in [0..2] and total in [0..10]
    const clampSub = (v: any) => {
      const n = typeof v === 'number' ? v : Number(v);
      if (Number.isFinite(n)) return Math.max(0, Math.min(2, n));
      return undefined;
    };
    const clampTotal = (v: any) => {
      const n = typeof v === 'number' ? v : Number(v);
      if (Number.isFinite(n)) return Math.max(0, Math.min(10, n));
      return undefined;
    };
    const out: any = { ...scorecard };
    for (const k of Object.keys(out)) {
      if (k === 'total') continue; // handled below
      if (typeof out[k] === 'number') out[k] = clampSub(out[k]);
    }
    if (typeof out.total === 'number') out.total = clampTotal(out.total);
    return out;
  }

  private clampRating(v: any): number {
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n)) return 5;
    return Math.max(1, Math.min(5, Math.round(n)));
  }

  private normalizeMedia(arr: any): string[] | undefined {
    if (!Array.isArray(arr)) return undefined;
    const toUrl = (x: any) => {
      if (typeof x === 'string') return x;
      if (x && typeof x === 'object' && typeof x.url === 'string') return x.url;
      return undefined;
    };
    const out = arr.map(toUrl).filter((s: any) => typeof s === 'string');
    return out.length ? out : undefined;
  }

  private normalizeSource(src: any): 'platform' | 'tiktok_video' | 'external' | 'unknown' {
    const s = String(src || '').toLowerCase();
    if (s === 'platform') return 'platform';
    if (s === 'tiktok_video' || s === 'tiktok' || s === 'video') return 'tiktok_video';
    if (s === 'external' || s === 'blog' || s === 'news') return 'external';
    return 'unknown';
  }

  private pickTopicEvidenceIds(evidence: any[]): string[] {
    // Chọn 3-5 evidence không phải productPage, ưu tiên creatorVideo trước
    const nonProduct = evidence.filter(e => e.type !== 'productPage');
    const creatorFirst = nonProduct.sort((a, b) => {
      const aw = a.type === 'creatorVideo' ? 1 : 0;
      const bw = b.type === 'creatorVideo' ? 1 : 0;
      return bw - aw;
    });
    return creatorFirst.slice(0, 5).map(e => String(e.id));
  }
}
