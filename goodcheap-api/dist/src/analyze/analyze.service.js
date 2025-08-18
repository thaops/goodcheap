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
var AnalyzeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyzeService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const reviews_service_1 = require("../reviews/reviews.service");
let AnalyzeService = AnalyzeService_1 = class AnalyzeService {
    reviewsService;
    gemini;
    modelName;
    logger = new common_1.Logger(AnalyzeService_1.name);
    get debugTiming() { return (process.env.GC_DEBUG_TIMING ?? '0') === '1'; }
    now() { return Date.now(); }
    dur(t0) { return Date.now() - t0; }
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
        const key = process.env.GOOGLE_API_KEY?.trim();
        this.modelName = process.env.ANALYZE_MODEL || 'gemini-1.5-flash';
        this.gemini = key ? new generative_ai_1.GoogleGenerativeAI(key) : null;
    }
    norm(v, min = 0, max = 1) {
        if (v == null)
            return 0.5;
        const x = Math.max(min, Math.min(max, v));
        return x;
    }
    parseJsonLlm(raw) {
        const fallbackEmpty = {};
        if (!raw)
            return fallbackEmpty;
        let text = String(raw).trim();
        if (text.startsWith('```')) {
            text = text.replace(/^```[a-zA-Z]*\s*/m, '');
            const lastFence = text.lastIndexOf('```');
            if (lastFence !== -1) {
                text = text.slice(0, lastFence);
            }
            text = text.trim();
        }
        try {
            return JSON.parse(text);
        }
        catch { }
        const candidates = [];
        const objStart = text.indexOf('{');
        const objEnd = text.lastIndexOf('}');
        if (objStart !== -1 && objEnd > objStart) {
            candidates.push(text.slice(objStart, objEnd + 1));
        }
        const arrStart = text.indexOf('[');
        const arrEnd = text.lastIndexOf(']');
        if (arrStart !== -1 && arrEnd > arrStart) {
            candidates.push(text.slice(arrStart, arrEnd + 1));
        }
        for (const c of candidates) {
            try {
                return JSON.parse(c);
            }
            catch { }
        }
        this.logger.warn('Failed to parse JSON from LLM response, returning empty object');
        return fallbackEmpty;
    }
    calcScore(p) {
        const q = this.norm(p.ratingAvg, 0, 5);
        const r = this.norm(p.reviewCount ? Math.log10((1 + p.reviewCount)) : undefined, 0, 4);
        const quality = 0.7 * q + 0.3 * r;
        const priceFairness = 0.5;
        let score = 100 * (0.65 * quality + 0.35 * priceFairness);
        if (!p.images?.length)
            score -= 5;
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    async summarizeProsCons(p) {
        const LLM_ENABLED = (process.env.GC_ENABLE_LLM ?? 'false') === 'true';
        const FALLBACK = process.env.ANALYZE_FALLBACK === '1';
        const canUseLlmInternally = !!this.gemini && LLM_ENABLED && !FALLBACK;
        if (!canUseLlmInternally) {
            const pros = [];
            const cons = [];
            if (p.title) {
                pros.push(`Sản phẩm có tiêu đề: "${p.title}"`);
            }
            if (p.price) {
                pros.push(`Sản phẩm có giá ${p.price} ${p.currency || 'VND'}`);
            }
            else {
                cons.push('Không có thông tin giá');
            }
            if (p.ratingAvg) {
                pros.push(`Sản phẩm có đánh giá trung bình ${p.ratingAvg}/5 sao`);
            }
            else {
                cons.push('Không có đánh giá trung bình');
            }
            if (p.reviewCount) {
                pros.push(`Sản phẩm có ${p.reviewCount} đánh giá`);
            }
            else {
                cons.push('Không có số lượng đánh giá');
            }
            if (p.images?.length) {
                pros.push(`Sản phẩm có ${p.images.length} ảnh minh họa`);
            }
            else {
                cons.push('Không có ảnh minh họa');
            }
            return {
                pros: pros.filter(Boolean),
                cons: cons.filter(Boolean),
                summary: p.title ? `Phân tích sản phẩm: ${p.title}` : undefined,
                confidence: 0.3
            };
        }
        else {
            const reviewsText = (p.reviewsSample || [])
                .map(r => `- (${r.rating ?? 'n/a'}★) ${r.text}`)
                .slice(0, 30)
                .join('\n');
            const base = `${p.title || ''}\n\n${(p.description || '').slice(0, 1500)}\n\nReviews:\n${reviewsText}`;
            try {
                const model = this.gemini.getGenerativeModel({ model: this.modelName, generationConfig: { responseMimeType: 'application/json' } });
                const prompt = `Tóm tắt điểm mạnh và điểm yếu của sản phẩm từ dữ liệu sau:\n\n${base}\n\nTrả về JSON hợp lệ với schema: { pros: string[], cons: string[], summary: string, confidence: number }`;
                const result = await model.generateContent(prompt);
                const text = result.response.text();
                const parsed = this.parseJsonLlm(text);
                return {
                    pros: Array.isArray(parsed.pros) ? parsed.pros.filter(Boolean) : [],
                    cons: Array.isArray(parsed.cons) ? parsed.cons.filter(Boolean) : [],
                    summary: typeof parsed.summary === 'string' ? parsed.summary : undefined,
                    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : undefined,
                };
            }
            catch (e) {
                const status = e?.status ?? e?.response?.status ?? e?.response?.statusCode;
                const code = e?.code ?? e?.response?.data?.error?.status;
                const msg = e?.message || 'Gemini request failed';
                this.logger.error(`Gemini summarize failed`, { status, code, msg });
                const pros = [];
                const cons = [];
                if (p.title)
                    pros.push(`Sản phẩm có tiêu đề: "${p.title}"`);
                if (p.price)
                    pros.push(`Sản phẩm có giá ${p.price} ${p.currency || 'VND'}`);
                else
                    cons.push('Không có thông tin giá');
                if (p.ratingAvg)
                    pros.push(`Sản phẩm có đánh giá trung bình ${p.ratingAvg}/5 sao`);
                else
                    cons.push('Không có đánh giá trung bình');
                if (p.reviewCount)
                    pros.push(`Sản phẩm có ${p.reviewCount} đánh giá`);
                else
                    cons.push('Không có số lượng đánh giá');
                if (p.images?.length)
                    pros.push(`Sản phẩm có ${p.images.length} ảnh minh họa`);
                else
                    cons.push('Không có ảnh minh họa');
                return { pros: pros.filter(Boolean), cons: cons.filter(Boolean), summary: p.title ? `Phân tích sản phẩm: ${p.title}` : undefined, confidence: 0.3 };
            }
        }
    }
    detectRedFlags(p) {
        const flags = [];
        if (!p.title)
            flags.push('Thiếu tiêu đề rõ ràng');
        if (!p.images?.length)
            flags.push('Thiếu ảnh sản phẩm');
        return flags;
    }
    async decisionAndReviewInsights(p, baseAnalysis) {
        const LLM_ENABLED = (process.env.GC_ENABLE_LLM ?? 'false') === 'true';
        if (!this.gemini || process.env.ANALYZE_FALLBACK === '1' || !LLM_ENABLED) {
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
            description: p.description,
            reviewsSample: p.reviewsSample,
        };
        try {
            const model = this.gemini.getGenerativeModel({ model: this.modelName });
            const prompt = `Phân tích sản phẩm dựa trên dữ liệu sau:\n${JSON.stringify(context)}\n\nTrả về JSON hợp lệ với schema: { decision: { verdict: "buy"|"consider"|"avoid", rationale: string[] }, reviewInsights: { positives: string[], negatives: string[] } }`;
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const parsed = this.parseJsonLlm(text);
            const validVerdicts = ['buy', 'consider', 'avoid'];
            const verdict = parsed.decision?.verdict;
            const rationale = Array.isArray(parsed.decision?.rationale) ? parsed.decision.rationale.filter(Boolean) : [];
            if (!validVerdicts.includes(verdict)) {
                throw new Error('Invalid verdict in Gemini response');
            }
            const ri = parsed.reviewInsights || {};
            const positives = Array.isArray(ri.positives) ? ri.positives.filter(Boolean) : baseAnalysis.pros;
            const negatives = Array.isArray(ri.negatives) ? ri.negatives.filter(Boolean) : baseAnalysis.cons;
            return { decision: { verdict, rationale }, reviewInsights: { positives, negatives } };
        }
        catch (e) {
            if (process.env.ANALYZE_FALLBACK === '1') {
                return {
                    decision: this.ruleVerdict(baseAnalysis.goodCheapScore, baseAnalysis.redFlags),
                    reviewInsights: { positives: baseAnalysis.pros, negatives: baseAnalysis.cons },
                };
            }
            const status = e?.status ?? e?.response?.status ?? e?.response?.statusCode;
            const msg = e?.message || 'Gemini request failed';
            if (status === 401) {
                throw new common_1.UnauthorizedException('Gemini unauthorized: kiểm tra GOOGLE_API_KEY');
            }
            if (status === 429) {
                throw new common_1.HttpException('Gemini quota exceeded (429): kiểm tra plan/billing', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            throw new common_1.BadRequestException(`Gemini error: ${msg}`);
        }
    }
    ruleVerdict(score, redFlags) {
        let verdict;
        if (score >= 75 && redFlags.length === 0)
            verdict = 'buy';
        else if (score >= 55)
            verdict = 'consider';
        else
            verdict = 'avoid';
        const rationale = [];
        rationale.push(`Điểm tổng: ${score}/100`);
        if (redFlags.length)
            rationale.push(`Rủi ro: ${redFlags.join('; ')}`);
        return { verdict, rationale };
    }
    async buildAspects(p) {
        const simpleFromProsCons = (pros, cons) => ([
            { name: 'Tổng quan', pros, cons, positiveQuotes: [], negativeQuotes: [] },
        ]);
        if (!this.gemini || process.env.ANALYZE_FALLBACK === '1') {
            const { pros, cons } = await this.summarizeProsCons(p);
            return simpleFromProsCons(pros, cons);
        }
        const REQUIRED_ASPECTS = this.getRequiredAspects(p);
        const reviews = (p.reviewsSample || [])
            .slice(0, 40)
            .map(r => ({ rating: r.rating, text: r.text }))
            .filter(r => r.text?.trim());
        const productContext = {
            title: p.title,
            price: p.price,
            currency: p.currency,
            ratingAvg: p.ratingAvg,
            reviewCount: p.reviewCount,
            description: p.description,
            category: p.category,
            subCategory: p.subCategory,
        };
        const prompt = REQUIRED_ASPECTS.length > 0
            ? `Bạn là chuyên gia phân tích reviews. Hãy xuất JSON mảng "aspects" với ĐẦY ĐỦ các khía cạnh sau theo đúng thứ tự: ${REQUIRED_ASPECTS.join(', ')}.\nQuy tắc bắt buộc:\n- Luôn bao gồm đủ tất cả khía cạnh liệt kê, ngay cả khi dữ liệu ít.\n- Mỗi phần tử có schema: {"name":"<one-of:${REQUIRED_ASPECTS.join('|')}>","pros":[],"cons":[],"positiveQuotes":[],"negativeQuotes":[]}\n- pros/cons: gạch đầu dòng ngắn, dựa trên bằng chứng từ reviews; nếu suy luận hợp lý, ghi rõ "(có thể)".\n- quotes: trích dẫn NGUYÊN VĂN ngắn từ reviews, không chế tác.\n- Chỉ trả JSON thuần, không text khác.\nNgữ cảnh sản phẩm: ${JSON.stringify(productContext)}\nReviews:\n${reviews.map(r => `- (${r.rating ?? 'n/a'}★) ${r.text}`).join('\n')}`
            : `Bạn là chuyên gia phân tích reviews. Hãy xuất JSON mảng "aspects" gồm 6–10 khía cạnh LIÊN QUAN NHẤT với sản phẩm và domain.\nQuy tắc:\n- Không bịa thông tin; pros/cons dựa trên bằng chứng từ reviews; nếu suy luận hợp lý, ghi "(có thể)".\n- Mỗi phần tử có schema: {"name":"<slug_ascii>","pros":[],"cons":[],"positiveQuotes":[],"negativeQuotes":[]}\n- quotes: trích dẫn NGUYÊN VĂN ngắn từ reviews, không chế tác.\n- Chỉ trả JSON thuần, không text khác.\nNgữ cảnh sản phẩm: ${JSON.stringify(productContext)}\nReviews:\n${reviews.map(r => `- (${r.rating ?? 'n/a'}★) ${r.text}`).join('\n')}`;
        try {
            const model = this.gemini.getGenerativeModel({
                model: this.modelName,
                generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
            });
            const resp = await model.generateContent(prompt);
            const text = resp?.response?.text?.() ?? '';
            const parsed = this.parseJsonLlm(text);
            const llmAspects = Array.isArray(parsed) ? parsed : parsed.aspects;
            const norm = (v) => ({
                name: String(v?.name ?? '').trim(),
                pros: Array.isArray(v?.pros) ? v.pros.filter(Boolean) : [],
                cons: Array.isArray(v?.cons) ? v.cons.filter(Boolean) : [],
                positiveQuotes: Array.isArray(v?.positiveQuotes) ? v.positiveQuotes.filter(Boolean) : [],
                negativeQuotes: Array.isArray(v?.negativeQuotes) ? v.negativeQuotes.filter(Boolean) : [],
            });
            if (REQUIRED_ASPECTS.length > 0) {
                const byName = new Map();
                if (Array.isArray(llmAspects)) {
                    for (const it of llmAspects) {
                        const n = norm(it);
                        if (REQUIRED_ASPECTS.includes(n.name))
                            byName.set(n.name, n);
                    }
                }
                const completed = REQUIRED_ASPECTS.map(name => (byName.get(name) || { name, pros: [], cons: [], positiveQuotes: [], negativeQuotes: [] }));
                return completed;
            }
            else {
                const normalized = Array.isArray(llmAspects) ? llmAspects.map(norm).filter(a => a.name) : [];
                if (normalized.length > 0)
                    return normalized;
                const { pros, cons } = await this.summarizeProsCons(p);
                return simpleFromProsCons(pros, cons);
            }
        }
        catch (e) {
            if (process.env.ANALYZE_FALLBACK === '1') {
                const { pros, cons } = await this.summarizeProsCons(p);
                return simpleFromProsCons(pros, cons);
            }
            const status = e?.status ?? e?.response?.status ?? e?.response?.statusCode;
            const msg = e?.message || 'Gemini request failed';
            if (status === 401) {
                throw new common_1.UnauthorizedException('Gemini unauthorized: kiểm tra GOOGLE_API_KEY');
            }
            if (status === 429) {
                throw new common_1.HttpException('Gemini quota exceeded (429): kiểm tra plan/billing', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            throw new common_1.BadRequestException(`Gemini error: ${msg}`);
        }
    }
    getRequiredAspects(p) {
        const title = (p.title || '').toLowerCase();
        const cat = (p.category || p.subCategory || '').toLowerCase();
        const looksAudio = /tai nghe|headphone|earbud|tws|audio|bluetooth/.test(title) || /audio|headphone|earbud|tws/.test(cat);
        if (looksAudio) {
            return [
                'soundQuality', 'battery', 'micCall', 'noiseControl',
                'comfortFit', 'durability', 'connectivity', 'warrantySupport',
            ];
        }
        return [];
    }
    buildReviewHighlights(p) {
        const list = p.reviewsSample || [];
        if (!list.length)
            return undefined;
        const sorter = (a, b) => {
            const ai = (a.images?.length || 0) > 0 ? 1 : 0;
            const bi = (b.images?.length || 0) > 0 ? 1 : 0;
            if (ai !== bi)
                return bi - ai;
            const ah = a.helpfulCount || 0;
            const bh = b.helpfulCount || 0;
            if (ah !== bh)
                return bh - ah;
            const ar = a.rating ?? 0;
            const br = b.rating ?? 0;
            return br - ar;
        };
        const positives = list
            .filter(r => (r.rating ?? 0) >= 4)
            .sort(sorter)
            .slice(0, 3);
        const negatives = list
            .filter(r => (r.rating ?? 0) <= 2)
            .sort((a, b) => {
            const ai = (a.images?.length || 0) > 0 ? 1 : 0;
            const bi = (b.images?.length || 0) > 0 ? 1 : 0;
            if (ai !== bi)
                return bi - ai;
            const ah = a.helpfulCount || 0;
            const bh = b.helpfulCount || 0;
            if (ah !== bh)
                return bh - ah;
            const ar = a.rating ?? 6;
            const br = b.rating ?? 6;
            return ar - br;
        })
            .slice(0, 3);
        return { positive: positives, negative: negatives };
    }
    buildPriceBenchmarks(p) {
        if (!p.price)
            return undefined;
        const currency = p.currency;
        const median = p.price;
        const low = Math.round(p.price * 0.9);
        const high = Math.round(p.price * 1.1);
        return { median, low, high, currency };
    }
    buildAlternatives(p) {
        if (!p.title)
            return undefined;
        const title = p.title;
        const currency = p.currency || 'VND';
        const base = p.price || 0;
        const alt = [
            { title: `${title} (phiên bản cũ)`, price: base ? Math.max(0, Math.round(base * 0.85)) : undefined, currency, score: Math.max(0, this.calcScore(p) - 5) },
            { title: `${title} (đối thủ)`, price: base ? Math.round(base * 0.95) : undefined, currency, score: Math.max(0, this.calcScore(p) - 3) },
        ];
        return alt;
    }
    getCautions(p, analysis) {
        const cautions = new Set();
        for (const f of analysis.redFlags)
            cautions.add(f);
        if (analysis.goodCheapScore < 50)
            cautions.add('Điểm thấp, cân nhắc so sánh thêm');
        return Array.from(cautions);
    }
    getAlternatives(p) {
        return this.buildAlternatives(p);
    }
    getActions(p) {
        return this.buildActions(p);
    }
    buildActions(p) {
        return {
            buyUrl: p.finalUrl,
            trackPrice: true,
        };
    }
    async analyzeProduct(p) {
        const AUTO_SCRAPE = (process.env.GC_AUTO_SCRAPE_REVIEWS ?? 'false') === 'true';
        if (AUTO_SCRAPE && !p.reviewsSample?.length) {
            this.logger.log(`analyzeProduct: auto-scrape enabled, try extractReviews source=${p.source} url=${p.finalUrl}`);
            const extractedReviews = await this.reviewsService.extractReviews(p);
            this.logger.log(`analyzeProduct: extractedReviews=${extractedReviews.length}`);
            if (extractedReviews.length > 0) {
                p.reviewsSample = extractedReviews;
            }
        }
        const goodCheapScore = this.calcScore(p);
        const t1 = this.now();
        const { pros, cons, summary, confidence } = await this.summarizeProsCons(p);
        if (this.debugTiming)
            this.logger.log(`[timing] summarizeProsCons: ${this.dur(t1)}ms`);
        const t2 = this.now();
        const redFlags = this.detectRedFlags(p);
        if (this.debugTiming)
            this.logger.log(`[timing] detectRedFlags: ${this.dur(t2)}ms`);
        const t3 = this.now();
        const priceBenchmarks = this.buildPriceBenchmarks(p);
        if (this.debugTiming)
            this.logger.log(`[timing] buildPriceBenchmarks: ${this.dur(t3)}ms`);
        const t4 = this.now();
        const { decision, reviewInsights } = await this.decisionAndReviewInsights(p, {
            goodCheapScore,
            pros,
            cons,
            redFlags,
            summary,
        });
        if (this.debugTiming)
            this.logger.log(`[timing] decisionAndReviewInsights: ${this.dur(t4)}ms`);
        const t5 = this.now();
        const aspects = await this.buildAspects(p);
        if (this.debugTiming)
            this.logger.log(`[timing] buildAspects: ${this.dur(t5)}ms`);
        const t6 = this.now();
        const reviewHighlights = this.buildReviewHighlights(p);
        if (this.debugTiming)
            this.logger.log(`[timing] buildReviewHighlights: ${this.dur(t6)}ms`);
        return { goodCheapScore, pros, cons, redFlags, summary, confidence, priceBenchmarks, decision, reviewInsights, aspects, reviewHighlights };
    }
    async analyzeProductRich(p) {
        const AUTO_SCRAPE = (process.env.GC_AUTO_SCRAPE_REVIEWS ?? 'false') === 'true';
        if (AUTO_SCRAPE && !p.reviewsSample?.length) {
            this.logger.log(`analyzeProductRich: auto-scrape enabled, try extractReviews source=${p.source} url=${p.finalUrl}`);
            const extra = await this.reviewsService.extractReviews(p);
            this.logger.log(`analyzeProductRich: extractedReviews=${extra?.length || 0}`);
            if (extra?.length)
                p.reviewsSample = extra;
        }
        const t0 = this.now();
        const base = await this.analyzeProduct(p);
        if (this.debugTiming)
            this.logger.log(`[timing] analyzeProduct(base): ${this.dur(t0)}ms`);
        const t1b = this.now();
        const aspectsRaw = await this.buildAspects(p);
        if (this.debugTiming)
            this.logger.log(`[timing] buildAspects(rich): ${this.dur(t1b)}ms`);
        const required = this.getRequiredAspects(p);
        const nowIso = new Date().toISOString();
        const rawUrl = p.canonicalUrl || p.finalUrl;
        let evidence = rawUrl ? [{
                id: 'prod:page',
                type: 'productPage',
                url: rawUrl,
                snippet: p.tagline || p.description || p.title || undefined,
                collectedAt: nowIso,
                reliability: 0.35,
            }] : [];
        if (!evidence.length) {
            const fallbackUrl = this.sanitizeUrl(p.finalUrl) || p.finalUrl || 'unknown';
            evidence = [{
                    id: 'prod:page',
                    type: 'productPage',
                    url: fallbackUrl,
                    snippet: p.description || p.title || undefined,
                    collectedAt: nowIso,
                    reliability: 0.2,
                }];
        }
        const host = (() => { try {
            if (!rawUrl)
                return undefined;
            const u = new URL(rawUrl);
            const h = u.hostname.split('.');
            return h[h.length - 2];
        }
        catch {
            return undefined;
        } })();
        const product = {
            title: p.title,
            canonicalUrl: rawUrl,
            buyUrl: rawUrl,
            images: Array.isArray(p.images) ? p.images.slice(0, 1).map((url) => ({ url })) : [],
            ontology: (p.category || p.subCategory) ? { category: p.category, subCategory: p.subCategory } : undefined,
        };
        const aiAnalysis = {
            citations: evidence.length ? [{ evidenceId: 'prod:page', reliability: 0.35, note: 'Nguồn tham chiếu' }] : [],
            confidence: { value: evidence.length === 1 ? 0.45 : 0.5, drivers: ['sources=' + evidence.length, 'independent=' + 0] },
            tone: base.pros.length > base.cons.length ? 'balanced-positive' : 'neutral',
        };
        const rubricWeights = {};
        if (required.length) {
            Object.assign(rubricWeights, { soundQuality: 0.25, battery: 0.15, micCall: 0.15, noiseControl: 0.1, comfortFit: 0.1, durability: 0.1, connectivity: 0.1, warrantySupport: 0.05 });
        }
        else {
            const names = (aspectsRaw || []).map((a) => a.name || 'overview');
            const w = names.length ? 1 / names.length : 0;
            for (const n of names)
                rubricWeights[n] = Math.round(w * 100) / 100;
        }
        const rubric = { weights: rubricWeights, scoringScale: '0-5', formula: 'overall = SUM((score/5)*weight) * 100' };
        const extractHypotheses = (items, kind) => {
            const hy = [];
            const rest = [];
            for (const t of items || []) {
                if (/\(có thể\)/i.test(t))
                    hy.push({ text: t.replace(/\s*\(có thể\)/ig, '').trim(), kind });
                else
                    rest.push(t);
            }
            return { hy, rest };
        };
        const toRich = (a) => {
            const pros = Array.isArray(a.pros) ? a.pros : [];
            const cons = Array.isArray(a.cons) ? a.cons : [];
            const { hy: hyPro, rest: prosClean } = extractHypotheses(pros, 'pro');
            const { hy: hyCon, rest: consClean } = extractHypotheses(cons, 'con');
            const hypotheses = [...hyPro, ...hyCon];
            return {
                name: a.name,
                label: a.name === 'Tổng quan' || a.name === 'overview' ? 'Tổng quan' : undefined,
                prosDetailed: prosClean.map((t) => ({ text: t, evidenceIds: ['prod:page'] })),
                consDetailed: consClean.map((t) => ({ text: t, evidenceIds: ['prod:page'] })),
                hypotheses: hypotheses.length ? hypotheses : undefined,
                quotes: [
                    ...((a.positiveQuotes || []).map((q) => ({ text: q, evidenceId: 'prod:page' }))),
                    ...((a.negativeQuotes || []).map((q) => ({ text: q, evidenceId: 'prod:page' }))),
                ],
            };
        };
        const aspectsList = (aspectsRaw || []).map(toRich);
        const hasOverview = aspectsList.some(x => x.name === 'overview' || x.label === 'Tổng quan' || x.name === 'Tổng quan');
        if (!hasOverview) {
            aspectsList.unshift({
                name: 'overview',
                label: 'Tổng quan',
                prosDetailed: (base.pros || []).slice(0, 2).map(t => ({ text: t, evidenceIds: ['prod:page'] })),
                consDetailed: (base.cons || []).slice(0, 1).map(t => ({ text: t, evidenceIds: ['prod:page'] })),
                fitFor: base.decision?.verdict === 'buy' ? ['nghe gọi cơ bản, ngân sách thấp'] : undefined,
                quotes: evidence.length && evidence[0].snippet ? [{ text: evidence[0].snippet, evidenceId: 'prod:page' }] : [],
            });
        }
        const analysisWeights = {
            overview: 0.15,
            soundQuality: 0.25,
            battery: 0.15,
            micCall: 0.15,
            noiseControl: 0.10,
            comfortFit: 0.08,
            durability: 0.05,
            connectivity: 0.05,
            warrantySupport: 0.02,
        };
        const aspectScores100 = aspectsList.map(it => ({
            name: it.name,
            score: it.prosDetailed.length > it.consDetailed.length ? Math.round((it.prosDetailed.length - it.consDetailed.length) * 10) : null,
            reasons: (() => {
                const reasons = [];
                if (it.prosDetailed.length)
                    reasons.push('Có điểm cộng cụ thể.');
                if (it.consDetailed.length)
                    reasons.push('Tồn tại hạn chế.');
                return reasons.length ? reasons : undefined;
            })(),
            evidenceIds: ['prod:page']
        }));
        const requiredAspectNamesForMapping = Object.keys(analysisWeights);
        for (const name of requiredAspectNamesForMapping) {
            if (!aspectScores100.some(aspect => aspect.name === name)) {
                aspectScores100.push({
                    name,
                    score: null,
                    reasons: undefined,
                    evidenceIds: ['prod:page']
                });
            }
        }
        const overall = Math.round(aspectScores100.reduce((s, it) => {
            const sc = typeof it.score === 'number' && it.score != null ? it.score : 50;
            const w = analysisWeights[it.name] ?? 0;
            return s + (sc / 100) * w;
        }, 0) * 100);
        const decisionByScore = overall >= 75 ? 'buy' : overall >= 60 ? 'consider' : 'hold';
        const verdict = decisionByScore;
        const reasons = [
            `Điểm tổng ~${overall}.`,
            evidence.length ? `Nguồn: ${host || 'site'}` : 'Thiếu nguồn tham chiếu độc lập',
        ];
        const decision = {
            strategy: required.length ? 'optimistic_budget' : 'generic',
            verdict,
            reasons,
            cta: { headline: verdict === 'buy' ? 'Đáng mua nếu phù hợp nhu cầu' : verdict === 'consider' ? 'Đáng cân nhắc' : 'Nên chờ thêm dữ liệu' }
        };
        const analysis = {
            deepDive: required.length ? {
                battery: base.cons.find((c) => /giờ nghe|pin|240h/i.test(c)) ? [base.cons.find((c) => /giờ nghe|pin|240h/i.test(c))] : undefined,
                soundQuality: base.cons.find((c) => /codec|aptx|ldac/i.test(c)) ? [base.cons.find((c) => /codec|aptx|ldac/i.test(c))] : undefined,
                connectivity: base.pros.find((c) => /5\.3|kết nối|bluetooth/i.test(c)) ? [base.pros.find((c) => /5\.3|kết nối|bluetooth/i.test(c))] : undefined,
            } : undefined,
            knownUnknowns: base.redFlags?.length ? base.redFlags : undefined,
            summary: base.summary,
        };
        const listPrice = p.listPrice ?? undefined;
        const currentPrice = p.price ?? undefined;
        const pricing = {
            current: currentPrice ?? null,
            original: listPrice ?? null,
            discountPercent: (currentPrice != null && listPrice && listPrice > 0) ? Math.round((1 - currentPrice / listPrice) * 100) : null,
            priceHistory: currentPrice ? [{ ts: nowIso, price: currentPrice, sourceId: 'prod:page' }] : []
        };
        const actions = { buyUrl: rawUrl, alerts: [] };
        const trustBadges = { urlSanitized: !!rawUrl };
        const tldr = { bestFor: verdict === 'buy' ? ['nghe gọi cơ bản, ngân sách thấp'] : undefined };
        const issues = [];
        if (!rawUrl || rawUrl !== this.sanitizeUrl(rawUrl))
            issues.push({ code: 'url_unsanitized', severity: 'low', message: 'URL chưa được chuẩn hoá hoàn toàn.' });
        if (!evidence.length)
            issues.push({ code: 'evidence_missing', severity: 'high', message: 'Thiếu evidence prod:page.' });
        if (!hasOverview)
            issues.push({ code: 'aspects_missing_overview', severity: 'medium', message: 'Thiếu overview.' });
        const baseVerdict = base?.decision?.verdict;
        if (baseVerdict && baseVerdict !== verdict)
            issues.push({ code: 'verdict_signal_divergence', severity: 'low', message: `Gemini verdict=${baseVerdict} khác score verdict=${verdict}.` });
        const presentAspects = aspectsList.map(a => a.name);
        const dataIntegrity = { status: issues.length ? 'warning' : 'ok', issues, coverage: required.length ? { requiredAspects: required, presentAspects, filledKeySpecsPercent: (p.specs && Object.keys(p.specs).length) ? Math.min(100, Math.round(Object.keys(p.specs).length / 10 * 100)) : 0 } : undefined };
        const meta = {
            platform: p.source,
            productId: p.productId ?? undefined,
            locale: 'vi-VN',
            currency: p.currency ?? 'VND',
            fetchedAt: nowIso,
        };
        const normalized = { canonicalUrl: rawUrl, buyUrl: rawUrl };
        const productOut = {
            rawTitle: p.title,
            title: p.title,
            lang: 'vi',
            images: (p.images || []).slice(0, 1).map(url => ({ url })),
            keySpecs: p.specs ?? {},
            availability: undefined,
        };
        const seller = {
            shopId: p.shopId ?? null,
            shopName: p.shopName ?? null,
            rating: { avg: p.ratingAvg ?? null, count: p.reviewCount ?? null },
            location: null,
            policies: undefined,
        };
        const cautions = [];
        const txt = (p.description || p.title || '').toLowerCase();
        if (/ai\s*(noise|cancel)/i.test(txt)) {
            cautions.push({ code: 'marketing_overclaim', message: 'Tuyên bố AI chưa có thông số kiểm chứng.', evidenceIds: ['prod:page'] });
        }
        const aspectScoresSafe = aspectScores100.map(it => ({
            ...it,
            evidenceIds: (Array.isArray(it.evidenceIds) && it.evidenceIds.length) ? it.evidenceIds : ['prod:page']
        }));
        const requiredAspectNamesForMapping2 = Object.keys(analysisWeights);
        for (const name of requiredAspectNamesForMapping2) {
            if (!aspectScoresSafe.some(aspect => aspect.name === name)) {
                aspectScoresSafe.push({
                    name,
                    score: null,
                    reasons: undefined,
                    evidenceIds: ['prod:page']
                });
            }
        }
        const overallScore = (() => {
            const sum = aspectScoresSafe.reduce((s, it) => {
                const sc = typeof it.score === 'number' && it.score != null ? it.score : 50;
                const w = analysisWeights[it.name] ?? 0;
                return s + (sc / 100) * w;
            }, 0);
            return Math.round(sum * 100);
        })();
        const rich = {
            schemaVersion: '1.1.0',
            meta,
            normalized,
            product: productOut,
            seller,
            pricing,
            evidence,
            relatedMedia: [],
            analysis: {
                rubric: { weights: analysisWeights },
                aspectScores: aspectScoresSafe,
                overallScore,
                verdict: overallScore >= 75 ? 'buy' : overallScore >= 60 ? 'consider' : 'hold',
                confidence: { value: evidence.length === 1 ? 0.45 : 0.5, drivers: ['sources=' + evidence.length] },
                pros: (base.pros || []).slice(0, 4).map(t => ({ text: t, evidenceIds: ['prod:page'] })),
                cons: (base.cons || []).slice(0, 4).map(t => ({ text: t, evidenceIds: ['prod:page'] })),
                cautions,
                alternatives: [],
            },
            dataIntegrity,
            trace: {
                pipelineVersion: new Date(nowIso).toISOString().slice(0, 10).replace(/-/g, '.'),
                latencyMs: undefined,
                cache: { hit: false },
            },
        };
        return rich;
    }
    sanitizeUrl(input) {
        if (!input)
            return undefined;
        try {
            const u = new URL(input);
            return `${u.origin}${u.pathname}`;
        }
        catch {
            return input;
        }
    }
};
exports.AnalyzeService = AnalyzeService;
exports.AnalyzeService = AnalyzeService = AnalyzeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reviews_service_1.ReviewsService])
], AnalyzeService);
//# sourceMappingURL=analyze.service.js.map