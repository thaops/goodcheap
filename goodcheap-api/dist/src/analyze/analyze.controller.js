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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AnalyzeController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyzeController = void 0;
const common_1 = require("@nestjs/common");
const analyze_service_1 = require("./analyze.service");
const commerceReviewResponse_schema_1 = require("../common/schemas/commerceReviewResponse.schema");
const common_2 = require("@nestjs/common");
const evidence_aggregator_interface_1 = require("../common/interfaces/evidence-aggregator.interface");
const simplified_response_mapper_1 = require("./simplified-response.mapper");
const swagger_1 = require("@nestjs/swagger");
let AnalyzeController = AnalyzeController_1 = class AnalyzeController {
    analyze;
    unfurl;
    responseMapper;
    simplifiedResponseMapper;
    geminiService;
    evidenceValidator;
    reviewsService;
    evidenceAggregator;
    constructor(analyze, unfurl, responseMapper, simplifiedResponseMapper, geminiService, evidenceValidator, reviewsService, evidenceAggregator) {
        this.analyze = analyze;
        this.unfurl = unfurl;
        this.responseMapper = responseMapper;
        this.simplifiedResponseMapper = simplifiedResponseMapper;
        this.geminiService = geminiService;
        this.evidenceValidator = evidenceValidator;
        this.reviewsService = reviewsService;
        this.evidenceAggregator = evidenceAggregator;
    }
    logger = new common_1.Logger(AnalyzeController_1.name);
    get debugTiming() {
        return (process.env.GC_DEBUG_TIMING ?? '0') === '1';
    }
    now() {
        return Date.now();
    }
    dur(msStart) {
        return Date.now() - msStart;
    }
    async analyzeUrl(body, format) {
        const LLM_ENABLED = (process.env.GC_ENABLE_LLM ?? 'false') === 'true';
        const FALLBACK = (process.env.ANALYZE_FALLBACK ?? '0') === '1';
        const hasGemini = !!this.geminiService &&
            typeof this.geminiService.enrichAnalysis === 'function';
        const CAN_USE_LLM = LLM_ENABLED && !FALLBACK && hasGemini;
        const LLM_STRICT = LLM_ENABLED && (process.env.GC_LLM_STRICT ?? 'true') === 'true';
        const TTK_ENABLED = (process.env.GC_ENABLE_TIKTOK_SEARCH ?? '1') === '1';
        const YT_ENABLED = (process.env.GC_ENABLE_YOUTUBE_SEARCH ?? '1') === '1';
        const AUTO_SCRAPE = (process.env.GC_AUTO_SCRAPE_REVIEWS ?? '0') === '1';
        const product = body.url ? await this.unfurl.fromUrl(body.url) : null;
        if (!product) {
            throw new Error('Require "url" in body');
        }
        let productForAnalyze = { ...product };
        const collectedVideos = [];
        try {
            const urlForId = productForAnalyze.finalUrl ||
                productForAnalyze.canonicalUrl ||
                '';
            if (!productForAnalyze.productId || productForAnalyze.productId === '') {
                const pid = this.productIdFromUrl(urlForId);
                if (pid)
                    productForAnalyze.productId = pid;
            }
        }
        catch { }
        if (TTK_ENABLED &&
            typeof this.geminiService?.searchTikTokReviews === 'function') {
            const tTk = this.now();
            try {
                const timeoutMs = Math.max(5000, Math.min(30000, Number(process.env.TIKTOK_SEARCH_TIMEOUT_MS || 12000)));
                const tiktokPromise = this.geminiService
                    .searchTikTokReviews(productForAnalyze)
                    .then((arr) => (Array.isArray(arr) ? arr : []))
                    .catch(() => []);
                let toTk;
                const timeoutPromiseTk = new Promise((resolve) => {
                    toTk = setTimeout(() => resolve('__timeout__'), timeoutMs);
                });
                const timed = await Promise.race([
                    tiktokPromise,
                    timeoutPromiseTk,
                ]);
                if (toTk)
                    clearTimeout(toTk);
                const tiktokReviews = timed === '__timeout__' ? [] : timed;
                if (tiktokReviews.length) {
                    const existing = Array.isArray(product.reviewsSample)
                        ? product.reviewsSample
                        : [];
                    const merged = [
                        ...existing,
                        ...tiktokReviews.map((r, i) => ({
                            id: String(r.id ?? `tt_${i}`),
                            rating: typeof r.rating === 'number' ? r.rating : undefined,
                            text: String(r.text || r.title || r.url || ''),
                            images: Array.isArray(r.images) ? r.images : undefined,
                            authorName: r.authorName ? String(r.authorName) : undefined,
                            source: 'tiktok_video',
                            createdAt: r.date || r.createdAt || undefined,
                            url: r.url,
                        })),
                    ];
                    productForAnalyze = {
                        ...productForAnalyze,
                        reviewsSample: merged,
                    };
                    for (const r of tiktokReviews) {
                        if (r?.url && typeof r.url === 'string') {
                            collectedVideos.push({ url: r.url, type: 'creator_review' });
                        }
                    }
                }
                if (this.debugTiming)
                    this.logger.log(`[timing] tiktok.search: ${this.dur(tTk)}ms found=${tiktokReviews.length}`);
            }
            catch (e) {
                if (this.debugTiming)
                    this.logger.log(`[timing] tiktok.search: failed in ${this.dur(tTk)}ms: ${e?.message || e}`);
            }
        }
        else if (this.debugTiming) {
            const reason = !TTK_ENABLED ? 'DISABLED' : 'NO_METHOD';
            this.logger.log(`[timing] tiktok.search: skipped (${reason})`);
        }
        if (YT_ENABLED &&
            typeof this.geminiService?.searchYouTubeReviews === 'function') {
            const tYt = this.now();
            try {
                const timeoutMs = Math.max(4000, Math.min(20000, Number(process.env.YOUTUBE_SEARCH_TIMEOUT_MS || 8000)));
                const ytPromise = this.geminiService
                    .searchYouTubeReviews(productForAnalyze)
                    .then((arr) => (Array.isArray(arr) ? arr : []))
                    .catch(() => []);
                let toYt;
                const timeoutPromiseYt = new Promise((resolve) => {
                    toYt = setTimeout(() => resolve('__timeout__'), timeoutMs);
                });
                const timed = await Promise.race([
                    ytPromise,
                    timeoutPromiseYt,
                ]);
                if (toYt)
                    clearTimeout(toYt);
                const ytReviews = timed === '__timeout__' ? [] : timed;
                if (ytReviews.length) {
                    const existing = Array.isArray(productForAnalyze.reviewsSample)
                        ? productForAnalyze.reviewsSample
                        : [];
                    const seen = new Set(existing.map((r) => r.url || r.text));
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
                        const key = m.url || m.text;
                        if (!key)
                            return true;
                        if (seen.has(key))
                            return false;
                        seen.add(key);
                        return true;
                    });
                    const merged = [...existing, ...deduped];
                    productForAnalyze = {
                        ...productForAnalyze,
                        reviewsSample: merged,
                    };
                    for (const r of ytReviews) {
                        if (r?.url && typeof r.url === 'string') {
                            collectedVideos.push({ url: r.url, type: 'creator_review' });
                        }
                    }
                }
                if (this.debugTiming)
                    this.logger.log(`[timing] youtube.search: ${this.dur(tYt)}ms found=${ytReviews.length}`);
            }
            catch (e) {
                if (this.debugTiming)
                    this.logger.log(`[timing] youtube.search: failed in ${this.dur(tYt)}ms: ${e?.message || e}`);
            }
        }
        else if (this.debugTiming) {
            const reason = !YT_ENABLED ? 'DISABLED' : 'NO_METHOD';
            this.logger.log(`[timing] youtube.search: skipped (${reason})`);
        }
        try {
            const existingVideos = Array.isArray(productForAnalyze.videos)
                ? productForAnalyze.videos
                : [];
            const mergedVideos = [...existingVideos, ...collectedVideos];
            const uniq = new Map();
            for (const v of mergedVideos) {
                const url = typeof v?.url === 'string' ? v.url : undefined;
                if (!url)
                    continue;
                if (!uniq.has(url))
                    uniq.set(url, v);
            }
            productForAnalyze.videos = Array.from(uniq.values());
        }
        catch { }
        if (Array.isArray(productForAnalyze.videos)) {
            const isVideoUrl = (u) => {
                try {
                    const url = new URL(u);
                    const h = url.hostname.toLowerCase();
                    const p = url.pathname.toLowerCase();
                    const isTikTokVideo = h.endsWith('tiktok.com') && /\/video\//.test(p);
                    const isTikTokProduct = h.endsWith('tiktok.com') && /\/view\/product\//.test(p);
                    const isYouTubeWatch = (h.endsWith('youtube.com') &&
                        (p === '/watch' || p.startsWith('/shorts'))) ||
                        h === 'youtu.be';
                    return (isTikTokVideo || isYouTubeWatch) && !isTikTokProduct;
                }
                catch {
                    return false;
                }
            };
            productForAnalyze.videos = productForAnalyze.videos
                .filter((v) => typeof v?.url === 'string' && isVideoUrl(v.url))
                .filter((v, i, arr) => arr.findIndex((x) => x?.url === v?.url) === i);
        }
        const isTikTok = (productForAnalyze.finalUrl ||
            productForAnalyze.canonicalUrl ||
            '').includes('tiktok.com');
        if (AUTO_SCRAPE &&
            isTikTok &&
            typeof this.reviewsService?.extractReviews === 'function') {
            const tPl = this.now();
            try {
                const timeoutMs = Math.max(5000, Math.min(30000, Number(process.env.REVIEWS_SCRAPE_TIMEOUT_MS || 12000)));
                const scrapePromise = this.reviewsService
                    .extractReviews(productForAnalyze)
                    .then((arr) => (Array.isArray(arr) ? arr : []))
                    .catch(() => []);
                let toPl;
                const timeoutPromisePl = new Promise((resolve) => {
                    toPl = setTimeout(() => resolve('__timeout__'), timeoutMs);
                });
                const timed = await Promise.race([
                    scrapePromise,
                    timeoutPromisePl,
                ]);
                if (toPl)
                    clearTimeout(toPl);
                const platReviews = timed === '__timeout__' ? [] : timed;
                if (platReviews.length) {
                    const existing = Array.isArray(productForAnalyze.reviewsSample)
                        ? productForAnalyze.reviewsSample
                        : [];
                    const merged = [
                        ...existing,
                        ...platReviews.map((r, i) => ({
                            id: String(r.id ?? `pf_${i}`),
                            rating: typeof r.rating === 'number'
                                ? r.rating
                                : typeof r.rating === 'string'
                                    ? Number(r.rating)
                                    : undefined,
                            text: String(r.text || ''),
                            images: Array.isArray(r.images) ? r.images : undefined,
                            authorName: r.authorName || r.author || undefined,
                            source: 'platform',
                            createdAt: r.date || r.createdAt || undefined,
                        })),
                    ];
                    productForAnalyze = {
                        ...productForAnalyze,
                        reviewsSample: merged,
                    };
                }
                if (this.debugTiming)
                    this.logger.log(`[timing] platform.reviews: ${this.dur(tPl)}ms found=${platReviews.length}`);
            }
            catch (e) {
                if (this.debugTiming)
                    this.logger.log(`[timing] platform.reviews: failed in ${this.dur(tPl)}ms: ${e?.message || e}`);
            }
        }
        else if (this.debugTiming) {
            const reason = !AUTO_SCRAPE ? 'DISABLED' : 'NO_METHOD_OR_NOT_TIKTOK';
            this.logger.log(`[timing] platform.reviews: skipped (${reason})`);
        }
        if (isTikTok) {
            const tMt = this.now();
            try {
                const timeoutMs = Math.max(5000, Math.min(30000, Number(process.env.REVIEWS_SCRAPE_TIMEOUT_MS || 12000)));
                const metaPromise = this.reviewsService
                    .extractTikTokMeta(productForAnalyze)
                    .then((m) => (m && typeof m === 'object' ? m : {}))
                    .catch(() => ({}));
                let toMt;
                const timeoutPromiseMt = new Promise((resolve) => {
                    toMt = setTimeout(() => resolve('__timeout__'), timeoutMs);
                });
                const timed = await Promise.race([
                    metaPromise,
                    timeoutPromiseMt,
                ]);
                if (toMt)
                    clearTimeout(toMt);
                const meta = timed === '__timeout__' ? {} : timed;
                if (meta && Object.keys(meta).length) {
                    productForAnalyze = { ...productForAnalyze, ...meta };
                }
                if (this.debugTiming)
                    this.logger.log(`[timing] platform.meta: ${this.dur(tMt)}ms hasMeta=${Object.keys(meta || {}).length > 0}`);
            }
            catch (e) {
                if (this.debugTiming)
                    this.logger.log(`[timing] platform.meta: failed in ${this.dur(tMt)}ms: ${e?.message || e}`);
            }
        }
        const t0 = this.now();
        let analysis = await this.analyze.analyzeProduct(productForAnalyze);
        if (this.debugTiming)
            this.logger.log(`[timing] analyzeProduct: ${this.dur(t0)}ms`);
        const actions = this.analyze.getActions(productForAnalyze);
        if (CAN_USE_LLM) {
            const t1 = this.now();
            const nowIso = new Date().toISOString();
            const rawUrl = productForAnalyze.finalUrl ||
                productForAnalyze.canonicalUrl;
            const baseEvidence = rawUrl
                ? [
                    {
                        id: 'prod:page',
                        type: 'productPage',
                        url: rawUrl,
                        scrapedAt: nowIso,
                        reliability: 0.35,
                    },
                ]
                : [];
            const videoEvidence = Array.isArray(productForAnalyze.videos)
                ? productForAnalyze.videos.map((v, idx) => ({
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
            if (this.debugTiming)
                this.logger.log(`[timing] gemini.enrichAnalysis: ${this.dur(t1)}ms`);
        }
        else {
            if (this.debugTiming) {
                const reason = !LLM_ENABLED
                    ? 'LLM_DISABLED'
                    : FALLBACK
                        ? 'FALLBACK_ON'
                        : !hasGemini
                            ? 'GEMINI_UNAVAILABLE'
                            : 'UNKNOWN';
                this.logger.log(`[timing] gemini.enrichAnalysis: skipped (${reason})`);
            }
        }
        const t2 = this.now();
        const response = this.responseMapper.mapToEvidenceFirstResponse(productForAnalyze, analysis, actions);
        if (this.debugTiming)
            this.logger.log(`[timing] mapToEvidenceFirstResponse: ${this.dur(t2)}ms`);
        const t3 = this.now();
        const validation = this.evidenceValidator.validate(response);
        if (this.debugTiming)
            this.logger.log(`[timing] evidenceValidator.validate: ${this.dur(t3)}ms`);
        if (!validation.isValid && LLM_STRICT) {
            throw new common_2.UnprocessableEntityException({
                message: 'Evidence validation failed',
                errors: validation.errors,
            });
        }
        response.system = response.system ?? {};
        if (!validation.isValid) {
            response.system.warnings = [
                ...(response.system.warnings ?? []),
                'Evidence validation failed',
            ];
        }
        try {
            const tAg = this.now();
            const projected = Array.isArray(response.evidence)
                ? response.evidence.map((e) => {
                    const url = typeof e.url === 'string' ? e.url : undefined;
                    let source = e.source;
                    if (!source && url) {
                        try {
                            source = new URL(url).hostname;
                        }
                        catch { }
                    }
                    return {
                        id: String(e.id || ''),
                        type: String(e.type || 'unknown'),
                        source: String(source || 'unknown'),
                        content: String(url || e.note || e.type || ''),
                        timestamp: typeof e.scrapedAt === 'string' ? e.scrapedAt : undefined,
                    };
                })
                : [];
            const aggregated = this.evidenceAggregator.aggregateEvidence(projected);
            const contradictions = this.evidenceAggregator.crossReferenceEvidence(aggregated);
            const diagnostics = this.evidenceAggregator.generateDiagnostics(aggregated);
            const diagMsgs = diagnostics.map((d) => `EV:${d.code} (${d.severity}) - ${d.message}`);
            const contraMsgs = contradictions.map((c) => `EV:contradiction between ${c.evidenceId1} and ${c.evidenceId2}: ${c.contradiction}`);
            if (diagMsgs.length || contraMsgs.length) {
                response.system.warnings = [
                    ...(response.system.warnings ?? []),
                    ...diagMsgs,
                    ...contraMsgs,
                ];
            }
            if (this.debugTiming)
                this.logger.log(`[timing] evidence.aggregate+diagnostics: ${this.dur(tAg)}ms diag=${diagMsgs.length} contra=${contraMsgs.length}`);
        }
        catch (e) {
            if (this.debugTiming)
                this.logger.warn(`[timing] evidence.aggregate+diagnostics: failed ${e?.message || e}`);
        }
        const t4 = this.now();
        const parsed = commerceReviewResponse_schema_1.CommerceReviewResponseSchema.safeParse(response);
        if (this.debugTiming)
            this.logger.log(`[timing] zod.safeParse: ${this.dur(t4)}ms`);
        if (!parsed.success) {
            if (LLM_STRICT) {
                throw new common_2.UnprocessableEntityException({
                    message: 'Response schema validation failed',
                    issues: parsed.error.issues,
                });
            }
            response.system = response.system ?? {};
            response.system.warnings = [
                ...(response.system.warnings ?? []),
                'Schema validation failed - response may be incomplete',
            ];
            if (format === 'simplified') {
                const t5 = this.now();
                const simplifiedResponse = this.simplifiedResponseMapper.transform(response);
                if (this.debugTiming)
                    this.logger.log(`[timing] simplifiedResponseMapper.transform: ${this.dur(t5)}ms`);
                return simplifiedResponse;
            }
            return response;
        }
        if (format === 'simplified') {
            const t5 = this.now();
            const simplifiedResponse = this.simplifiedResponseMapper.transform(parsed.data);
            if (this.debugTiming)
                this.logger.log(`[timing] simplifiedResponseMapper.transform: ${this.dur(t5)}ms`);
            return simplifiedResponse;
        }
        if (this.debugTiming)
            this.logger.log(`[timing] total: ${this.dur(t0)}ms`);
        return parsed.data;
    }
    alignAspectsToRubric(aspects, _requiredNames) {
        return (aspects || []).map((a) => ({
            ...a,
            name: this.normalizeAspectName(a?.name) || a?.name,
            metrics: Array.isArray(a?.metrics) ? a.metrics : [],
            quotes: Array.isArray(a?.quotes) ? a.quotes : [],
            fitFor: Array.isArray(a?.fitFor) ? a.fitFor : [],
        }));
    }
    buildAspectScores(aspects, rubricWeights) {
        return aspects.map((a) => {
            const name = a.name;
            const scoreRaw = typeof a.score === 'number' ? a.score : undefined;
            const scoreWeighted = typeof scoreRaw === 'number'
                ? (scoreRaw / 5) *
                    (rubricWeights[name] ?? 0)
                : undefined;
            return { name, scoreRaw, scoreWeighted };
        });
    }
    defaultMetricsForAspect(name) {
        return [
            {
                name: 'positive_mentions',
                observed: undefined,
                expected: undefined,
                unit: 'count',
            },
            {
                name: 'negative_mentions',
                observed: undefined,
                expected: undefined,
                unit: 'count',
            },
            {
                name: 'neutral_mentions',
                observed: undefined,
                expected: undefined,
                unit: 'count',
            },
            {
                name: 'avg_sentiment',
                observed: undefined,
                expected: undefined,
                unit: 'score',
            },
            {
                name: 'supporting_evidence',
                observed: undefined,
                expected: undefined,
                unit: 'count',
            },
        ].map((m) => ({ ...m, aspect: name }));
    }
    normalizeAspectName(name) {
        if (!name)
            return undefined;
        const mapping = {
            'tổng quan': 'overview',
            'chất lượng âm thanh': 'soundQuality',
            pin: 'battery',
            'micro trong gọi': 'micCall',
            'chống ồn': 'noiseControl',
            'độ thoải mái': 'comfortFit',
            'độ bền': 'durability',
            'kết nối': 'connectivity',
            'bảo hành hỗ trợ': 'warrantySupport',
        };
        return mapping[name] || name;
    }
    platformFromUrl(u) {
        try {
            const url = new URL(u || '');
            if (url.hostname.includes('tiktok'))
                return 'tiktok';
            if (url.hostname.includes('shopee'))
                return 'shopee';
            if (url.hostname.includes('lazada'))
                return 'lazada';
            return 'other';
        }
        catch {
            return undefined;
        }
    }
    productIdFromUrl(u) {
        try {
            const url = new URL(u || '');
            if (url.hostname.includes('shopee')) {
                const match = url.pathname.match(/-i\.(\d+)-(\d+)/);
                return match?.[2];
            }
            if (url.hostname.includes('lazada')) {
                const params = new URLSearchParams(url.search);
                return params.get('pid') || undefined;
            }
            if (url.hostname.includes('tiktok')) {
                const m = url.pathname.match(/(?:^|\/)product\/(\d+)/) ||
                    url.pathname.match(/(?:^|\/)view\/product\/(\d+)/) ||
                    url.pathname.match(/(\d{8,})/);
                return m?.[1];
            }
            return undefined;
        }
        catch {
            return undefined;
        }
    }
    buildDataIntegrity(params) {
        const issues = [];
        if (typeof params.overallScore === 'number' &&
            params.overallScore <= 60 &&
            params.verdict === 'buy') {
            issues.push({
                code: 'verdict_signal_divergence',
                severity: 'high',
                message: 'Signals may diverge from the current verdict; please recheck scoring and evidence.',
                paths: ['$.analysis.overallScore', '$.decision.verdict'],
            });
        }
        const names = new Set((params.aspects || []).map((a) => a.name));
        const missing = params.requiredAspects.filter((n) => !names.has(n));
        if (missing.length) {
            issues.push({
                code: 'aspects_schema_mismatch',
                severity: 'medium',
                message: `Thiếu khía cạnh: ${missing.join(', ')}`,
                paths: ['$.aspects', '$.rubric.weights'],
            });
        }
        if (!params.citationsCount || params.citationsCount <= 0) {
            issues.push({
                code: 'empty_citations',
                severity: 'low',
                message: 'Thiếu citations trong aiAnalysis',
                paths: ['$.aiAnalysis.citations'],
            });
        }
        if (!params.canonicalUrl) {
            issues.push({
                code: 'missing_canonical_url',
                severity: 'high',
                message: 'Thiếu canonicalUrl đã sanitize.',
                paths: ['$.product.canonicalUrl'],
            });
        }
        try {
            const evArr = params.evidence && Array.isArray(params.evidence)
                ? params.evidence
                : [];
            const uniqTypes = new Set(evArr.map((e) => e.type));
            if (uniqTypes.size > 0 && uniqTypes.size < 3) {
                issues.push({
                    code: 'insufficient_source_diversity',
                    severity: 'medium',
                    message: 'Cần ít nhất 3 nguồn độc lập (productPage, marketplace khác, review độc lập).',
                    paths: ['$.evidence[*].type'],
                });
            }
        }
        catch { }
        try {
            const pr = params.pricing;
            const hasPrice = pr && typeof pr.currentPrice === 'number';
            const seg = pr?.segment;
            if (!hasPrice && pr !== undefined && (!seg || seg === 'unknown')) {
                issues.push({
                    code: 'missing_pricing_segment',
                    severity: 'medium',
                    message: 'Thiếu pricing.segment khi currentPrice=null.',
                    paths: ['$.pricing.segment'],
                });
            }
        }
        catch { }
        const schemaViolationCodes = new Set([
            'aspects_schema_mismatch',
            'invalid_metric_direction',
            'mixed_target_types',
        ]);
        const hasSchemaViolation = issues.some((i) => schemaViolationCodes.has(i.code));
        const status = hasSchemaViolation
            ? 'invalid'
            : issues.length
                ? 'partial'
                : 'valid';
        const totalMetrics = (params.aspects || []).reduce((acc, a) => acc + (a.metrics?.length || 0), 0) || 0;
        const observedCount = (params.aspects || []).reduce((acc, a) => acc + (a.metrics || []).filter((m) => m.observed != null).length, 0);
        const completeness = totalMetrics
            ? Math.round((observedCount / totalMetrics) * 100)
            : 0;
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
};
exports.AnalyzeController = AnalyzeController;
__decorate([
    (0, swagger_1.ApiQuery)({
        name: 'format',
        required: false,
        description: 'Response format: "simplified" cho cấu trúc đơn giản hơn, mặc định là "detailed"',
        enum: ['detailed', 'simplified'],
        example: 'simplified',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Chỉ cần cung cấp url sản phẩm. Backend sẽ tự fetch và parse dữ liệu.',
        required: true,
        schema: {
            description: 'Gửi duy nhất một object với field url.',
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    format: 'uri',
                    example: 'https://vt.tiktok.com/...',
                },
            },
            required: ['url'],
            examples: {
                byUrlOnly: {
                    summary: 'Chỉ gửi URL (khuyến nghị)',
                    value: {
                        url: 'https://vt.tiktok.com/ZSAd4U7QN/',
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Phân tích sản phẩm và review (ưu tiên TikTok)',
        description: `Flow xử lý:
    1) unfurl từ URL để lấy metadata chuẩn.
    2) Nếu là TikTok: gọi reviewsService.extractTikTokMeta để đọc giá/đánh giá từ network JSON (không scale VND sai, tôn trọng clamp giá VND).
    3) Tuỳ ENV: có thể tìm video TikTok/YouTube liên quan và/hoặc scrape review platform.
    4) Tổng hợp phân tích, ánh xạ về evidence-first response.`,
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Kết quả phân tích sản phẩm. Mặc định trả về detailed format (evidence-first response), có thể chọn simplified format bằng ?format=simplified',
        schema: {
            oneOf: [
                {
                    title: 'Detailed Response (mặc định)',
                    example: {
                        schemaVersion: '1.1.0',
                        meta: {
                            platform: 'tiktok',
                            locale: 'vi-VN',
                            currency: 'VND',
                            timestamp: '2025-08-23T07:54:04.752Z',
                            productId: '1729716558552467894',
                        },
                        product: {
                            title: 'CeraVe Foaming Cleanser 236ML',
                            images: ['https://...img1.jpg'],
                            canonicalUrl: 'https://www.tiktok.com/view/product/1729716558552467894',
                        },
                        aiAnalysis: {
                            verdict: 'consider',
                            confidence: 0.54,
                            reasons: ['Tỉ lệ review có ảnh/video: 100%'],
                        },
                    },
                },
                {
                    title: 'Simplified Response (?format=simplified)',
                    example: {
                        product: {
                            id: '1729716558552467894',
                            title: 'CeraVe Foaming Cleanser 236ML',
                            brand: 'CeraVe',
                            images: ['https://...img1.jpg'],
                            canonicalUrl: 'https://www.tiktok.com/view/product/1729716558552467894',
                        },
                        pricing: {
                            currency: 'VND',
                            availability: 'unknown',
                        },
                        reviews: {
                            totalCount: 6,
                            items: [],
                        },
                        reviewSummary: {
                            topPros: ['Sản phẩm có tiêu đề rõ ràng'],
                            topCons: ['Không có thông tin giá'],
                            topics: [],
                            reviewWithMediaPercent: 1,
                        },
                        policies: {},
                        aiAnalysis: {
                            verdict: 'hold',
                            confidence: 54,
                            reasons: ['Tỉ lệ review có ảnh/video: 100%'],
                            overallScore: 2,
                            trustScore: 2,
                            evidenceScore: 0,
                        },
                        evidence: {
                            productPage: 'https://vt.tiktok.com/ZSAd4U7QN/',
                            linkedVideos: [],
                            reliability: 0.35,
                        },
                        meta: {
                            platform: 'tiktok',
                            locale: 'vi-VN',
                            timestamp: '2025-08-23T07:54:04.752Z',
                        },
                    },
                },
            ],
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Body JSON không hợp lệ',
        schema: {
            example: {
                message: "Expected ',' or '}' after property value in JSON at position 117",
                error: 'Bad Request',
                statusCode: 400,
            },
        },
    }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalyzeController.prototype, "analyzeUrl", null);
exports.AnalyzeController = AnalyzeController = AnalyzeController_1 = __decorate([
    (0, swagger_1.ApiTags)('analyze'),
    (0, common_1.Controller)('analyze'),
    __param(1, (0, common_1.Inject)('UnfurlService')),
    __param(2, (0, common_1.Inject)('ResponseMapper')),
    __param(3, (0, common_1.Inject)('SimplifiedResponseMapper')),
    __param(4, (0, common_1.Inject)('GeminiService')),
    __param(5, (0, common_1.Inject)('EvidenceValidator')),
    __param(6, (0, common_1.Inject)('ReviewsService')),
    __param(7, (0, common_1.Inject)(evidence_aggregator_interface_1.EVIDENCE_AGGREGATOR_TOKEN)),
    __metadata("design:paramtypes", [analyze_service_1.AnalyzeService, Object, Object, simplified_response_mapper_1.SimplifiedResponseMapper, Object, Object, Object, Object])
], AnalyzeController);
//# sourceMappingURL=analyze.controller.js.map