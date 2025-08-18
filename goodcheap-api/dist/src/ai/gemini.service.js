"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const tools_1 = require("./tools");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let GeminiService = class GeminiService {
    async enrichAnalysis(input) {
        const evidenceIn = Array.isArray(input?.evidence) ? [...input.evidence] : [];
        const aspectsIn = Array.isArray(input?.aspects) ? input.aspects : [];
        const productUrl = typeof input?.productUrl === 'string' ? input.productUrl : undefined;
        const norm = (arr) => arr
            .filter(Boolean)
            .map((e) => ({
            id: String(e.id ?? ''),
            type: String(e.type ?? 'unknown'),
            url: typeof e.url === 'string' ? e.url : undefined,
            source: typeof e.source === 'string' ? e.source : undefined,
            scrapedAt: typeof e.scrapedAt === 'string' ? e.scrapedAt : undefined,
            reliability: typeof e.reliability === 'number' ? e.reliability : undefined,
            note: typeof e.note === 'string' ? e.note : undefined,
        }))
            .filter((e) => e.url || e.id);
        const dedupe = (arr) => {
            const seen = new Set();
            const out = [];
            for (const e of arr) {
                const key = (e.url || e.id);
                if (!key || seen.has(key))
                    continue;
                seen.add(key);
                out.push(e);
            }
            return out;
        };
        const prioritize = (arr) => {
            const score = (e) => {
                const base = typeof e.reliability === 'number' ? e.reliability : 0.5;
                const typeBoost = e.type === 'productPage' ? 0.2 : (e.type?.includes('video') ? 0.15 : (e.type === 'review' ? 0.1 : 0));
                return base + typeBoost;
            };
            return [...arr].sort((a, b) => score(b) - score(a));
        };
        let evidence = prioritize(dedupe(norm(evidenceIn)));
        try {
            if (evidence.length < 3 && productUrl) {
                const isYouTube = (() => {
                    try {
                        const u = new URL(productUrl);
                        const h = u.hostname.replace(/^www\./, '').toLowerCase();
                        return h.includes('youtube.com') || h.includes('youtu.be');
                    }
                    catch {
                        return false;
                    }
                })();
                const [reviewEvidence, specEvidence, priceEvidence, ytTranscript] = await Promise.all([
                    (0, tools_1.search_reviews)(`đánh giá review ${productUrl}`).catch(() => undefined),
                    (0, tools_1.extract_specs)(productUrl).catch(() => undefined),
                    (0, tools_1.extract_price)(productUrl).catch(() => undefined),
                    isYouTube ? (0, tools_1.youtube_transcript)(productUrl).catch(() => undefined) : Promise.resolve(undefined),
                ]);
                const raw = [reviewEvidence, specEvidence, priceEvidence, ytTranscript].filter(Boolean);
                const toolEv = raw
                    .map((x, i) => {
                    const url = typeof x.url === 'string' ? x.url : undefined;
                    let validUrl;
                    if (url) {
                        try {
                            const u = new URL(url);
                            validUrl = u.toString();
                        }
                        catch {
                            validUrl = undefined;
                        }
                    }
                    return {
                        id: `tool:${i}`,
                        type: String(x.type || 'external'),
                        url: validUrl,
                        source: String(x.source || 'tool'),
                        scrapedAt: new Date().toISOString(),
                        reliability: typeof x.reliability === 'number' ? x.reliability : 0.45,
                        note: typeof x.note === 'string' ? x.note : undefined,
                    };
                })
                    .filter((e) => !!e.url);
                evidence = prioritize(dedupe([...evidence, ...toolEv]));
            }
        }
        catch {
        }
        const MAX_EVIDENCE = Math.max(5, Math.min(20, Number(process.env.GC_LLM_MAX_EVIDENCE || 12)));
        evidence = evidence.slice(0, MAX_EVIDENCE);
        const sanitizeTextArray = (arr) => {
            if (!Array.isArray(arr))
                return undefined;
            const out = arr.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim());
            return out.length ? out : undefined;
        };
        const aspects = aspectsIn.map((a) => ({
            ...a,
            pros: sanitizeTextArray(a?.pros),
            cons: sanitizeTextArray(a?.cons),
            quotes: sanitizeTextArray(a?.quotes),
            fitFor: sanitizeTextArray(a?.fitFor),
        }));
        return {
            aspects,
            evidence,
            confidence: typeof input?.confidence === 'number'
                ? Math.min(0.95, Math.max(input.confidence, evidence.length >= 6 ? 0.75 : evidence.length >= 3 ? 0.6 : 0.5))
                : (evidence.length >= 6 ? 0.75 : evidence.length >= 3 ? 0.6 : 0.5),
            decision: input?.decision,
        };
    }
    async searchYouTubeReviews(product) {
        const DEBUG = String(process.env.GC_DEBUG_TIMING || '').toLowerCase() === '1' || String(process.env.GC_DEBUG_TIMING || '').toLowerCase() === 'true';
        const apiKey = (process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
        if (!apiKey)
            return [];
        const title = (product?.title || '').trim();
        const finalUrl = product?.finalUrl || '';
        const base = title || finalUrl || '';
        const short = base.replace(/[\[\](){}|]/g, ' ').replace(/\s+/g, ' ').trim().split(' ').slice(0, 8).join(' ');
        const queries = Array.from(new Set([
            `${short} review`,
            `${short} đánh giá`,
            `${short} mở hộp`,
            `${short} trên tay`,
            `${short} so sánh`,
            `${short} unboxing`,
            `${short} test`,
        ].filter(q => q.trim().length > 0)));
        const maxItems = Math.max(1, Math.min(10, Number(process.env.YOUTUBE_SEARCH_MAX || 6)));
        const timeoutMs = Math.max(3000, Math.min(20000, Number(process.env.YOUTUBE_SEARCH_TIMEOUT_MS || 10000)));
        if (DEBUG) {
            console.log('[YouTube] queries=', queries, 'max=', maxItems, 'timeoutMs=', timeoutMs);
        }
        for (const q of queries) {
            const controller = new AbortController();
            const to = setTimeout(() => controller.abort(), timeoutMs);
            try {
                const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
                searchUrl.searchParams.set('part', 'snippet');
                searchUrl.searchParams.set('q', q);
                searchUrl.searchParams.set('type', 'video');
                searchUrl.searchParams.set('maxResults', String(maxItems));
                searchUrl.searchParams.set('key', apiKey);
                searchUrl.searchParams.set('regionCode', 'VN');
                searchUrl.searchParams.set('relevanceLanguage', 'vi');
                if (DEBUG)
                    console.log('[YouTube] fetching for query=', q);
                const res = await fetch(searchUrl.toString(), { signal: controller.signal }).catch((e) => { if (DEBUG)
                    console.log('[YouTube] fetch error:', String(e?.message || e)); return undefined; });
                if (!res || !res.ok) {
                    if (DEBUG)
                        console.log('[YouTube] response not ok, status=', res?.status, res?.statusText);
                    clearTimeout(to);
                    continue;
                }
                const data = await res.json().catch(() => undefined);
                const items = Array.isArray(data?.items) ? data.items : [];
                if (DEBUG)
                    console.log('[YouTube] api items count=', items.length);
                if (!items.length) {
                    clearTimeout(to);
                    continue;
                }
                const results = items.slice(0, maxItems).map((it, idx) => {
                    const id = it?.id?.videoId || `yt_${idx}`;
                    const url = id ? `https://www.youtube.com/watch?v=${id}` : undefined;
                    const snippet = it?.snippet || {};
                    const titleTxt = (snippet.title || '').trim();
                    const channel = (snippet.channelTitle || '').trim();
                    const thumb = snippet?.thumbnails?.high?.url || snippet?.thumbnails?.medium?.url || snippet?.thumbnails?.default?.url;
                    return {
                        id: `yt_${id}`,
                        text: titleTxt || url || '',
                        images: thumb ? [thumb] : undefined,
                        authorName: channel || undefined,
                        rating: undefined,
                        source: 'external',
                        url,
                    };
                });
                const verified = await this.postValidateVideos(results.filter(r => r.url), 'youtube');
                if (DEBUG)
                    console.log('[YouTube] verified count=', verified.length);
                const viOnly = verified.filter(v => this.isVietnamese(String(v.text || '')) || this.isVietnamese(String(v.authorName || '')));
                if (DEBUG)
                    console.log('[YouTube] viOnly count=', viOnly.length);
                if (verified.length) {
                    const prioritized = [...viOnly, ...verified.filter(v => !viOnly.includes(v))];
                    return prioritized.slice(0, maxItems);
                }
            }
            catch { }
            finally {
                clearTimeout(to);
            }
        }
        return [];
    }
    async generateSummary(product) {
        console.log('Generating summary for product:', product);
        return 'This is a mock summary generated by AI';
    }
    async analyzeReviews(reviews) {
        console.log('Analyzing reviews:', reviews);
        return {
            aspects: [],
            pros: [],
            cons: [],
            sentiment: 'neutral'
        };
    }
    parseLikeCount(s) {
        if (!s)
            return undefined;
        const t = s.replace(/,/g, '').trim();
        const m = t.match(/^([0-9]*\.?[0-9]+)\s*([KMBkmb]?)$/);
        if (m) {
            const num = parseFloat(m[1]);
            const unit = (m[2] || '').toUpperCase();
            const mul = unit === 'K' ? 1e3 : unit === 'M' ? 1e6 : unit === 'B' ? 1e9 : 1;
            return Math.round(num * mul);
        }
        const digits = t.match(/\d+/g);
        if (digits && digits.length) {
            try {
                return parseInt(digits.join(''), 10);
            }
            catch {
                return undefined;
            }
        }
        return undefined;
    }
    isReviewish(text) {
        const t = (text || '').toLowerCase();
        if (!t)
            return false;
        const kws = ['review', 'đánh giá', 'mở hộp', 'trên tay', 'so sánh', 'unbox', 'trải nghiệm'];
        return kws.some(k => t.includes(k));
    }
    normalizeText(s) {
        const t = (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return t.toLowerCase();
    }
    buildProductKeywords(base) {
        const stop = new Set([
            'review', 'danh', 'gia', 'mo', 'hop', 'tren', 'tay', 'so', 'sanh', 'unboxing', 'test', 'vs', 'và', 'va', 'la', 'cua', 'cho', 'the', 'and', 'with', 'case', 'cover', 'bao', 'ốp', 'op', 'giam', 'gia', 'sale'
        ]);
        const text = this.normalizeText(base).replace(/[^a-z0-9\s]/g, ' ');
        const words = text.split(/\s+/).filter(w => w && !stop.has(w) && (w.length >= 3 || /\d/.test(w)));
        const uniq = [];
        for (const w of words) {
            if (!uniq.includes(w))
                uniq.push(w);
            if (uniq.length >= 8)
                break;
        }
        if (uniq.length >= 2) {
            const phrase = `${uniq[0]} ${uniq[1]}`;
            if (!uniq.includes(phrase))
                uniq.unshift(phrase);
        }
        return uniq;
    }
    productMatchScore(text, author, keywords) {
        if (!keywords || !keywords.length)
            return 0;
        const hay = this.normalizeText(`${text || ''} ${author || ''}`);
        let score = 0;
        for (const kw of keywords) {
            if (!kw)
                continue;
            if (hay.includes(kw))
                score++;
        }
        return score;
    }
    passesTikTokFilter(it, keywords, minMatch, requireVi) {
        const text = String(it?.text || '');
        const author = String(it?.authorName || '');
        const pscore = this.productMatchScore(text, author, keywords);
        const isVi = this.isVietnamese(text) || this.isVietnamese(author);
        if (pscore < minMatch)
            return false;
        if (requireVi && !isVi)
            return false;
        return true;
    }
    prioritizeTikTok(items, maxItems, keywords) {
        const scored = (items || []).map((it) => {
            const isVi = this.isVietnamese(String(it.text || '')) || this.isVietnamese(String(it.authorName || ''));
            const isRev = this.isReviewish(String(it.text || ''));
            const likes = typeof it.likes === 'number' ? it.likes : 0;
            const pscore = this.productMatchScore(String(it.text || ''), String(it.authorName || ''), keywords);
            const score = (pscore * 3) + (isRev ? 2 : 0) + (isVi ? 1 : 0);
            return { it, score, likes, pscore };
        });
        scored.sort((a, b) => (b.score - a.score) || (b.likes - a.likes));
        return scored.map(s => s.it).slice(0, maxItems);
    }
    async tiktokRecover(page, DEBUG = false, attempts = 2) {
        try {
            for (let i = 0; i < attempts; i++) {
                const hasError = await page.$('text=Đã xảy ra lỗi, text=Đã xảy ra lỗi');
                const retryBtn = await page.$('button:has-text("Thử lại"), button:has-text("Retry")');
                if (retryBtn || hasError) {
                    if (DEBUG)
                        console.log('[TikTok][recover] clicking retry...');
                    try {
                        await retryBtn?.click({ delay: 50 });
                    }
                    catch { }
                    try {
                        await page.waitForTimeout(1200);
                    }
                    catch { }
                    try {
                        await page.waitForLoadState('networkidle', { timeout: 4000 });
                    }
                    catch { }
                    try {
                        await page.evaluate(() => window.scrollBy(0, 200));
                    }
                    catch { }
                    try {
                        await page.waitForTimeout(500);
                    }
                    catch { }
                    continue;
                }
                if (i === 0) {
                    try {
                        if (DEBUG)
                            console.log('[TikTok][recover] no retry button, reloading once...');
                        await page.reload({ waitUntil: 'load' });
                        try {
                            await page.waitForLoadState('networkidle', { timeout: 4000 });
                        }
                        catch { }
                    }
                    catch { }
                }
                else {
                    break;
                }
            }
        }
        catch { }
    }
    async searchTikTokReviews(product) {
        const DEBUG = String(process.env.GC_DEBUG_TIMING || '').toLowerCase() === '1' || String(process.env.GC_DEBUG_TIMING || '').toLowerCase() === 'true';
        const title = (product?.title || '').trim();
        const finalUrl = product?.finalUrl || '';
        const base = title || finalUrl || '';
        const short = base.replace(/[\[\](){}|]/g, ' ').replace(/\s+/g, ' ').trim().split(' ').slice(0, 8).join(' ');
        const queries = Array.from(new Set([
            `${short} đánh giá`,
            `${short} mở hộp`,
            `${short} trên tay`,
            `${short} so sánh`,
            `${short} review`,
            `${short} unboxing`,
        ].filter(q => q.trim().length > 0)));
        let keywords = this.buildProductKeywords(title || short || base);
        const minMatch = Math.max(1, Number(process.env.TIKTOK_MIN_PRODUCT_MATCH || 2));
        const requireVi = (process.env.TIKTOK_REQUIRE_VIETNAMESE ?? 'true').toString().toLowerCase() === 'true';
        const isTikTokInput = !!finalUrl && /(tiktok\.com|vt\.tiktok\.com)/i.test(finalUrl);
        const minMatchRelaxed = isTikTokInput ? Math.max(1, minMatch - 1) : minMatch;
        const requireViRelaxed = isTikTokInput ? false : requireVi;
        const maxItems = Math.max(1, Math.min(10, Number(process.env.TIKTOK_SEARCH_MAX || 5)));
        const headless = (process.env.PLAYWRIGHT_HEADLESS ?? 'true') === 'true';
        const timeoutMs = Math.max(5000, Math.min(45000, Number(process.env.TIKTOK_SEARCH_TIMEOUT_MS || 15000)));
        if (DEBUG)
            console.log('[TikTok] queries=', queries, 'max=', maxItems, 'headless=', headless, 'timeoutMs=', timeoutMs);
        if (finalUrl && /(tiktok\.com|vt\.tiktok\.com)/i.test(finalUrl)) {
            try {
                const { chromium } = await import('playwright');
                const browser = await chromium.launch({ headless, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
                const storageStatePath = path_1.default.resolve(process.cwd(), 'storageState.json');
                const hasStorage = fs_1.default.existsSync(storageStatePath);
                const context = await browser.newContext({
                    storageState: hasStorage ? storageStatePath : undefined,
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
                    viewport: { width: 1366, height: 900 },
                    locale: 'vi-VN',
                    timezoneId: 'Asia/Ho_Chi_Minh',
                    extraHTTPHeaders: { 'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8' },
                });
                const page = await context.newPage();
                if (DEBUG)
                    console.log('[TikTok] direct goto', finalUrl);
                await page.goto(finalUrl, { waitUntil: 'load', timeout: timeoutMs });
                try {
                    await page.waitForLoadState('networkidle', { timeout: 4000 });
                }
                catch { }
                await this.tiktokRecover(page, DEBUG);
                try {
                    const acceptSelectors = [
                        'button:has-text("Accept")',
                        'button:has-text("Accept all")',
                        'button:has-text("I agree")',
                        'button:has-text("Agree")',
                        'button:has-text("Tôi đồng ý")',
                        'button:has-text("Chấp nhận")',
                        '[data-e2e="cookie-banner-accept-all"]',
                    ];
                    for (const sel of acceptSelectors) {
                        const btn = await page.$(sel);
                        if (btn) {
                            if (DEBUG)
                                console.log('[TikTok] consent click', sel);
                            await btn.click({ delay: 50 });
                            await page.waitForTimeout(300);
                            break;
                        }
                    }
                }
                catch { }
                const currentUrl = page.url();
                let isVideo = false;
                try {
                    const u = new URL(currentUrl);
                    isVideo = /\/video\//.test(u.pathname);
                }
                catch {
                    isVideo = /\/video\//.test(currentUrl);
                }
                if (DEBUG)
                    console.log('[TikTok] direct resolved url=', currentUrl, 'isVideo=', isVideo);
                if (isVideo) {
                    const meta = await page.evaluate(() => {
                        const caption = (document.querySelector('[data-e2e="browse-video-desc"]')?.textContent || '').trim();
                        const author = (document.querySelector('[data-e2e="video-author-uniqueid"]')?.textContent || '').trim();
                        const imgEl = document.querySelector('video');
                        const likeText = (document.querySelector('strong[data-e2e="like-count"]')?.textContent ||
                            document.querySelector('[data-e2e="like-count"]')?.textContent ||
                            document.querySelector('button[data-e2e="like-icon"]')?.parentElement?.querySelector('strong')?.textContent ||
                            '').trim();
                        return { caption, author, thumb: imgEl?.poster || undefined, likeText };
                    });
                    const htmlLang = await page.evaluate(() => (document.documentElement.getAttribute('lang') || document.querySelector('meta[property="og:locale"]')?.content || '').toLowerCase());
                    const likes = this.parseLikeCount(meta?.likeText || '');
                    const item = {
                        id: 'tt_direct',
                        text: meta.caption || '',
                        images: meta.thumb ? [meta.thumb] : undefined,
                        authorName: meta.author || undefined,
                        rating: undefined,
                        source: 'tiktok_video',
                        url: currentUrl,
                        _trusted: true,
                        likes,
                    };
                    try {
                        await context.close();
                    }
                    catch { }
                    try {
                        await browser?.close?.();
                    }
                    catch { }
                    const verified = await this.postValidateVideos([item], 'tiktok');
                    if (DEBUG)
                        console.log('[TikTok] direct verified count=', verified.length);
                    const viOnly = verified.filter(v => this.isVietnamese(String(v.text || '')) || this.isVietnamese(String(v.authorName || '')));
                    if (DEBUG)
                        console.log('[TikTok] direct viOnly count=', viOnly.length);
                    if (verified.length) {
                        const filtered = verified.filter(v => this.passesTikTokFilter(v, keywords, minMatchRelaxed, requireViRelaxed));
                        const chosen = filtered.length ? filtered : (requireViRelaxed ? [] : verified);
                        if (chosen.length)
                            return this.prioritizeTikTok(chosen, maxItems, keywords);
                    }
                }
                else {
                    const pageTitle = (await page.title?.()) || '';
                    if (pageTitle && queries.indexOf(pageTitle) === -1)
                        queries.unshift(pageTitle);
                    keywords = this.buildProductKeywords(pageTitle || title || short || base);
                    const foundLinks = await page.evaluate((limit) => {
                        const anchors = Array.from(document.querySelectorAll('a[href*="/video/"]'));
                        const uniq = new Set();
                        const out = [];
                        for (const a of anchors) {
                            const href = a.getAttribute('href') || '';
                            if (!/\/video\//.test(href))
                                continue;
                            const abs = new URL(href, location.origin).toString();
                            if (uniq.has(abs))
                                continue;
                            uniq.add(abs);
                            out.push(abs);
                            if (out.length >= limit)
                                break;
                        }
                        return out;
                    }, maxItems);
                    if (DEBUG)
                        console.log('[TikTok] direct non-video page, video links found=', Array.isArray(foundLinks) ? foundLinks.length : 0);
                    if (Array.isArray(foundLinks) && foundLinks.length) {
                        const out = [];
                        for (let i = 0; i < Math.min(foundLinks.length, maxItems); i++) {
                            const link = foundLinks[i];
                            try {
                                const p = await context.newPage();
                                await p.goto(link, { waitUntil: 'load', timeout: timeoutMs });
                                try {
                                    await p.waitForLoadState('networkidle', { timeout: 3000 });
                                }
                                catch { }
                                await this.tiktokRecover(p, DEBUG);
                                const meta = await p.evaluate(() => {
                                    const caption = (document.querySelector('[data-e2e="browse-video-desc"]')?.textContent || '').trim();
                                    const author = (document.querySelector('[data-e2e="video-author-uniqueid"]')?.textContent || '').trim();
                                    const imgEl = document.querySelector('video');
                                    const likeText = (document.querySelector('strong[data-e2e="like-count"]')?.textContent ||
                                        document.querySelector('[data-e2e="like-count"]')?.textContent ||
                                        document.querySelector('button[data-e2e="like-icon"]')?.parentElement?.querySelector('strong')?.textContent ||
                                        '').trim();
                                    return { caption, author, thumb: imgEl?.poster || undefined, likeText };
                                });
                                const likes = (meta && (typeof meta.likeText === 'string')) ? this.parseLikeCount(meta.likeText) : undefined;
                                out.push({
                                    id: `tt_direct_list_${i}`,
                                    text: meta.caption || '',
                                    images: meta.thumb ? [meta.thumb] : undefined,
                                    authorName: meta.author || undefined,
                                    rating: undefined,
                                    source: 'tiktok_video',
                                    url: link,
                                    _trusted: true,
                                    likes,
                                });
                                await p.close();
                            }
                            catch {
                                out.push({ id: `tt_direct_list_${i}`, text: '', images: undefined, authorName: undefined, rating: undefined, source: 'tiktok_video', url: link, _trusted: true });
                            }
                        }
                        try {
                            await context.close();
                        }
                        catch { }
                        try {
                            await browser?.close?.();
                        }
                        catch { }
                        const verified = await this.postValidateVideos(out, 'tiktok');
                        if (DEBUG)
                            console.log('[TikTok] direct page verified count=', verified.length);
                        const viOnly = verified.filter(v => this.isVietnamese(String(v.text || '')) || this.isVietnamese(String(v.authorName || '')));
                        if (DEBUG)
                            console.log('[TikTok] direct page viOnly count=', viOnly.length);
                        if (verified.length) {
                            const filtered = verified.filter(v => this.passesTikTokFilter(v, keywords, minMatchRelaxed, requireViRelaxed));
                            const chosen = filtered.length ? filtered : (requireViRelaxed ? [] : verified);
                            if (chosen.length)
                                return this.prioritizeTikTok(chosen, maxItems, keywords);
                        }
                    }
                    try {
                        await context.close();
                    }
                    catch { }
                    try {
                        await browser?.close?.();
                    }
                    catch { }
                }
            }
            catch (e) {
                if (DEBUG)
                    console.log('[TikTok] direct open error:', String(e?.message || e));
            }
        }
        for (const q of queries) {
            const searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(q)}&lang=vi-VN&region=VN`;
            try {
                const { chromium } = await import('playwright');
                const browser = await chromium.launch({ headless, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
                const storageStatePath = path_1.default.resolve(process.cwd(), 'storageState.json');
                const hasStorage = fs_1.default.existsSync(storageStatePath);
                const context = await browser.newContext({
                    storageState: hasStorage ? storageStatePath : undefined,
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
                    viewport: { width: 1366, height: 900 },
                    locale: 'vi-VN',
                    timezoneId: 'Asia/Ho_Chi_Minh',
                    extraHTTPHeaders: { 'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8' },
                });
                const page = await context.newPage();
                if (DEBUG)
                    console.log('[TikTok] goto', searchUrl);
                await page.goto(searchUrl, { waitUntil: 'load', timeout: timeoutMs });
                try {
                    await page.waitForLoadState('networkidle', { timeout: 4000 });
                }
                catch { }
                await this.tiktokRecover(page, DEBUG);
                try {
                    const acceptSelectors = [
                        'button:has-text("Accept")',
                        'button:has-text("Accept all")',
                        'button:has-text("I agree")',
                        'button:has-text("Agree")',
                        'button:has-text("Tôi đồng ý")',
                        'button:has-text("Chấp nhận")',
                        '[data-e2e="cookie-banner-accept-all"]',
                    ];
                    for (const sel of acceptSelectors) {
                        const btn = await page.$(sel);
                        if (btn) {
                            if (DEBUG)
                                console.log('[TikTok] consent click', sel);
                            await btn.click({ delay: 50 });
                            await page.waitForTimeout(300);
                            break;
                        }
                    }
                }
                catch { }
                try {
                    await page.waitForSelector('a[href*="/video/"]', { timeout: 4000 });
                }
                catch { }
                try {
                    await page.waitForSelector('[data-e2e="search_video-item"]', { timeout: 4000 });
                }
                catch { }
                for (let i = 0; i < 6; i++) {
                    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                    await page.waitForTimeout(700);
                }
                const items = await page.evaluate((limit) => {
                    const pickFrom = () => {
                        const sel = [
                            'div[data-e2e="search_video-item"] a[href*="/video/"]',
                            'div[data-e2e="search_top-item"] a[href*="/video/"]',
                            'div[data-e2e="search_general-item"] a[href*="/video/"]',
                            'a[href^="/@"][href*="/video/"]',
                            'a[href*="/video/"]'
                        ];
                        const anchors = [];
                        for (const s of sel)
                            anchors.push(...Array.from(document.querySelectorAll(s)));
                        return anchors;
                    };
                    const anchors = pickFrom();
                    const uniq = new Map();
                    for (const a of anchors) {
                        const href = a.getAttribute('href') || '';
                        if (/\/video\//.test(href) && !uniq.has(href))
                            uniq.set(href, a);
                        if (uniq.size >= limit)
                            break;
                    }
                    const pick = Array.from(uniq.keys()).slice(0, limit);
                    const out = pick.map((href, idx) => {
                        const a = uniq.get(href);
                        const captionEl = a.querySelector('[data-e2e="search-video-caption"], [data-e2e="browse-video-desc"], [title], [aria-label], div');
                        const imgEl = a.querySelector('img');
                        return {
                            url: new URL(href, location.origin).toString(),
                            text: (captionEl?.textContent || a?.ariaLabel || a.title || '').trim(),
                            cover: imgEl?.src || undefined,
                            id: `tt_vid_${idx}`,
                        };
                    });
                    return out;
                }, maxItems);
                if (DEBUG)
                    console.log('[TikTok] scraped items=', Array.isArray(items) ? items.length : 0);
                if (DEBUG && Array.isArray(items))
                    console.log('[TikTok] scraped urls sample=', items.slice(0, 5).map((x) => x.url));
                const out = [];
                for (const it of items) {
                    try {
                        const p = await context.newPage();
                        await p.goto(it.url, { waitUntil: 'load', timeout: timeoutMs });
                        try {
                            await p.waitForLoadState('networkidle', { timeout: 3000 });
                        }
                        catch { }
                        await this.tiktokRecover(p, DEBUG);
                        const meta = await p.evaluate(() => {
                            const caption = (document.querySelector('[data-e2e="browse-video-desc"]')?.textContent || '').trim();
                            const author = (document.querySelector('[data-e2e="video-author-uniqueid"]')?.textContent || '').trim();
                            const imgEl = document.querySelector('video');
                            const likeText = (document.querySelector('strong[data-e2e="like-count"]')?.textContent ||
                                document.querySelector('[data-e2e="like-count"]')?.textContent ||
                                document.querySelector('button[data-e2e="like-icon"]')?.parentElement?.querySelector('strong')?.textContent ||
                                '').trim();
                            return { caption, author, thumb: imgEl?.poster || undefined, likeText };
                        });
                        out.push({
                            id: it.id,
                            text: meta.caption || it.text || '',
                            images: [it.cover || meta.thumb].filter(Boolean),
                            authorName: meta.author || undefined,
                            rating: undefined,
                            source: 'tiktok_video',
                            url: it.url,
                            _trusted: true,
                            likes: (meta && (typeof meta.likeText === 'string')) ? this.parseLikeCount(meta.likeText) : undefined,
                        });
                        await p.close();
                    }
                    catch {
                        out.push({ id: it.id, text: it.text || '', images: it.cover ? [it.cover] : undefined, source: 'tiktok_video', url: it.url });
                    }
                }
                try {
                    await context.close();
                }
                catch { }
                try {
                    await browser?.close?.();
                }
                catch { }
                if (DEBUG)
                    console.log('[TikTok] enriched items=', out.length);
                const verified = await this.postValidateVideos(out, 'tiktok');
                if (DEBUG)
                    console.log('[TikTok] verified count=', verified.length);
                const viOnly = verified.filter(v => this.isVietnamese(String(v.text || '')) || this.isVietnamese(String(v.authorName || '')));
                if (DEBUG)
                    console.log('[TikTok] viOnly count=', viOnly.length);
                if (verified.length) {
                    const filtered = verified.filter(v => this.passesTikTokFilter(v, keywords, minMatchRelaxed, requireViRelaxed));
                    const chosen = filtered.length ? filtered : (requireViRelaxed ? [] : verified);
                    if (chosen.length)
                        return this.prioritizeTikTok(chosen, maxItems, keywords);
                }
            }
            catch (e) {
                if (DEBUG)
                    console.log('[TikTok] error:', String(e?.message || e));
            }
        }
        try {
            const ddgQueries = Array.from(new Set([short, title, ...queries].filter(Boolean)));
            const ddgUrls = await this.ddgFindTiktokVideos(ddgQueries, maxItems);
            if (DEBUG)
                console.log('[TikTok][DDG] urls=', ddgUrls.length);
            if (ddgUrls.length) {
                const ddgItems = ddgUrls.map((u, idx) => ({ id: `tt_ddg_${idx}`, url: u, text: '', source: 'tiktok_video' }));
                const verified = await this.postValidateVideos(ddgItems, 'tiktok');
                if (DEBUG)
                    console.log('[TikTok][DDG] verified=', verified.length);
                const viOnly = verified.filter(v => this.isVietnamese(String(v.text || '')) || this.isVietnamese(String(v.authorName || '')));
                if (DEBUG)
                    console.log('[TikTok][DDG] viOnly=', viOnly.length);
                if (verified.length) {
                    const filtered = verified.filter(v => this.productMatchScore(String(v.text || ''), String(v.authorName || ''), keywords) > 0 || this.isReviewish(String(v.text || '')));
                    const chosen = filtered.length ? filtered : verified;
                    return this.prioritizeTikTok(chosen, maxItems, keywords);
                }
                const viByPage = [];
                for (const it of verified) {
                    try {
                        const ok = await this.isVietnamesePage(it.url);
                        if (ok)
                            viByPage.push(it);
                        if (viByPage.length >= maxItems)
                            break;
                    }
                    catch { }
                }
                if (DEBUG)
                    console.log('[TikTok][DDG] viByPage=', viByPage.length);
                if (viByPage.length) {
                    const filtered = viByPage.filter(v => this.productMatchScore(String(v.text || ''), String(v.authorName || ''), keywords) >= minMatchRelaxed);
                    const chosen = filtered.length ? filtered : (requireViRelaxed ? [] : viByPage);
                    if (chosen.length)
                        return this.prioritizeTikTok(chosen, maxItems, keywords);
                }
            }
        }
        catch (e) {
            if (DEBUG)
                console.log('[TikTok][DDG] error:', String(e?.message || e));
        }
        return [];
    }
    sanitizeTextArray(arr) {
        return (arr || []).filter(t => typeof t === 'string' && t.trim() !== '').map(t => t.trim());
    }
    isAllowedVideoUrl(url, kind) {
        try {
            const u = new URL(url);
            const host = u.hostname.replace(/^www\./, '').toLowerCase();
            if (kind === 'youtube') {
                if (!['youtube.com', 'm.youtube.com', 'youtu.be'].includes(host))
                    return false;
                if (host === 'youtu.be') {
                    const pid = u.pathname.split('/').filter(Boolean)[0];
                    return !!pid;
                }
                return (u.pathname === '/watch' && !!u.searchParams.get('v'));
            }
            if (kind === 'tiktok') {
                return host.endsWith('tiktok.com') && /\/video\//.test(u.pathname);
            }
            return false;
        }
        catch {
            return false;
        }
    }
    extractYouTubeId(url) {
        try {
            const u = new URL(url);
            if (u.hostname.includes('youtu.be'))
                return u.pathname.split('/').filter(Boolean)[0];
            const vid = u.searchParams.get('v');
            return vid || undefined;
        }
        catch {
            return undefined;
        }
    }
    normalizeYouTubeUrl(url) {
        const id = this.extractYouTubeId(url);
        return id ? `https://www.youtube.com/watch?v=${id}` : undefined;
    }
    async verifyUrlExists(url, timeoutMs = 8000) {
        const controller = new AbortController();
        const to = setTimeout(() => controller.abort(), timeoutMs);
        try {
            let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal }).catch(() => undefined);
            if (!res || !res.ok || res.status === 403 || res.status === 405) {
                res = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal }).catch(() => undefined);
            }
            return !!(res && (res.ok || (res.status >= 200 && res.status < 400)));
        }
        catch {
            return false;
        }
        finally {
            clearTimeout(to);
        }
    }
    async fetchOEmbed(url, kind, timeoutMs = 8000) {
        const controller = new AbortController();
        const to = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const endpoint = kind === 'youtube'
                ? `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
                : `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
            const res = await fetch(endpoint, { signal: controller.signal }).catch(() => undefined);
            if (!res || !res.ok)
                return undefined;
            return await res.json().catch(() => undefined);
        }
        catch {
            return undefined;
        }
        finally {
            clearTimeout(to);
        }
    }
    async postValidateVideos(items, kind) {
        const DEBUG = String(process.env.GC_DEBUG_TIMING || '').toLowerCase() === '1' || String(process.env.GC_DEBUG_TIMING || '').toLowerCase() === 'true';
        const normalized = [];
        for (const it of items) {
            const url = String(it.url || '');
            if (!this.isAllowedVideoUrl(url, kind)) {
                if (DEBUG)
                    console.log('[Validate]', kind, 'drop:not-allowed', url);
                continue;
            }
            const normUrl = kind === 'youtube' ? (this.normalizeYouTubeUrl(url) || url) : url;
            const id = kind === 'youtube' ? (this.extractYouTubeId(normUrl) || it.id) : it.id;
            normalized.push({ ...it, url: normUrl, id });
        }
        const out = [];
        const seen = new Set();
        for (const it of normalized) {
            try {
                if (kind === 'tiktok' && it._trusted) {
                    const key = it.url.replace(/[?#].*$/, '');
                    if (seen.has(key)) {
                        if (DEBUG)
                            console.log('[Validate] tiktok dedupe', key);
                        continue;
                    }
                    seen.add(key);
                    if (DEBUG)
                        console.log('[Validate] tiktok accept:trusted', key);
                    out.push({
                        ...it,
                        text: (it.text || it.url),
                        source: 'tiktok_video',
                    });
                    continue;
                }
                const meta = await this.fetchOEmbed(it.url, kind);
                if (!meta) {
                    const ok = await this.verifyUrlExists(it.url);
                    if (!ok) {
                        if (DEBUG)
                            console.log('[Validate]', kind, 'drop:oembed+head-fail', it.url);
                        continue;
                    }
                    if (DEBUG)
                        console.log('[Validate]', kind, 'oembed-miss but url-exists', it.url);
                }
                const title = (meta?.title || it.text || '').trim();
                const author = (meta?.author_name || it.authorName || '').trim();
                const thumb = (meta?.thumbnail_url || (Array.isArray(it.images) ? it.images[0] : undefined));
                const key = kind === 'youtube' ? (this.extractYouTubeId(it.url) || it.url) : it.url.replace(/[?#].*$/, '');
                if (seen.has(key)) {
                    if (DEBUG)
                        console.log('[Validate]', kind, 'dedupe', key);
                    continue;
                }
                seen.add(key);
                out.push({
                    ...it,
                    text: title || it.text || it.url,
                    images: thumb ? [thumb] : it.images,
                    authorName: author || it.authorName,
                    url: it.url,
                    source: kind === 'youtube' ? 'youtube_video' : 'tiktok_video',
                });
                if (DEBUG)
                    console.log('[Validate]', kind, 'accept', it.url);
            }
            catch { }
        }
        return out;
    }
    async ddgFindTiktokVideos(queries, limit) {
        const DEBUG = String(process.env.GC_DEBUG_TIMING || '').toLowerCase() === '1' || String(process.env.GC_DEBUG_TIMING || '').toLowerCase() === 'true';
        const found = new Set();
        const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
        for (const q of queries) {
            if (found.size >= limit)
                break;
            const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(`site:tiktok.com ${q}`)}&kl=vn-vi`;
            try {
                const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'vi,en;q=0.9' } }).catch(() => undefined);
                if (!res || !res.ok)
                    continue;
                const html = await res.text().catch(() => '');
                const re = /https?:\/\/(?:www\.)?tiktok\.com\/@[A-Za-z0-9_.-]+\/video\/\d+/g;
                const matches = html.match(re) || [];
                for (const m of matches) {
                    if (found.size >= limit)
                        break;
                    found.add(m);
                }
                if (DEBUG)
                    console.log('[TikTok][DDG] query=', q, 'found so far=', found.size);
            }
            catch { }
        }
        return Array.from(found).slice(0, limit);
    }
    isVietnamese(text) {
        if (!text)
            return false;
        const t = text.toLowerCase();
        const hasDiacritics = /[ăâêôơưđáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/.test(t);
        if (hasDiacritics)
            return true;
        const keywords = ['đánh giá', 'mở hộp', 'trên tay', 'so sánh', 'giá', 'chính hãng', 'hiệu năng', 'pin', 'màn hình', 'camera', 'tiếng việt'];
        return keywords.some(k => t.includes(k));
    }
    async isVietnamesePage(url) {
        try {
            const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
            const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8' } }).catch(() => undefined);
            if (!res || !res.ok)
                return false;
            const html = (await res.text().catch(() => '')) || '';
            const lower = html.toLowerCase();
            if (/\blang\s*=\s*"vi/.test(lower))
                return true;
            if (/property\s*=\s*"og:locale"[^>]*content\s*=\s*"vi/.test(lower))
                return true;
            if (/vi-vn/.test(lower))
                return true;
            const titleMatch = lower.match(/<title[^>]*>[^<]*<\/title>/)?.[0] || '';
            const descMatch = lower.match(/<meta[^>]+name\s*=\s*"description"[^>]*>/)?.[0] || '';
            if (this.isVietnamese(titleMatch) || this.isVietnamese(descMatch))
                return true;
        }
        catch { }
        return false;
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = __decorate([
    (0, common_1.Injectable)()
], GeminiService);
//# sourceMappingURL=gemini.service.js.map