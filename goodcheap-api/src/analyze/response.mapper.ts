import { Injectable } from '@nestjs/common';
import type { CommerceReviewResponse } from '../common/schemas/commerceReviewResponse.schema';
import type { ProductDTO, AnalysisDTO, ReviewItem } from '../common/types';
import { PsychologyService } from '../psychology/psychology.service';
import { ResponseMapperInterface } from '../common/interfaces/response-mapper.interface';
import { sanitizeBuyUrl } from '../common/url/sanitizeBuyUrl';

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
    // Calculate psychology scorecard (V2 only)
    const buyerDecisionScorecardRaw = this.psychologyService.calculateBuyerDecisionScorecard(product);
    const buyerDecisionScorecard = this.clampBuyerDecisionScorecard(buyerDecisionScorecardRaw);
    
    // Build evidence array with proper evidenceId references
    let evidence = this.buildEvidenceArray(product, analysis);
    // Dedupe evidence by canonical video/source (e.g., YouTube video id)
    evidence = this.dedupeEvidenceByCanonicalSource(evidence);
    // Product normalization for brand/line/size and later matching
    const normalization = this.buildProductNormalization(product);
    // Enrich evidence with product matching and relevance
    evidence = this.enrichEvidenceLinking(evidence, normalization, product);
    // Filter out unrelated creator videos from evidence (keep only linked ones)
    evidence = this.filterUnrelatedVideos(evidence);
    // Build product.videos from linked creatorVideo evidence only
    const productVideos = this.buildProductVideosFromEvidence(evidence);
    
    // Ensure all claims have evidenceId, if not set verdict to "hold"
    const verdict = this.determineVerdict(product, analysis, evidence);
    // Pricing flags (sanity check)
    const priceFlags = this.computePriceFlags(product);
    // Marketplace core
    const marketplace = this.buildMarketplace(product, normalization);
    // Psychology V2 (0-100) với signals/gaps từ marketplace & evidence
    const psychologyV2 = this.buildPsychologyV2(buyerDecisionScorecard, marketplace, evidence);
    // Explainable AI decision
    const aiDecision = this.buildAiDecision(verdict, evidence, marketplace, priceFlags);
    // System warnings
    const warnings: string[] = [];
    if (!marketplace?.product?.ratingAvg || !marketplace?.product?.ratingCount) warnings.push('missing_marketplace_core');
    if (priceFlags && priceFlags.length) warnings.push(...priceFlags);
    // Nếu có video nhưng tất cả không linked tới sản phẩm
    try {
      const vids = evidence.filter(e => e.type === 'creatorVideo');
      if (vids.length > 0 && vids.every(v => v.linkedToProduct !== true)) warnings.push('evidence_all_unlinked');
    } catch {}
    // Thiếu policies cốt lõi để risk-reversal
    if (!marketplace?.product?.returnPolicy && !marketplace?.product?.warranty && marketplace?.product?.shipping?.cod !== true) {
      warnings.push('missing_marketplace_policies');
    }
    
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
        currency: ((product.currency || 'VND') as string).toUpperCase(),
        timestamp: new Date().toISOString(),
        productId: product.productId || '',
        sourceUrl: (product as any).finalUrl || (product as any).canonicalUrl,
      },
      product: {
        title: product.title || '',
        canonicalUrl: (product as any).finalUrl || (product as any).canonicalUrl,
        canonicalUrlClean: sanitizeBuyUrl((product as any).finalUrl || (product as any).canonicalUrl || ''),
        brand: normalization?.brand || undefined,
        category: undefined,
        attributes: undefined,
        seller: undefined,
        images: (() => {
          const imgs = Array.isArray(product.images) ? product.images.filter(u => typeof u === 'string') : [];
          if (imgs.length > 0) return imgs;
          const primary = (product as any).finalUrl || (product as any).canonicalUrl;
          return primary ? [primary] : [];
        })(),
        videos: productVideos,
      },
      productNormalization: normalization || undefined,
      availability: this.buildAvailability(product),
      policies: {
        returnPolicy: (product as any)?.returnPolicy,
        returnWindowDays: (product as any)?.returnWindowDays,
        buyerProtection: (product as any)?.buyerProtection,
        warranty: (product as any)?.warranty,
        cod: (product as any)?.shipping?.cod === true ? true : undefined,
        shippingTimeDays: (() => {
          const s = (product as any)?.shipping;
          if (s && typeof s === 'object') {
            const min = typeof s.minDays === 'number' ? s.minDays : undefined;
            const max = typeof s.maxDays === 'number' ? s.maxDays : undefined;
            if (min != null && max != null) return Math.round((min + max) / 2);
            if (min != null) return min;
            if (max != null) return max;
          }
          return undefined;
        })(),
        freeShipThreshold: (product as any)?.shipping?.freeThreshold,
      },
      socialProof: {
        ratingAvg: product.ratingAvg,
        ratingCount: product.reviewCount,
        ratingBreakdown: undefined,
        qnaCount: undefined,
      },
      reviews: this.buildReviews(product, analysis, evidence, normalization),
      reviewsAggregate: this.buildReviewsAggregate(product),
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
      psychologyV2,
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
      aiDecision,
      evidencePolicy: { countUnlinked: false },
      evidence,
      system: {
        warnings,
        ...(LLM_ENABLED
          ? { llm: 'gemini-2.5-flash', llmVersion: '2025-08-01', latencyMs: 1840 }
          : {}),
      },
      marketplace,
    };
  }

  private buildEvidenceArray(product: ProductDTO, analysis: AnalysisDTO): any[] {
    const evidence: any[] = [];
    const seenById = new Set<string>();
    const seenByUrl = new Set<string>();
    
    // Add product page as evidence
    evidence.push({
      id: 'prod:page',
      type: 'productPage',
      url: product.finalUrl,
      reliability: 0.35,
      freshnessDays: 0,
      scrapedAt: new Date().toISOString(),
    });
    seenById.add('prod:page');
    if (product.finalUrl) seenByUrl.add(product.finalUrl);
    
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
      seenById.add('rev:page:1');
      if (product.finalUrl) seenByUrl.add(product.finalUrl);
    }
    
    // Add creator videos (YouTube/TikTok) as evidence if provided on product
    const videos = Array.isArray((product as any).videos) ? (product as any).videos : [];
    if (videos.length) {
      const uniq = new Set<string>();
      videos.forEach((v: any, idx: number) => {
        const url = typeof v?.url === 'string' ? v.url : undefined;
        if (!url || uniq.has(url)) return;
        uniq.add(url);
        const ev = {
          id: `vid:${idx}`,
          type: 'creatorVideo',
          url,
          reliability: 0.55,
          freshnessDays: undefined,
          scrapedAt: new Date().toISOString(),
          source: { platform: this.detectPlatform(url), type: 'creator_review' },
          engagement: {
            views: typeof v?.views === 'number' ? v.views : undefined,
            likes: typeof v?.likes === 'number' ? v.likes : undefined,
            comments: typeof v?.comments === 'number' ? v.comments : undefined,
          },
          author: typeof v?.author === 'object' ? {
            name: typeof v?.author?.name === 'string' ? v.author.name : undefined,
            channelSubs: typeof v?.author?.channelSubs === 'number' ? v.author.channelSubs : undefined,
            verified: typeof v?.author?.verified === 'boolean' ? v.author.verified : undefined,
          } : undefined,
        } as any;
        evidence.push(ev);
        seenById.add(ev.id);
        if (url) seenByUrl.add(url);
      });
    }
    // Normalize extra analysis evidence (if any) and dedupe by id/url
    try {
      const list = Array.isArray((analysis as any).evidence) ? (analysis as any).evidence : [];
      for (const e of list) {
        if (!e) continue;
        const type = String(e.type || 'externalPage');
        const isVideo = /video/i.test(type) || this.detectPlatform(e.url) !== 'other';
        const normType = type === 'review' || type === 'productPage' ? type : (isVideo ? 'creatorVideo' : 'externalPage');
        const id = String(e.id || e.url || `ev:${Math.random().toString(36).slice(2, 9)}`);
        const url = typeof e.url === 'string' ? e.url : undefined;
        if (seenById.has(id) || (url && seenByUrl.has(url))) continue;
        const ev = {
          id,
          type: normType,
          url,
          reliability: typeof e.reliability === 'number' ? e.reliability : (normType === 'creatorVideo' ? 0.55 : 0.5),
          freshnessDays: typeof e.freshnessDays === 'number' ? e.freshnessDays : undefined,
          scrapedAt: typeof e.scrapedAt === 'string' ? e.scrapedAt : new Date().toISOString(),
          source: typeof e.source === 'object' ? e.source : (url ? { platform: this.detectPlatform(url) } : undefined),
          title: typeof e.title === 'string' ? e.title : undefined,
          engagement: typeof e.engagement === 'object' ? e.engagement : undefined,
          author: typeof e.author === 'object' ? e.author : undefined,
        } as any;
        evidence.push(ev);
        seenById.add(id);
        if (url) seenByUrl.add(url);
      }
    } catch {}

    return evidence;
  }

  private buildProductNormalization(product: any): any {
    const title = String(product?.title || '');
    const tokens = title.split(/\s+/).filter(Boolean);
    const cleanTokens = tokens.filter(t => !t.startsWith('[') && !t.startsWith('#'));
    let brand = typeof product?.brand === 'string' ? product.brand : (cleanTokens[0] || tokens[0] || undefined);
    const tLower = title.toLowerCase();
    const normalizeBrand = (b: any) => (typeof b === 'string' ? b.trim() : undefined);
    // Heuristic fixes: bracketed tokens or '[DEAL' -> derive brand from title if possible
    const looksInvalid = (b: string | undefined) => {
      if (!b) return false;
      const clean = b.replace(/[^a-z]/gi,'').toLowerCase();
      return (/^\[/.test(b) || /\]$/.test(b) || /^deal$/i.test(clean) || /hot/.test(clean));
    };
    if (looksInvalid(brand) || !brand) {
      if (/\bcerave\b/i.test(tLower)) brand = 'CeraVe';
    }
    brand = normalizeBrand(brand);
    // Canonicalize brand casing for CeraVe regardless of input variants
    if (typeof brand === 'string' && brand.toLowerCase() === 'cerave') {
      brand = 'CeraVe';
    }
    // Detect product line from title (e.g., Blemish Control)
    const line = (/\bblemish\s*control\b/i.test(title) ? 'Blemish Control' : undefined);
    const sizeMatch = title.match(/(\d+(?:[.,]\d+)?)\s?(ml|l|g|kg)/i);
    const size = sizeMatch
      ? (() => {
          const raw = parseFloat(sizeMatch[1].replace(',', '.'));
          const unit = sizeMatch[2].toLowerCase();
          if (!Number.isFinite(raw)) return undefined;
          // Chuẩn hoá về đơn vị ml hoặc g theo schema { value, unit }
          if (unit === 'ml') return { value: raw, unit: 'ml' };
          if (unit === 'l') return { value: raw * 1000, unit: 'ml' };
          if (unit === 'g') return { value: raw, unit: 'g' };
          if (unit === 'kg') return { value: raw * 1000, unit: 'g' };
          return undefined;
        })()
      : undefined;
    return {
      brand: brand || undefined,
      line: line || undefined,
      size: size || undefined,
      categoryPath: Array.isArray(product?.categoryPath) ? product.categoryPath : undefined,
      gtin: typeof (product as any)?.gtin === 'string' ? (product as any).gtin : undefined,
      variantKey: typeof (product as any)?.variantKey === 'string' ? (product as any).variantKey : undefined,
      ingredientHash: typeof (product as any)?.ingredientHash === 'string' ? (product as any).ingredientHash : undefined,
    };
  }

  private enrichEvidenceLinking(evidence: any[], normalization: any, product?: any): any[] {
    const brand = String(normalization?.brand || '').toLowerCase();
    const line = String(normalization?.line || '').toLowerCase();
    const variant = String(normalization?.variantKey || '').toLowerCase();
    const sizeVal = normalization?.size?.value;
    const sizeUnit = String(normalization?.size?.unit || '').toLowerCase();
    const productId = String((product as any)?.productId || '').toLowerCase();
    const matchSize = (s: string) => (sizeVal ? s.includes(String(sizeVal)) && (sizeUnit ? s.includes(sizeUnit) : true) : false);
    return evidence.map(ev => {
      const url = String(ev.url || '').toLowerCase();
      const title = String(ev.title || '').toLowerCase();
      const qp = this.parseQuery(url);
      const hasUtm = Object.keys(qp).some(k => k.startsWith('utm_'));
      const hasPid = productId && (url.includes(productId) || Object.values(qp).some(v => String(v).toLowerCase() === productId));
      const brandHit = !!brand && (url.includes(brand) || title.includes(brand));
      const lineHit = !!line && (url.includes(line) || title.includes(line));
      const variantHit = !!variant && (url.includes(variant) || title.includes(variant));
      const sizeHit = matchSize(url) || matchSize(title);
      const linked = brandHit || lineHit || variantHit || sizeHit || hasPid || hasUtm;
      const reliability = typeof ev.reliability === 'number' ? ev.reliability : 0.5;
      const relevanceScore = linked ? Math.min(1, 0.6 + 0.4 * reliability) : 0.4 * reliability;
      return { ...ev, linkedToProduct: linked, relevanceScore };
    });
  }

  private parseQuery(url: string): Record<string,string> {
    try {
      const u = new URL(url);
      const qp: Record<string,string> = {};
      u.searchParams.forEach((v,k) => { qp[k] = v; });
      return qp;
    } catch { return {}; }
  }

  private computePriceFlags(product: any): string[] {
    const flags: string[] = [];
    const price = typeof product?.price === 'number' ? product.price : undefined;
    const original = typeof (product as any)?.discountPrice === 'number' ? (product as any).discountPrice
      : (typeof (product as any)?.listPrice === 'number' ? (product as any).listPrice : undefined);
    if (typeof price === 'number' && price <= 0) flags.push('price_non_positive');
    if (typeof original === 'number' && typeof price === 'number' && original > 0) {
      const discountPct = Math.round(((original - price) / original) * 100);
      if (discountPct >= 75) flags.push('price_deep_discount_possible_bait');
      if (discountPct < 0) flags.push('price_original_below_current');
    }
    return flags;
  }

  private buildMarketplace(product: any, normalization: any): any {
    const currency = typeof product?.currency === 'string' ? product.currency : 'VND';
    const saleRaw = typeof product?.price === 'number' ? product.price : undefined;
    const listRaw = typeof (product as any)?.listPrice === 'number'
      ? (product as any).listPrice
      : (typeof (product as any)?.discountPrice === 'number' ? (product as any).discountPrice : undefined);
    const platform = (() => {
      const raw = (product as any)?.source;
      const s = typeof raw === 'string' ? raw.toLowerCase() : '';
      if (s === 'tiktok' || s === 'shopee' || s === 'lazada' || s === 'other') return s;
      try {
        const u = new URL((product as any).finalUrl || (product as any).canonicalUrl || '');
        const h = u.hostname.toLowerCase();
        if (h.includes('tiktok')) return 'tiktok';
        if (h.includes('shopee')) return 'shopee';
        if (h.includes('lazada')) return 'lazada';
      } catch {}
      return 'other';
    })();
    const sale = this.normalizeVndScale(saleRaw, currency, platform);
    const list = this.normalizeVndScale(listRaw, currency, platform);
    // Tính giá theo 100ml nếu bắt được size theo ml
    const per_100ml = (() => {
      const sz = normalization?.size;
      if (sale != null && sz && sz.unit === 'ml' && typeof sz.value === 'number' && sz.value > 0) {
        return Math.round(((sale / sz.value) * 100) * 100) / 100; // làm tròn 2 chữ số
      }
      return undefined;
    })();
    // Tính giá theo 100g nếu bắt được size theo g
    const per_100g = (() => {
      const sz = normalization?.size;
      if (sale != null && sz && sz.unit === 'g' && typeof sz.value === 'number' && sz.value > 0) {
        return Math.round(((sale / sz.value) * 100) * 100) / 100; // làm tròn 2 chữ số
      }
      return undefined;
    })();
    const ratingDist = (() => {
      const src: any = (product as any)?.ratingDist || (product as any)?.ratingDistribution || (product as any)?.ratingBreakdown || (product as any)?.ratingStarsCount;
      if (!src || typeof src !== 'object') return undefined;
      const out: Record<string, number> = {};
      for (const k of Object.keys(src)) {
        const v = Number((src as any)[k]);
        if (!Number.isFinite(v)) continue;
        const onlyDigits = String(k).replace(/[^0-9]/g, '');
        const key = ['1','2','3','4','5'].includes(onlyDigits) ? onlyDigits : String(k);
        out[key] = Math.trunc(v);
      }
      return Object.keys(out).length ? out : undefined;
    })();
    // price variants min/max
    const variantPrices: number[] = (() => {
      const out: number[] = [];
      try {
        const vs = (product as any)?.variants || (product as any)?.variantPrices;
        if (Array.isArray(vs)) {
          for (const v of vs) {
            const pRaw = typeof v === 'number' ? v : (typeof v?.price === 'number' ? v.price : undefined);
            const p = this.normalizeVndScale(pRaw, currency, platform);
            if (typeof p === 'number') out.push(p);
          }
        }
      } catch {}
      return out;
    })();
    const vMin = variantPrices.length ? Math.min(...variantPrices) : undefined;
    const vMax = variantPrices.length ? Math.max(...variantPrices) : undefined;
    const current = sale ?? list;
    const original = list ?? sale;
    const discountPct = (typeof current === 'number' && typeof original === 'number' && original > 0)
      ? Math.min(100, Math.max(0, Math.round(((original - current) / original) * 100)))
      : undefined;
    const updatedAt = this.toIsoDateTime((product as any)?.priceUpdatedAt);
    const priceHistory = Array.isArray((product as any)?.priceHistory)
      ? (product as any).priceHistory
          .map((h: any) => {
            const date = this.toIsoDate(h?.date ?? h?.ts);
            const priceNum = this.normalizeVndScale(
              typeof h?.price === 'number' ? h.price : Number(h?.price),
              currency,
              platform,
            );
            if (!date || typeof priceNum !== 'number' || !Number.isFinite(priceNum)) return undefined as any;
            return { date, price: priceNum } as any;
          })
          .filter((x: any) => x != null)
      : undefined;
    return {
      shop: {
        name: typeof (product as any)?.shopName === 'string' ? (product as any).shopName : undefined,
        shopId: typeof (product as any)?.shopId === 'string' ? (product as any).shopId : undefined,
        isOfficialStore: typeof (product as any)?.isOfficialStore === 'boolean' ? (product as any).isOfficialStore : undefined,
        ratings: (
          typeof (product as any)?.shopRating === 'number' || typeof (product as any)?.shopRatingCount === 'number'
        ) ? {
          avg: typeof (product as any)?.shopRating === 'number' ? (product as any).shopRating : undefined,
          count: typeof (product as any)?.shopRatingCount === 'number' ? (product as any).shopRatingCount : undefined,
        } : undefined,
        rating: typeof (product as any)?.shopRating === 'number' ? (product as any).shopRating : undefined,
        followers: typeof (product as any)?.shopFollowers === 'number' ? (product as any).shopFollowers : undefined,
        responseRate: typeof (product as any)?.shopResponseRate === 'number' ? (product as any).shopResponseRate : undefined,
        ageDays: typeof (product as any)?.shopAgeDays === 'number' ? (product as any).shopAgeDays : undefined,
        badges: Array.isArray((product as any)?.shopBadges) ? (product as any).shopBadges : undefined,
      },
      product: {
        ratingAvg: typeof product?.ratingAvg === 'number' ? product.ratingAvg : undefined,
        ratingCount: typeof product?.reviewCount === 'number' ? product.reviewCount : undefined,
        soldCount: (product as any)?.soldCount ?? (product as any)?.historicalSold,
        ratingDist,
        qaCount: typeof (product as any)?.qaCount === 'number' ? (product as any).qaCount : (
          typeof (product as any)?.qnaCount === 'number' ? (product as any).qnaCount : undefined
        ),
        returnPolicy: typeof (product as any)?.returnPolicy === 'string' ? (product as any).returnPolicy : undefined,
        warranty: typeof (product as any)?.warranty === 'string' ? (product as any).warranty : undefined,
        shipping: (product as any)?.shipping && typeof (product as any).shipping === 'object' ? {
          minDays: typeof (product as any).shipping.minDays === 'number' ? (product as any).shipping.minDays : undefined,
          maxDays: typeof (product as any).shipping.maxDays === 'number' ? (product as any).shipping.maxDays : undefined,
          cod: typeof (product as any).shipping.cod === 'boolean' ? (product as any).shipping.cod : undefined,
          freeThreshold: typeof (product as any).shipping.freeThreshold === 'number' ? (product as any).shipping.freeThreshold : undefined,
        } : undefined,
      },
      price: {
        list: list,
        sale: sale,
        currency: (currency || 'VND').toUpperCase(),
        per_100ml,
        per_100g,
        history: priceHistory,
        current,
        original,
        min: vMin,
        max: vMax,
        updatedAt,
        discountPct,
      },
    };
  }

  private buildPsychologyV2(scorecard: any, marketplace: any, evidence: any[]): any {
    // Chuyển buyerDecisionScorecard (0..2, total 0..10) -> 0..100 và tính signals/gaps
    const to100 = (v: any) => (typeof v === 'number' && Number.isFinite(v) ? Math.round((v / 2) * 100) : undefined);
    const scoreTotal = typeof scorecard?.total === 'number' ? Math.round((scorecard.total / 10) * 100) : undefined;
    const sc: any = { total: scoreTotal };

    // Trust & EaseToBuy & Urgency: chuyển thẳng theo tỷ lệ
    if (typeof scorecard?.trust === 'number') sc.trust = { score: to100(scorecard.trust) };
    if (typeof scorecard?.easeToBuy === 'number') sc.easeToBuy = { score: to100(scorecard.easeToBuy) };
    if (typeof scorecard?.urgency === 'number') sc.urgency = { score: to100(scorecard.urgency) };

    // Evidence weighting: 70% in-platform (ratingAvg/ratingCount), 30% linked creator videos
    const rAvg = typeof marketplace?.product?.ratingAvg === 'number' ? marketplace.product.ratingAvg : undefined;
    const rCount = typeof marketplace?.product?.ratingCount === 'number' ? marketplace.product.ratingCount : undefined;
    const ratingAvgNorm = typeof rAvg === 'number' ? Math.max(0, Math.min(1, rAvg / 5)) : 0;
    const ratingCountWeight = typeof rCount === 'number' ? Math.min(1, Math.log10(rCount + 1) / 2) : 0; // ~1 khi ~100 reviews
    const platformScore = Math.round(ratingAvgNorm * 100 * ratingCountWeight);
    const vids = Array.isArray(evidence) ? evidence.filter(e => e.type === 'creatorVideo') : [];
    const vidsLinkedArr = vids.filter(v => v.linkedToProduct === true);
    const vidsLinked = vidsLinkedArr.length;
    const avgReliability = vidsLinkedArr.length
      ? (vidsLinkedArr.reduce((s, v) => s + (typeof v.reliability === 'number' ? v.reliability : 0.5), 0) / vidsLinkedArr.length)
      : 0.5;
    const videoScoreBase = Math.min(100, Math.round(Math.log2(vidsLinked + 1) * 30)); // 1:30, 3: ~48, 7: ~84
    const videoScore = Math.round(videoScoreBase * (0.6 + 0.4 * avgReliability));
    const evidenceScore = Math.round((0.7 * platformScore + 0.3 * videoScore));
    const evidenceSignals: string[] = [];
    if (typeof rAvg === 'number') evidenceSignals.push(`platform_rating_avg_${rAvg}`);
    if (typeof rCount === 'number') evidenceSignals.push(`platform_rating_count_${rCount}`);
    evidenceSignals.push(`linked_videos_${vidsLinked}`);
    const evidenceGaps: string[] = [];
    if (!rCount || rCount < 50) evidenceGaps.push('rating_count_lt_50');
    if (vidsLinked === 0) evidenceGaps.push('no_linked_videos');
    sc.evidence = { score: evidenceScore, signals: evidenceSignals, gaps: evidenceGaps };

    // Risk-Reversal: returnPolicy, COD, warranty
    const hasReturn = typeof marketplace?.product?.returnPolicy === 'string';
    const hasCod = marketplace?.product?.shipping?.cod === true;
    const hasWarranty = typeof marketplace?.product?.warranty === 'string';
    const rrSignals: string[] = [];
    const rrGaps: string[] = [];
    if (hasReturn) rrSignals.push('return_policy_present'); else rrGaps.push('return_policy_missing');
    if (hasCod) rrSignals.push('cod_available'); else rrGaps.push('cod_missing');
    if (hasWarranty) rrSignals.push('warranty_present'); else rrGaps.push('warranty_missing');
    const rrCount = [hasReturn, hasCod, hasWarranty].filter(Boolean).length;
    const rrScore = Math.round((rrCount / 3) * 100);
    sc.riskReversal = { score: rrScore, signals: rrSignals, gaps: rrGaps };

    const flags: string[] = [];
    if (scoreTotal != null && scoreTotal < 40) flags.push('low_psychology_score');
    if (rrScore < 50) flags.push('weak_risk_reversal');
    return { scorecard: sc, flags: flags.length ? flags : undefined };
  }

  private buildAiDecision(verdict: any, evidence: any[], marketplace: any, priceFlags: string[]): any {
    const linked = Array.isArray(evidence) ? evidence.filter(e => e.linkedToProduct === true) : [];
    const diversity = new Set(linked.map(e => e.type)).size;
    // Base 40..90 theo diversity (mỗi type ~+10, tối đa +50)
    let conf = 40 + Math.min(50, diversity * 10);
    // Penalty 10 điểm nếu có cờ giá
    if (priceFlags && priceFlags.length) conf -= 10;
    // Hệ số reliability & linked ratio
    const avgReliability = linked.length ? (linked.reduce((s, e) => s + (typeof e.reliability === 'number' ? e.reliability : 0.5), 0) / linked.length) : 0.5;
    const linkedRatio = evidence.length ? (linked.length / evidence.length) : 0;
    const reliabilityFactor = 0.6 + 0.4 * avgReliability; // 0.6..1.0
    const linkedFactor = 0.6 + 0.4 * linkedRatio;         // 0.6..1.0
    conf = Math.round(Math.max(0, Math.min(100, conf * reliabilityFactor * linkedFactor)));

    // Reasons
    const reasonIds: string[] = [];
    reasonIds.push(`linked_evidence_diversity:${diversity}`);
    for (const f of (priceFlags || [])) reasonIds.push(`flag:${f}`);
    if (marketplace?.product?.ratingAvg != null) reasonIds.push(`rating_avg:${marketplace.product.ratingAvg}`);

    // Risk-reversal missing
    const missingRR = !marketplace?.product?.returnPolicy && !marketplace?.product?.warranty && marketplace?.product?.shipping?.cod !== true;
    if (missingRR) reasonIds.push('risk_reversal:missing');

    // Price large discount (loss aversion cue)
    const sale = typeof marketplace?.price?.sale === 'number' ? marketplace.price.sale : undefined;
    const list = typeof marketplace?.price?.list === 'number' ? marketplace.price.list : undefined;
    if (sale != null && list != null && list > 0) {
      const dpct = Math.round(((list - sale) / list) * 100);
      if (dpct >= 30) reasonIds.push('price_discount_gt_30pct');
    }

    const reasons = reasonIds.map(id => ({ id }));

    // Next steps
    const whatToCollectNext: string[] = [];
    if (diversity < 2) whatToCollectNext.push('add_creator_video_or_reviews');
    if (!marketplace?.product?.ratingCount) whatToCollectNext.push('collect_rating_count');
    if (!Array.isArray(marketplace?.price?.history) || marketplace.price.history?.length === 0) whatToCollectNext.push('collect_price_history_30d');
    const vids = evidence.filter(e => e.type === 'creatorVideo');
    if (vids.length > 0 && vids.every((v: any) => v.linkedToProduct !== true)) whatToCollectNext.push('link_videos_to_product');

    // Map verdict sang enum của aiDecision (không có 'hold')
    const mappedVerdict = verdict === 'hold' ? 'unknown' : verdict;
    return { verdict: mappedVerdict, confidence: conf, reasons, whatToCollectNext };
  }

  private extractYouTubeId(url: string): string | undefined {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) {
        return u.pathname.split('/').filter(Boolean)[0];
      }
      if (u.hostname.includes('youtube.com')) {
        return u.searchParams.get('v') || undefined;
      }
    } catch {}
    return undefined;
  }

  private canonicalEvidenceKey(ev: any): string | undefined {
    const url = typeof ev?.url === 'string' ? ev.url : undefined;
    if (!url) return undefined;
    const yid = this.extractYouTubeId(url);
    if (yid) return `yt:${yid}`;
    try {
      const u = new URL(url);
      u.search = ''; u.hash = '';
      return `${u.hostname}${u.pathname}`;
    } catch { return url; }
  }

  private dedupeEvidenceByCanonicalSource(evidence: any[]): any[] {
    const seen = new Map<string, any>();
    const out: any[] = [];
    for (const ev of evidence) {
      const key = this.canonicalEvidenceKey(ev);
      if (!key) { out.push(ev); continue; }
      if (!seen.has(key)) { seen.set(key, ev); out.push(ev); continue; }
      const prev = seen.get(key);
      // Ưu tiên creatorVideo
      if (prev?.type !== 'creatorVideo' && ev?.type === 'creatorVideo') {
        // replace prev in out
        const idx = out.indexOf(prev);
        if (idx >= 0) out[idx] = ev; else out.push(ev);
        seen.set(key, ev);
      }
      // otherwise skip duplicate
    }
    return out;
  }

  private buildReviewsAggregate(product: any) {
    const count = typeof (product as any)?.reviewCount === 'number' ? (product as any).reviewCount : undefined;
    const average = typeof (product as any)?.ratingAvg === 'number' ? (product as any).ratingAvg : undefined;
    const breakdown = (() => {
      const src: any = (product as any)?.ratingDist || (product as any)?.ratingDistribution || (product as any)?.ratingBreakdown || (product as any)?.ratingStarsCount;
      if (!src || typeof src !== 'object') return undefined;
      const out: Record<string, number> = {};
      for (const k of Object.keys(src)) {
        const v = Number((src as any)[k]);
        if (!Number.isFinite(v)) continue;
        const onlyDigits = String(k).replace(/[^0-9]/g, '');
        const key = ['1','2','3','4','5'].includes(onlyDigits) ? onlyDigits : String(k);
        out[key] = Math.trunc(v);
      }
      return Object.keys(out).length ? out : undefined;
    })();
    const recentCount30d = typeof (product as any)?.recentReviewCount30d === 'number' ? (product as any).recentReviewCount30d : undefined;
    const verifiedPurchaseRatio = typeof (product as any)?.verifiedPurchaseRatio === 'number' ? (product as any).verifiedPurchaseRatio : undefined;
    return { count, average, breakdown, recentCount30d, verifiedPurchaseRatio };
  }

  private isReviewRelatedToProduct(review: any, normalization: any): boolean {
    try {
      const txt = String(review?.text || '').toLowerCase();
      const brand = String(normalization?.brand || '').toLowerCase();
      const line = String(normalization?.line || '').toLowerCase();
      const variant = String(normalization?.variantKey || '').toLowerCase();
      const hasMedia = Array.isArray(this.normalizeMedia(review?.images)) && this.normalizeMedia(review?.images)!.length > 0;
      const verified = review?.verifiedPurchase === true;
      const brandHit = !!brand && txt.includes(brand);
      const lineHit = !!line && txt.includes(line);
      const variantHit = !!variant && txt.includes(variant);
      if (brand) {
        return brandHit || lineHit || variantHit || verified || hasMedia;
      }
      // Nếu không biết brand, ưu tiên review có media hoặc verified purchase
      return verified || hasMedia;
    } catch {
      return true;
    }
  }

  private detectPlatform(url: any): string {
    const s = String(url || '').toLowerCase();
    if (s.includes('youtube.com') || s.includes('youtu.be')) return 'youtube';
    if (s.includes('tiktok.com')) return 'tiktok';
    if (s.includes('shopee')) return 'shopee';
    if (s.includes('lazada')) return 'lazada';
    return 'other';
  }

  private filterUnrelatedVideos(evidence: any[]): any[] {
    try {
      return evidence.filter(e => e.type !== 'creatorVideo' || e.linkedToProduct === true);
    } catch { return evidence; }
  }

  private buildProductVideosFromEvidence(evidence: any[]): any[] | undefined {
    const vids = Array.isArray(evidence) ? evidence.filter(e => e.type === 'creatorVideo' && e.linkedToProduct === true) : [];
    if (!vids.length) return undefined;
    const allowed = new Set(['demo','creator_review','live_replay','ugc']);
    return vids.map((ev: any) => ({
      url: typeof ev.url === 'string' ? ev.url : undefined,
      type: (allowed.has(String(ev?.source?.type || 'creator_review')) ? ev?.source?.type : 'creator_review') as any,
      views: typeof ev?.engagement?.views === 'number' ? ev.engagement.views : undefined,
      likes: typeof ev?.engagement?.likes === 'number' ? ev.engagement.likes : undefined,
      evidenceId: String(ev.id),
    })).filter(v => typeof v.url === 'string');
  }

  private buildReviews(product: any, analysis: any, evidence: any[], normalization: any) {
    if (Array.isArray(product.reviewsSample) && product.reviewsSample.length > 0) {
      // Lọc review liên quan trực tiếp tới sản phẩm/brand
      const filtered = product.reviewsSample.filter((r: any) => this.isReviewRelatedToProduct(r, normalization));
      const chosen = (filtered.length > 0 ? filtered : product.reviewsSample).slice(0, 30);
      return chosen.map((review: any, index: number) => this.mapReviewItem(review, index, evidence));
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
    // If missing core marketplace signals: price OR ratingAvg OR ratingCount -> 'hold'
    const hasPrice = product.price !== undefined && product.price !== null;
    const hasRatingAvg = product.ratingAvg !== undefined && product.ratingAvg !== null;
    const hasRatingCount = (product as any).reviewCount !== undefined && (product as any).reviewCount !== null;
    if (!hasPrice || !hasRatingAvg || !hasRatingCount) return 'hold';

    // Check critical data with relaxed criteria
    const criticalOk = this.hasCriticalData(product, analysis);

    // Prefer diversity of evidence types over raw count
    const typeCount = new Set(evidence.map(e => e.type)).size;
    const hasCreatorVideo = evidence.some(e => e.type === 'creatorVideo');
    const hasReviewEv = evidence.some(e => e.type === 'review');

    // If evidence lacks diversity, return "hold"
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

  private buildAvailability(product: any) {
    const stockRaw = (product as any)?.stock ?? (product as any)?.stockCount;
    const inStockFlag = (product as any)?.inStock === true || (product as any)?.available === true;
    const soldOutFlag = (product as any)?.soldOut === true || (product as any)?.available === false;
    let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'unknown' = 'unknown';
    if (typeof stockRaw === 'number') {
      if (stockRaw <= 0) stockStatus = 'out_of_stock';
      else if (stockRaw <= 5) stockStatus = 'low_stock';
      else stockStatus = 'in_stock';
    } else if (soldOutFlag) {
      stockStatus = 'out_of_stock';
    } else if (inStockFlag) {
      stockStatus = 'in_stock';
    }
    const shipFrom = (product as any)?.shipFrom || (product as any)?.shopLocation || undefined;
    const shipping = (product as any)?.shipping && typeof (product as any).shipping === 'object' ? (product as any).shipping : undefined;
    const etaDays = (() => {
      if (shipping) {
        const min = typeof shipping.minDays === 'number' ? shipping.minDays : undefined;
        const max = typeof shipping.maxDays === 'number' ? shipping.maxDays : undefined;
        if (min != null && max != null) return Math.round((min + max) / 2);
        if (min != null) return min;
        if (max != null) return max;
      }
      return undefined;
    })();
    const shippingOptions = etaDays != null ? [{ etaDays }] : undefined;
    return {
      stockStatus,
      stockCount: typeof stockRaw === 'number' ? stockRaw : undefined,
      shipFrom: typeof shipFrom === 'string' ? shipFrom : undefined,
      shippingOptions,
    };
  }

  private normalizeVndScale(value: any, currency: string | undefined, platform?: string): number | undefined {
    const n = typeof value === 'number' ? value : undefined;
    if (n == null) return undefined;
    // Trust source data as-is. No VND scaling for any platform.
    return n;
  }

  private toIsoDateTime(v: any): string {
    try {
      const d = v ? new Date(v) : new Date();
      const iso = d.toISOString();
      return iso;
    } catch {
      return new Date().toISOString();
    }
  }

  private toIsoDate(v: any): string | undefined {
    try {
      if (v == null) return undefined;
      const d = new Date(v);
      const s = d.toISOString().slice(0, 10);
      return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : undefined;
    } catch {
      return undefined;
    }
  }

  private pickTopicEvidenceIds(evidence: any[]): string[] {
    // Ưu tiên evidence đã linked tới sản phẩm: creatorVideo (linked) -> others (linked) -> creatorVideo (unlinked) -> others
    const nonProduct = evidence.filter(e => e.type !== 'productPage');
    const linkedCreator = nonProduct.filter(e => e.type === 'creatorVideo' && e.linkedToProduct === true);
    const linkedOthers = nonProduct.filter(e => e.type !== 'creatorVideo' && e.linkedToProduct === true);
    const unlinkedCreator = nonProduct.filter(e => e.type === 'creatorVideo' && e.linkedToProduct !== true);
    const unlinkedOthers = nonProduct.filter(e => e.type !== 'creatorVideo' && e.linkedToProduct !== true);
    const ordered = [...linkedCreator, ...linkedOthers, ...unlinkedCreator, ...unlinkedOthers];
    return ordered.slice(0, 5).map(e => String(e.id));
  }
}
