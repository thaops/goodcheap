"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseMapper = void 0;
const common_1 = require("@nestjs/common");
const psychology_service_1 = require("../psychology/psychology.service");
let ResponseMapper = class ResponseMapper {
    psychologyService;
    constructor(psychologyService) {
        this.psychologyService = psychologyService;
    }
    mapToEvidenceFirstResponse(product, analysis, actions) {
        const LLM_ENABLED = (process.env.GC_ENABLE_LLM ?? 'false') === 'true';
        const psychologyScore = this.psychologyService.calculatePsychologyScore(product);
        const buyerDecisionFactors = this.psychologyService.calculateBuyerDecisionFactors(product);
        const buyerDecisionScorecardRaw = this.psychologyService.calculateBuyerDecisionScorecard(product);
        const buyerDecisionScorecard = this.clampBuyerDecisionScorecard(buyerDecisionScorecardRaw);
        const evidence = this.buildEvidenceArray(product, analysis);
        const verdict = this.determineVerdict(product, analysis, evidence);
        return {
            schemaVersion: '1.1.0',
            meta: {
                platform: (() => {
                    const raw = product?.source;
                    const s = typeof raw === 'string' ? raw.toLowerCase() : '';
                    if (s === 'tiktok' || s === 'shopee' || s === 'lazada' || s === 'other')
                        return s;
                    try {
                        const u = new URL(product.finalUrl || product.canonicalUrl || '');
                        const h = u.hostname.toLowerCase();
                        if (h.includes('tiktok'))
                            return 'tiktok';
                        if (h.includes('shopee'))
                            return 'shopee';
                        if (h.includes('lazada'))
                            return 'lazada';
                    }
                    catch { }
                    return 'other';
                })(),
                locale: 'vi-VN',
                currency: product.currency || 'VND',
                timestamp: new Date().toISOString(),
                productId: product.productId || '',
                sourceUrl: product.finalUrl || product.canonicalUrl,
            },
            product: {
                title: product.title || '',
                canonicalUrl: product.finalUrl || product.canonicalUrl,
                brand: undefined,
                category: undefined,
                attributes: undefined,
                seller: undefined,
                images: (() => {
                    const imgs = Array.isArray(product.images) ? product.images.filter(u => typeof u === 'string') : [];
                    if (imgs.length > 0)
                        return imgs;
                    const primary = product.finalUrl || product.canonicalUrl;
                    return primary ? [primary] : [];
                })(),
                videos: Array.isArray(product.videos) && product.videos.length
                    ? product.videos
                        .map((v, i) => ({
                        url: typeof v?.url === 'string' ? v.url : undefined,
                        type: (() => {
                            const t = String(v?.type || 'creator_review');
                            const allowed = new Set(['demo', 'creator_review', 'live_replay', 'ugc']);
                            return (allowed.has(t) ? t : 'creator_review');
                        })(),
                        views: typeof v?.views === 'number' ? v.views : undefined,
                        likes: typeof v?.likes === 'number' ? v.likes : undefined,
                        evidenceId: `vid:${i}`,
                    }))
                        .filter((v) => typeof v.url === 'string')
                    : undefined,
            },
            pricing: (() => {
                const toNum = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
                const currency = product.currency ?? 'VND';
                const isPlausiblePrice = (val) => {
                    if (!Number.isFinite(val) || val <= 0)
                        return false;
                    const digits = String(Math.trunc(val)).length;
                    if (currency === 'VND') {
                        if (val < 1_000 || val > 50_000_000)
                            return false;
                        if (digits > 9)
                            return false;
                    }
                    return true;
                };
                const currentRaw = toNum(product.price);
                const originalRaw = toNum(product.discountPrice ?? product.listPrice);
                const current = currentRaw && isPlausiblePrice(currentRaw) ? currentRaw : undefined;
                const original = originalRaw && isPlausiblePrice(originalRaw) ? originalRaw : undefined;
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
    buildEvidenceArray(product, analysis) {
        const evidence = [];
        evidence.push({
            id: 'prod:page',
            type: 'productPage',
            url: product.finalUrl,
            reliability: 0.35,
            freshnessDays: 0,
            scrapedAt: new Date().toISOString(),
        });
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
        const videos = Array.isArray(product.videos) ? product.videos : [];
        if (videos.length) {
            const uniq = new Set();
            videos.forEach((v, idx) => {
                const url = typeof v?.url === 'string' ? v.url : undefined;
                if (!url || uniq.has(url))
                    return;
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
        if (Array.isArray(analysis?.evidence) && analysis.evidence.length) {
            const seenById = new Set(evidence.map(e => String(e.id)));
            const seenByUrl = new Set(evidence.map(e => String(e.url || '')));
            const normalized = analysis.evidence
                .filter(Boolean)
                .map((e) => {
                const type = String(e.type || 'unknown');
                const isVideo = /video/i.test(type);
                const normType = isVideo ? 'creatorVideo' : (type === 'productPage' || type === 'review' ? type : 'externalPage');
                return {
                    id: String(e.id || e.url || `ev:${Math.random().toString(36).slice(2, 8)}`),
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
                if (keyId && seenById.has(keyId))
                    continue;
                if (keyUrl && seenByUrl.has(keyUrl))
                    continue;
                seenById.add(keyId);
                if (keyUrl)
                    seenByUrl.add(keyUrl);
                evidence.push(ev);
            }
        }
        return evidence;
    }
    buildReviews(product, analysis, evidence) {
        if (Array.isArray(product.reviewsSample) && product.reviewsSample.length > 0) {
            return product.reviewsSample.map((review, index) => this.mapReviewItem(review, index, evidence));
        }
        const hl = analysis?.reviewHighlights;
        const pos = Array.isArray(hl?.positive) ? hl.positive : [];
        const neg = Array.isArray(hl?.negative) ? hl.negative : [];
        const items = [];
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
                date: new Date(r.createdAt || Date.now()).toISOString().slice(0, 10),
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
                date: new Date(r.createdAt || Date.now()).toISOString().slice(0, 10),
                source: this.normalizeSource(r.source || 'platform'),
                evidenceId,
            });
        }
        return items.length ? items : [];
    }
    mapReviewItem(review, index, evidence) {
        const dateOnly = (d) => {
            try {
                return new Date(d).toISOString().slice(0, 10);
            }
            catch {
                return new Date().toISOString().slice(0, 10);
            }
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
    determineVerdict(product, analysis, evidence) {
        const criticalOk = this.hasCriticalData(product, analysis);
        const typeCount = new Set(evidence.map(e => e.type)).size;
        const hasCreatorVideo = evidence.some(e => e.type === 'creatorVideo');
        const hasReviewEv = evidence.some(e => e.type === 'review');
        if (!criticalOk)
            return 'hold';
        if (typeCount < 2 && !(hasCreatorVideo && hasReviewEv))
            return 'hold';
        return analysis.decision?.verdict || 'consider';
    }
    hasCriticalData(product, analysis) {
        const hasPrice = product.price !== undefined && product.price !== null;
        const hasRating = product.ratingAvg !== undefined && product.ratingAvg !== null;
        const hasReviews = Array.isArray(product.reviewsSample) && product.reviewsSample.length > 0;
        const hasUrl = typeof product.finalUrl === 'string' && product.finalUrl.length > 0;
        const hasVideos = Array.isArray(product.videos) && product.videos.length > 0;
        const hasHighlights = !!(analysis?.reviewHighlights && ((Array.isArray(analysis.reviewHighlights.positive) && analysis.reviewHighlights.positive.length > 0) ||
            (Array.isArray(analysis.reviewHighlights.negative) && analysis.reviewHighlights.negative.length > 0)));
        const hasAnyCore = hasPrice || hasRating || hasReviews;
        return !!hasUrl && (hasAnyCore || hasVideos || hasHighlights);
    }
    mapAspectScores(aspects) {
        const scores = {};
        aspects.forEach(aspect => {
            if (aspect.name && typeof aspect.score === 'number') {
                scores[aspect.name] = aspect.score;
            }
        });
        return scores;
    }
    buildDataIntegrity(analysis) {
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
    clampBuyerDecisionScorecard(scorecard) {
        if (!scorecard || typeof scorecard !== 'object')
            return scorecard;
        const clampSub = (v) => {
            const n = typeof v === 'number' ? v : Number(v);
            if (Number.isFinite(n))
                return Math.max(0, Math.min(2, n));
            return undefined;
        };
        const clampTotal = (v) => {
            const n = typeof v === 'number' ? v : Number(v);
            if (Number.isFinite(n))
                return Math.max(0, Math.min(10, n));
            return undefined;
        };
        const out = { ...scorecard };
        for (const k of Object.keys(out)) {
            if (k === 'total')
                continue;
            if (typeof out[k] === 'number')
                out[k] = clampSub(out[k]);
        }
        if (typeof out.total === 'number')
            out.total = clampTotal(out.total);
        return out;
    }
    clampRating(v) {
        const n = typeof v === 'number' ? v : Number(v);
        if (!Number.isFinite(n))
            return 5;
        return Math.max(1, Math.min(5, Math.round(n)));
    }
    normalizeMedia(arr) {
        if (!Array.isArray(arr))
            return undefined;
        const toUrl = (x) => {
            if (typeof x === 'string')
                return x;
            if (x && typeof x === 'object' && typeof x.url === 'string')
                return x.url;
            return undefined;
        };
        const out = arr.map(toUrl).filter((s) => typeof s === 'string');
        return out.length ? out : undefined;
    }
    normalizeSource(src) {
        const s = String(src || '').toLowerCase();
        if (s === 'platform')
            return 'platform';
        if (s === 'tiktok_video' || s === 'tiktok' || s === 'video')
            return 'tiktok_video';
        if (s === 'external' || s === 'blog' || s === 'news')
            return 'external';
        return 'unknown';
    }
    pickTopicEvidenceIds(evidence) {
        const nonProduct = evidence.filter(e => e.type !== 'productPage');
        const creatorFirst = nonProduct.sort((a, b) => {
            const aw = a.type === 'creatorVideo' ? 1 : 0;
            const bw = b.type === 'creatorVideo' ? 1 : 0;
            return bw - aw;
        });
        return creatorFirst.slice(0, 5).map(e => String(e.id));
    }
};
exports.ResponseMapper = ResponseMapper;
exports.ResponseMapper = ResponseMapper = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [psychology_service_1.PsychologyService])
], ResponseMapper);
//# sourceMappingURL=response.mapper.js.map