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
const sanitizeBuyUrl_1 = require("../common/url/sanitizeBuyUrl");
let ResponseMapper = class ResponseMapper {
    psychologyService;
    constructor(psychologyService) {
        this.psychologyService = psychologyService;
    }
    mapToEvidenceFirstResponse(product, analysis, actions) {
        const LLM_ENABLED = (process.env.GC_ENABLE_LLM ?? 'false') === 'true';
        const buyerDecisionScorecardRaw = this.psychologyService.calculateBuyerDecisionScorecard(product);
        const buyerDecisionScorecard = this.clampBuyerDecisionScorecard(buyerDecisionScorecardRaw);
        let evidence = this.buildEvidenceArray(product, analysis);
        evidence = this.dedupeEvidenceByCanonicalSource(evidence);
        const normalization = this.buildProductNormalization(product);
        evidence = this.enrichEvidenceLinking(evidence, normalization, product);
        evidence = this.filterUnrelatedVideos(evidence);
        const productVideos = this.buildProductVideosFromEvidence(evidence);
        const verdict = this.determineVerdict(product, analysis, evidence);
        const priceFlags = this.computePriceFlags(product);
        const marketplace = this.buildMarketplace(product, normalization);
        const psychologyV2 = this.buildPsychologyV2(buyerDecisionScorecard, marketplace, evidence);
        const aiDecision = this.buildAiDecision(verdict, evidence, marketplace, priceFlags);
        const warnings = [];
        if (!marketplace?.product?.ratingAvg || !marketplace?.product?.ratingCount)
            warnings.push('missing_marketplace_core');
        if (priceFlags && priceFlags.length)
            warnings.push(...priceFlags);
        try {
            const vids = evidence.filter(e => e.type === 'creatorVideo');
            if (vids.length > 0 && vids.every(v => v.linkedToProduct !== true))
                warnings.push('evidence_all_unlinked');
        }
        catch { }
        if (!marketplace?.product?.returnPolicy && !marketplace?.product?.warranty && marketplace?.product?.shipping?.cod !== true) {
            warnings.push('missing_marketplace_policies');
        }
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
                currency: (product.currency || 'VND').toUpperCase(),
                timestamp: new Date().toISOString(),
                productId: product.productId || '',
                sourceUrl: product.finalUrl || product.canonicalUrl,
            },
            product: {
                title: product.title || '',
                canonicalUrl: product.finalUrl || product.canonicalUrl,
                canonicalUrlClean: (0, sanitizeBuyUrl_1.sanitizeBuyUrl)(product.finalUrl || product.canonicalUrl || ''),
                brand: normalization?.brand || undefined,
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
                videos: productVideos,
            },
            productNormalization: normalization || undefined,
            availability: this.buildAvailability(product),
            policies: {
                returnPolicy: product?.returnPolicy,
                returnWindowDays: product?.returnWindowDays,
                buyerProtection: product?.buyerProtection,
                warranty: product?.warranty,
                cod: product?.shipping?.cod === true ? true : undefined,
                shippingTimeDays: (() => {
                    const s = product?.shipping;
                    if (s && typeof s === 'object') {
                        const min = typeof s.minDays === 'number' ? s.minDays : undefined;
                        const max = typeof s.maxDays === 'number' ? s.maxDays : undefined;
                        if (min != null && max != null)
                            return Math.round((min + max) / 2);
                        if (min != null)
                            return min;
                        if (max != null)
                            return max;
                    }
                    return undefined;
                })(),
                freeShipThreshold: product?.shipping?.freeThreshold,
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
    buildEvidenceArray(product, analysis) {
        const evidence = [];
        const seenById = new Set();
        const seenByUrl = new Set();
        evidence.push({
            id: 'prod:page',
            type: 'productPage',
            url: product.finalUrl,
            reliability: 0.35,
            freshnessDays: 0,
            scrapedAt: new Date().toISOString(),
        });
        seenById.add('prod:page');
        if (product.finalUrl)
            seenByUrl.add(product.finalUrl);
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
            if (product.finalUrl)
                seenByUrl.add(product.finalUrl);
        }
        const videos = Array.isArray(product.videos) ? product.videos : [];
        if (videos.length) {
            const uniq = new Set();
            videos.forEach((v, idx) => {
                const url = typeof v?.url === 'string' ? v.url : undefined;
                if (!url || uniq.has(url))
                    return;
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
                };
                evidence.push(ev);
                seenById.add(ev.id);
                if (url)
                    seenByUrl.add(url);
            });
        }
        try {
            const list = Array.isArray(analysis.evidence) ? analysis.evidence : [];
            for (const e of list) {
                if (!e)
                    continue;
                const type = String(e.type || 'externalPage');
                const isVideo = /video/i.test(type) || this.detectPlatform(e.url) !== 'other';
                const normType = type === 'review' || type === 'productPage' ? type : (isVideo ? 'creatorVideo' : 'externalPage');
                const id = String(e.id || e.url || `ev:${Math.random().toString(36).slice(2, 9)}`);
                const url = typeof e.url === 'string' ? e.url : undefined;
                if (seenById.has(id) || (url && seenByUrl.has(url)))
                    continue;
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
                };
                evidence.push(ev);
                seenById.add(id);
                if (url)
                    seenByUrl.add(url);
            }
        }
        catch { }
        return evidence;
    }
    buildProductNormalization(product) {
        const title = String(product?.title || '');
        const tokens = title.split(/\s+/).filter(Boolean);
        const cleanTokens = tokens.filter(t => !t.startsWith('[') && !t.startsWith('#'));
        let brand = typeof product?.brand === 'string' ? product.brand : (cleanTokens[0] || tokens[0] || undefined);
        const tLower = title.toLowerCase();
        const normalizeBrand = (b) => (typeof b === 'string' ? b.trim() : undefined);
        const looksInvalid = (b) => {
            if (!b)
                return false;
            const clean = b.replace(/[^a-z]/gi, '').toLowerCase();
            return (/^\[/.test(b) || /\]$/.test(b) || /^deal$/i.test(clean) || /hot/.test(clean));
        };
        if (looksInvalid(brand) || !brand) {
            if (/\bcerave\b/i.test(tLower))
                brand = 'CeraVe';
        }
        brand = normalizeBrand(brand);
        if (typeof brand === 'string' && brand.toLowerCase() === 'cerave') {
            brand = 'CeraVe';
        }
        const line = (/\bblemish\s*control\b/i.test(title) ? 'Blemish Control' : undefined);
        const sizeMatch = title.match(/(\d+(?:[.,]\d+)?)\s?(ml|l|g|kg)/i);
        const size = sizeMatch
            ? (() => {
                const raw = parseFloat(sizeMatch[1].replace(',', '.'));
                const unit = sizeMatch[2].toLowerCase();
                if (!Number.isFinite(raw))
                    return undefined;
                if (unit === 'ml')
                    return { value: raw, unit: 'ml' };
                if (unit === 'l')
                    return { value: raw * 1000, unit: 'ml' };
                if (unit === 'g')
                    return { value: raw, unit: 'g' };
                if (unit === 'kg')
                    return { value: raw * 1000, unit: 'g' };
                return undefined;
            })()
            : undefined;
        return {
            brand: brand || undefined,
            line: line || undefined,
            size: size || undefined,
            categoryPath: Array.isArray(product?.categoryPath) ? product.categoryPath : undefined,
            gtin: typeof product?.gtin === 'string' ? product.gtin : undefined,
            variantKey: typeof product?.variantKey === 'string' ? product.variantKey : undefined,
            ingredientHash: typeof product?.ingredientHash === 'string' ? product.ingredientHash : undefined,
        };
    }
    enrichEvidenceLinking(evidence, normalization, product) {
        const brand = String(normalization?.brand || '').toLowerCase();
        const line = String(normalization?.line || '').toLowerCase();
        const variant = String(normalization?.variantKey || '').toLowerCase();
        const sizeVal = normalization?.size?.value;
        const sizeUnit = String(normalization?.size?.unit || '').toLowerCase();
        const productId = String(product?.productId || '').toLowerCase();
        const matchSize = (s) => (sizeVal ? s.includes(String(sizeVal)) && (sizeUnit ? s.includes(sizeUnit) : true) : false);
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
    parseQuery(url) {
        try {
            const u = new URL(url);
            const qp = {};
            u.searchParams.forEach((v, k) => { qp[k] = v; });
            return qp;
        }
        catch {
            return {};
        }
    }
    computePriceFlags(product) {
        const flags = [];
        const price = typeof product?.price === 'number' ? product.price : undefined;
        const original = typeof product?.discountPrice === 'number' ? product.discountPrice
            : (typeof product?.listPrice === 'number' ? product.listPrice : undefined);
        if (typeof price === 'number' && price <= 0)
            flags.push('price_non_positive');
        if (typeof original === 'number' && typeof price === 'number' && original > 0) {
            const discountPct = Math.round(((original - price) / original) * 100);
            if (discountPct >= 75)
                flags.push('price_deep_discount_possible_bait');
            if (discountPct < 0)
                flags.push('price_original_below_current');
        }
        return flags;
    }
    buildMarketplace(product, normalization) {
        const currency = typeof product?.currency === 'string' ? product.currency : 'VND';
        const saleRaw = typeof product?.price === 'number' ? product.price : undefined;
        const listRaw = typeof product?.listPrice === 'number'
            ? product.listPrice
            : (typeof product?.discountPrice === 'number' ? product.discountPrice : undefined);
        const platform = (() => {
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
        })();
        const sale = this.normalizeVndScale(saleRaw, currency, platform);
        const list = this.normalizeVndScale(listRaw, currency, platform);
        const per_100ml = (() => {
            const sz = normalization?.size;
            if (sale != null && sz && sz.unit === 'ml' && typeof sz.value === 'number' && sz.value > 0) {
                return Math.round(((sale / sz.value) * 100) * 100) / 100;
            }
            return undefined;
        })();
        const per_100g = (() => {
            const sz = normalization?.size;
            if (sale != null && sz && sz.unit === 'g' && typeof sz.value === 'number' && sz.value > 0) {
                return Math.round(((sale / sz.value) * 100) * 100) / 100;
            }
            return undefined;
        })();
        const ratingDist = (() => {
            const src = product?.ratingDist || product?.ratingDistribution || product?.ratingBreakdown || product?.ratingStarsCount;
            if (!src || typeof src !== 'object')
                return undefined;
            const out = {};
            for (const k of Object.keys(src)) {
                const v = Number(src[k]);
                if (!Number.isFinite(v))
                    continue;
                const onlyDigits = String(k).replace(/[^0-9]/g, '');
                const key = ['1', '2', '3', '4', '5'].includes(onlyDigits) ? onlyDigits : String(k);
                out[key] = Math.trunc(v);
            }
            return Object.keys(out).length ? out : undefined;
        })();
        const variantPrices = (() => {
            const out = [];
            try {
                const vs = product?.variants || product?.variantPrices;
                if (Array.isArray(vs)) {
                    for (const v of vs) {
                        const pRaw = typeof v === 'number' ? v : (typeof v?.price === 'number' ? v.price : undefined);
                        const p = this.normalizeVndScale(pRaw, currency, platform);
                        if (typeof p === 'number')
                            out.push(p);
                    }
                }
            }
            catch { }
            return out;
        })();
        const vMin = variantPrices.length ? Math.min(...variantPrices) : undefined;
        const vMax = variantPrices.length ? Math.max(...variantPrices) : undefined;
        const current = sale ?? list;
        const original = list ?? sale;
        const discountPct = (typeof current === 'number' && typeof original === 'number' && original > 0)
            ? Math.min(100, Math.max(0, Math.round(((original - current) / original) * 100)))
            : undefined;
        const updatedAt = this.toIsoDateTime(product?.priceUpdatedAt);
        const priceHistory = Array.isArray(product?.priceHistory)
            ? product.priceHistory
                .map((h) => {
                const date = this.toIsoDate(h?.date ?? h?.ts);
                const priceNum = this.normalizeVndScale(typeof h?.price === 'number' ? h.price : Number(h?.price), currency, platform);
                if (!date || typeof priceNum !== 'number' || !Number.isFinite(priceNum))
                    return undefined;
                return { date, price: priceNum };
            })
                .filter((x) => x != null)
            : undefined;
        return {
            shop: {
                name: typeof product?.shopName === 'string' ? product.shopName : undefined,
                shopId: typeof product?.shopId === 'string' ? product.shopId : undefined,
                isOfficialStore: typeof product?.isOfficialStore === 'boolean' ? product.isOfficialStore : undefined,
                ratings: (typeof product?.shopRating === 'number' || typeof product?.shopRatingCount === 'number') ? {
                    avg: typeof product?.shopRating === 'number' ? product.shopRating : undefined,
                    count: typeof product?.shopRatingCount === 'number' ? product.shopRatingCount : undefined,
                } : undefined,
                rating: typeof product?.shopRating === 'number' ? product.shopRating : undefined,
                followers: typeof product?.shopFollowers === 'number' ? product.shopFollowers : undefined,
                responseRate: typeof product?.shopResponseRate === 'number' ? product.shopResponseRate : undefined,
                ageDays: typeof product?.shopAgeDays === 'number' ? product.shopAgeDays : undefined,
                badges: Array.isArray(product?.shopBadges) ? product.shopBadges : undefined,
            },
            product: {
                ratingAvg: typeof product?.ratingAvg === 'number' ? product.ratingAvg : undefined,
                ratingCount: typeof product?.reviewCount === 'number' ? product.reviewCount : undefined,
                soldCount: product?.soldCount ?? product?.historicalSold,
                ratingDist,
                qaCount: typeof product?.qaCount === 'number' ? product.qaCount : (typeof product?.qnaCount === 'number' ? product.qnaCount : undefined),
                returnPolicy: typeof product?.returnPolicy === 'string' ? product.returnPolicy : undefined,
                warranty: typeof product?.warranty === 'string' ? product.warranty : undefined,
                shipping: product?.shipping && typeof product.shipping === 'object' ? {
                    minDays: typeof product.shipping.minDays === 'number' ? product.shipping.minDays : undefined,
                    maxDays: typeof product.shipping.maxDays === 'number' ? product.shipping.maxDays : undefined,
                    cod: typeof product.shipping.cod === 'boolean' ? product.shipping.cod : undefined,
                    freeThreshold: typeof product.shipping.freeThreshold === 'number' ? product.shipping.freeThreshold : undefined,
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
    buildPsychologyV2(scorecard, marketplace, evidence) {
        const to100 = (v) => (typeof v === 'number' && Number.isFinite(v) ? Math.round((v / 2) * 100) : undefined);
        const scoreTotal = typeof scorecard?.total === 'number' ? Math.round((scorecard.total / 10) * 100) : undefined;
        const sc = { total: scoreTotal };
        if (typeof scorecard?.trust === 'number')
            sc.trust = { score: to100(scorecard.trust) };
        if (typeof scorecard?.easeToBuy === 'number')
            sc.easeToBuy = { score: to100(scorecard.easeToBuy) };
        if (typeof scorecard?.urgency === 'number')
            sc.urgency = { score: to100(scorecard.urgency) };
        const rAvg = typeof marketplace?.product?.ratingAvg === 'number' ? marketplace.product.ratingAvg : undefined;
        const rCount = typeof marketplace?.product?.ratingCount === 'number' ? marketplace.product.ratingCount : undefined;
        const ratingAvgNorm = typeof rAvg === 'number' ? Math.max(0, Math.min(1, rAvg / 5)) : 0;
        const ratingCountWeight = typeof rCount === 'number' ? Math.min(1, Math.log10(rCount + 1) / 2) : 0;
        const platformScore = Math.round(ratingAvgNorm * 100 * ratingCountWeight);
        const vids = Array.isArray(evidence) ? evidence.filter(e => e.type === 'creatorVideo') : [];
        const vidsLinkedArr = vids.filter(v => v.linkedToProduct === true);
        const vidsLinked = vidsLinkedArr.length;
        const avgReliability = vidsLinkedArr.length
            ? (vidsLinkedArr.reduce((s, v) => s + (typeof v.reliability === 'number' ? v.reliability : 0.5), 0) / vidsLinkedArr.length)
            : 0.5;
        const videoScoreBase = Math.min(100, Math.round(Math.log2(vidsLinked + 1) * 30));
        const videoScore = Math.round(videoScoreBase * (0.6 + 0.4 * avgReliability));
        const evidenceScore = Math.round((0.7 * platformScore + 0.3 * videoScore));
        const evidenceSignals = [];
        if (typeof rAvg === 'number')
            evidenceSignals.push(`platform_rating_avg_${rAvg}`);
        if (typeof rCount === 'number')
            evidenceSignals.push(`platform_rating_count_${rCount}`);
        evidenceSignals.push(`linked_videos_${vidsLinked}`);
        const evidenceGaps = [];
        if (!rCount || rCount < 50)
            evidenceGaps.push('rating_count_lt_50');
        if (vidsLinked === 0)
            evidenceGaps.push('no_linked_videos');
        sc.evidence = { score: evidenceScore, signals: evidenceSignals, gaps: evidenceGaps };
        const hasReturn = typeof marketplace?.product?.returnPolicy === 'string';
        const hasCod = marketplace?.product?.shipping?.cod === true;
        const hasWarranty = typeof marketplace?.product?.warranty === 'string';
        const rrSignals = [];
        const rrGaps = [];
        if (hasReturn)
            rrSignals.push('return_policy_present');
        else
            rrGaps.push('return_policy_missing');
        if (hasCod)
            rrSignals.push('cod_available');
        else
            rrGaps.push('cod_missing');
        if (hasWarranty)
            rrSignals.push('warranty_present');
        else
            rrGaps.push('warranty_missing');
        const rrCount = [hasReturn, hasCod, hasWarranty].filter(Boolean).length;
        const rrScore = Math.round((rrCount / 3) * 100);
        sc.riskReversal = { score: rrScore, signals: rrSignals, gaps: rrGaps };
        const flags = [];
        if (scoreTotal != null && scoreTotal < 40)
            flags.push('low_psychology_score');
        if (rrScore < 50)
            flags.push('weak_risk_reversal');
        return { scorecard: sc, flags: flags.length ? flags : undefined };
    }
    buildAiDecision(verdict, evidence, marketplace, priceFlags) {
        const linked = Array.isArray(evidence) ? evidence.filter(e => e.linkedToProduct === true) : [];
        const diversity = new Set(linked.map(e => e.type)).size;
        let conf = 40 + Math.min(50, diversity * 10);
        if (priceFlags && priceFlags.length)
            conf -= 10;
        const avgReliability = linked.length ? (linked.reduce((s, e) => s + (typeof e.reliability === 'number' ? e.reliability : 0.5), 0) / linked.length) : 0.5;
        const linkedRatio = evidence.length ? (linked.length / evidence.length) : 0;
        const reliabilityFactor = 0.6 + 0.4 * avgReliability;
        const linkedFactor = 0.6 + 0.4 * linkedRatio;
        conf = Math.round(Math.max(0, Math.min(100, conf * reliabilityFactor * linkedFactor)));
        const reasonIds = [];
        reasonIds.push(`linked_evidence_diversity:${diversity}`);
        for (const f of (priceFlags || []))
            reasonIds.push(`flag:${f}`);
        if (marketplace?.product?.ratingAvg != null)
            reasonIds.push(`rating_avg:${marketplace.product.ratingAvg}`);
        const missingRR = !marketplace?.product?.returnPolicy && !marketplace?.product?.warranty && marketplace?.product?.shipping?.cod !== true;
        if (missingRR)
            reasonIds.push('risk_reversal:missing');
        const sale = typeof marketplace?.price?.sale === 'number' ? marketplace.price.sale : undefined;
        const list = typeof marketplace?.price?.list === 'number' ? marketplace.price.list : undefined;
        if (sale != null && list != null && list > 0) {
            const dpct = Math.round(((list - sale) / list) * 100);
            if (dpct >= 30)
                reasonIds.push('price_discount_gt_30pct');
        }
        const reasons = reasonIds.map(id => ({ id }));
        const whatToCollectNext = [];
        if (diversity < 2)
            whatToCollectNext.push('add_creator_video_or_reviews');
        if (!marketplace?.product?.ratingCount)
            whatToCollectNext.push('collect_rating_count');
        if (!Array.isArray(marketplace?.price?.history) || marketplace.price.history?.length === 0)
            whatToCollectNext.push('collect_price_history_30d');
        const vids = evidence.filter(e => e.type === 'creatorVideo');
        if (vids.length > 0 && vids.every((v) => v.linkedToProduct !== true))
            whatToCollectNext.push('link_videos_to_product');
        const mappedVerdict = verdict === 'hold' ? 'unknown' : verdict;
        return { verdict: mappedVerdict, confidence: conf, reasons, whatToCollectNext };
    }
    extractYouTubeId(url) {
        try {
            const u = new URL(url);
            if (u.hostname.includes('youtu.be')) {
                return u.pathname.split('/').filter(Boolean)[0];
            }
            if (u.hostname.includes('youtube.com')) {
                return u.searchParams.get('v') || undefined;
            }
        }
        catch { }
        return undefined;
    }
    canonicalEvidenceKey(ev) {
        const url = typeof ev?.url === 'string' ? ev.url : undefined;
        if (!url)
            return undefined;
        const yid = this.extractYouTubeId(url);
        if (yid)
            return `yt:${yid}`;
        try {
            const u = new URL(url);
            u.search = '';
            u.hash = '';
            return `${u.hostname}${u.pathname}`;
        }
        catch {
            return url;
        }
    }
    dedupeEvidenceByCanonicalSource(evidence) {
        const seen = new Map();
        const out = [];
        for (const ev of evidence) {
            const key = this.canonicalEvidenceKey(ev);
            if (!key) {
                out.push(ev);
                continue;
            }
            if (!seen.has(key)) {
                seen.set(key, ev);
                out.push(ev);
                continue;
            }
            const prev = seen.get(key);
            if (prev?.type !== 'creatorVideo' && ev?.type === 'creatorVideo') {
                const idx = out.indexOf(prev);
                if (idx >= 0)
                    out[idx] = ev;
                else
                    out.push(ev);
                seen.set(key, ev);
            }
        }
        return out;
    }
    buildReviewsAggregate(product) {
        const count = typeof product?.reviewCount === 'number' ? product.reviewCount : undefined;
        const average = typeof product?.ratingAvg === 'number' ? product.ratingAvg : undefined;
        const breakdown = (() => {
            const src = product?.ratingDist || product?.ratingDistribution || product?.ratingBreakdown || product?.ratingStarsCount;
            if (!src || typeof src !== 'object')
                return undefined;
            const out = {};
            for (const k of Object.keys(src)) {
                const v = Number(src[k]);
                if (!Number.isFinite(v))
                    continue;
                const onlyDigits = String(k).replace(/[^0-9]/g, '');
                const key = ['1', '2', '3', '4', '5'].includes(onlyDigits) ? onlyDigits : String(k);
                out[key] = Math.trunc(v);
            }
            return Object.keys(out).length ? out : undefined;
        })();
        const recentCount30d = typeof product?.recentReviewCount30d === 'number' ? product.recentReviewCount30d : undefined;
        const verifiedPurchaseRatio = typeof product?.verifiedPurchaseRatio === 'number' ? product.verifiedPurchaseRatio : undefined;
        return { count, average, breakdown, recentCount30d, verifiedPurchaseRatio };
    }
    isReviewRelatedToProduct(review, normalization) {
        try {
            const txt = String(review?.text || '').toLowerCase();
            const brand = String(normalization?.brand || '').toLowerCase();
            const line = String(normalization?.line || '').toLowerCase();
            const variant = String(normalization?.variantKey || '').toLowerCase();
            const hasMedia = Array.isArray(this.normalizeMedia(review?.images)) && this.normalizeMedia(review?.images).length > 0;
            const verified = review?.verifiedPurchase === true;
            const brandHit = !!brand && txt.includes(brand);
            const lineHit = !!line && txt.includes(line);
            const variantHit = !!variant && txt.includes(variant);
            if (brand) {
                return brandHit || lineHit || variantHit || verified || hasMedia;
            }
            return verified || hasMedia;
        }
        catch {
            return true;
        }
    }
    detectPlatform(url) {
        const s = String(url || '').toLowerCase();
        if (s.includes('youtube.com') || s.includes('youtu.be'))
            return 'youtube';
        if (s.includes('tiktok.com'))
            return 'tiktok';
        if (s.includes('shopee'))
            return 'shopee';
        if (s.includes('lazada'))
            return 'lazada';
        return 'other';
    }
    filterUnrelatedVideos(evidence) {
        try {
            return evidence.filter(e => e.type !== 'creatorVideo' || e.linkedToProduct === true);
        }
        catch {
            return evidence;
        }
    }
    buildProductVideosFromEvidence(evidence) {
        const vids = Array.isArray(evidence) ? evidence.filter(e => e.type === 'creatorVideo' && e.linkedToProduct === true) : [];
        if (!vids.length)
            return undefined;
        const allowed = new Set(['demo', 'creator_review', 'live_replay', 'ugc']);
        return vids.map((ev) => ({
            url: typeof ev.url === 'string' ? ev.url : undefined,
            type: (allowed.has(String(ev?.source?.type || 'creator_review')) ? ev?.source?.type : 'creator_review'),
            views: typeof ev?.engagement?.views === 'number' ? ev.engagement.views : undefined,
            likes: typeof ev?.engagement?.likes === 'number' ? ev.engagement.likes : undefined,
            evidenceId: String(ev.id),
        })).filter(v => typeof v.url === 'string');
    }
    buildReviews(product, analysis, evidence, normalization) {
        if (Array.isArray(product.reviewsSample) && product.reviewsSample.length > 0) {
            const filtered = product.reviewsSample.filter((r) => this.isReviewRelatedToProduct(r, normalization));
            const chosen = (filtered.length > 0 ? filtered : product.reviewsSample).slice(0, 30);
            return chosen.map((review, index) => this.mapReviewItem(review, index, evidence));
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
        const hasPrice = product.price !== undefined && product.price !== null;
        const hasRatingAvg = product.ratingAvg !== undefined && product.ratingAvg !== null;
        const hasRatingCount = product.reviewCount !== undefined && product.reviewCount !== null;
        if (!hasPrice || !hasRatingAvg || !hasRatingCount)
            return 'hold';
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
    buildAvailability(product) {
        const stockRaw = product?.stock ?? product?.stockCount;
        const inStockFlag = product?.inStock === true || product?.available === true;
        const soldOutFlag = product?.soldOut === true || product?.available === false;
        let stockStatus = 'unknown';
        if (typeof stockRaw === 'number') {
            if (stockRaw <= 0)
                stockStatus = 'out_of_stock';
            else if (stockRaw <= 5)
                stockStatus = 'low_stock';
            else
                stockStatus = 'in_stock';
        }
        else if (soldOutFlag) {
            stockStatus = 'out_of_stock';
        }
        else if (inStockFlag) {
            stockStatus = 'in_stock';
        }
        const shipFrom = product?.shipFrom || product?.shopLocation || undefined;
        const shipping = product?.shipping && typeof product.shipping === 'object' ? product.shipping : undefined;
        const etaDays = (() => {
            if (shipping) {
                const min = typeof shipping.minDays === 'number' ? shipping.minDays : undefined;
                const max = typeof shipping.maxDays === 'number' ? shipping.maxDays : undefined;
                if (min != null && max != null)
                    return Math.round((min + max) / 2);
                if (min != null)
                    return min;
                if (max != null)
                    return max;
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
    normalizeVndScale(value, currency, platform) {
        const n = typeof value === 'number' ? value : undefined;
        if (n == null)
            return undefined;
        return n;
    }
    toIsoDateTime(v) {
        try {
            const d = v ? new Date(v) : new Date();
            const iso = d.toISOString();
            return iso;
        }
        catch {
            return new Date().toISOString();
        }
    }
    toIsoDate(v) {
        try {
            if (v == null)
                return undefined;
            const d = new Date(v);
            const s = d.toISOString().slice(0, 10);
            return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : undefined;
        }
        catch {
            return undefined;
        }
    }
    pickTopicEvidenceIds(evidence) {
        const nonProduct = evidence.filter(e => e.type !== 'productPage');
        const linkedCreator = nonProduct.filter(e => e.type === 'creatorVideo' && e.linkedToProduct === true);
        const linkedOthers = nonProduct.filter(e => e.type !== 'creatorVideo' && e.linkedToProduct === true);
        const unlinkedCreator = nonProduct.filter(e => e.type === 'creatorVideo' && e.linkedToProduct !== true);
        const unlinkedOthers = nonProduct.filter(e => e.type !== 'creatorVideo' && e.linkedToProduct !== true);
        const ordered = [...linkedCreator, ...linkedOthers, ...unlinkedCreator, ...unlinkedOthers];
        return ordered.slice(0, 5).map(e => String(e.id));
    }
};
exports.ResponseMapper = ResponseMapper;
exports.ResponseMapper = ResponseMapper = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [psychology_service_1.PsychologyService])
], ResponseMapper);
//# sourceMappingURL=response.mapper.js.map