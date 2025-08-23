"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ReviewsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
let ReviewsService = ReviewsService_1 = class ReviewsService {
    logger = new common_1.Logger(ReviewsService_1.name);
    detectSourceFromUrl(url) {
        if (!url)
            return undefined;
        const u = url.toLowerCase();
        if (u.includes('tiktok.com'))
            return 'tiktok';
        if (u.includes('shopee.vn') || u.includes('shopee.com'))
            return 'shopee';
        if (u.includes('lazada.vn') || u.includes('lazada.'))
            return 'lazada';
        return undefined;
    }
    async extractTikTokMeta(product) {
        const url = product.finalUrl || product?.canonicalUrl || '';
        this.logger.log(`extractTikTokMeta: Processing URL: ${url}`);
        if (!url || !/tiktok\.com\//i.test(url)) {
            this.logger.warn(`extractTikTokMeta: Invalid or missing TikTok URL: ${url}`);
            return {};
        }
        const env = (process.env.NODE_ENV ?? '').toLowerCase();
        if (env === 'test') {
            this.logger.log('extractTikTokMeta: disabled in test env');
            return {};
        }
        this.logger.log('extractTikTokMeta: Starting Playwright approach...');
        const playwrightResult = await this.extractTikTokMetaWithPlaywright(url);
        this.logger.log(`extractTikTokMeta: Playwright result: ${JSON.stringify(playwrightResult)}`);
        if (!playwrightResult || (Object.keys(playwrightResult).length === 0)) {
            this.logger.log('extractTikTokMeta: Playwright failed or returned empty, trying HTTP fallback');
            const httpResult = await this.extractTikTokMetaWithHttp(url);
            this.logger.log(`extractTikTokMeta: HTTP fallback result: ${JSON.stringify(httpResult)}`);
            return httpResult;
        }
        this.logger.log(`extractTikTokMeta: Returning Playwright result: ${JSON.stringify(playwrightResult)}`);
        return playwrightResult;
    }
    async extractTikTokMetaWithHttp(url) {
        this.logger.log(`extractTikTokMetaWithHttp: Starting HTTP request to ${url}`);
        try {
            const { default: got } = await import('got');
            this.logger.log('extractTikTokMetaWithHttp: Got module imported, making HTTP request...');
            const html = await got(url, {
                headers: {
                    'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'accept-language': 'vi-VN,vi;q=0.9,en;q=0.8',
                    'cache-control': 'no-cache',
                },
                timeout: { request: 10000 },
                followRedirect: true,
                maxRedirects: 5,
            }).text();
            this.logger.log(`extractTikTokMetaWithHttp: Received HTML response, length: ${html?.length || 0}`);
            if (!html || html.length < 100) {
                this.logger.warn('extractTikTokMetaWithHttp: received empty or very short HTML response');
                return {};
            }
            this.logger.log(`extractTikTokMetaWithHttp: HTML snippet: ${html.substring(0, 500)}...`);
            this.logger.log('extractTikTokMetaWithHttp: Calling extractTikTokFromHtml...');
            const result = await this.extractTikTokFromHtml(html);
            this.logger.log(`extractTikTokMetaWithHttp: extractTikTokFromHtml returned: ${JSON.stringify(result)}`);
            this.logger.log(`extractTikTokMetaWithHttp: extracted ${Object.keys(result).length} fields from HTML`);
            return result;
        }
        catch (e) {
            this.logger.error(`extractTikTokMetaWithHttp failed: ${e?.message || e}`, e?.stack);
            return {};
        }
    }
    async extractTikTokMetaWithPlaywright(url) {
        const headless = (process.env.PLAYWRIGHT_HEADLESS ?? 'true') === 'true';
        const timeoutMs = Math.max(5000, Math.min(30000, Number(process.env.REVIEWS_SCRAPE_TIMEOUT_MS || 12000)));
        const captureNetwork = true;
        const patterns = [
            'price', 'promotion', 'pdp', 'product', 'ecom', 'ecommerce', 'graphql', 'gql', 'review', 'rating', 'count', 'shop', 'item',
            'content', 'detail', 'aweme', 'buy', 'product_center', 'review_list', 'rating_list', 'pdp/product'
        ];
        const buckets = [];
        try {
            const { chromium } = await import('playwright');
            const browser = await chromium.launch({ headless, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            const storageStatePath = process.env.TIKTOK_STORAGE_STATE_PATH && String(process.env.TIKTOK_STORAGE_STATE_PATH).trim().length
                ? String(process.env.TIKTOK_STORAGE_STATE_PATH).trim()
                : undefined;
            const context = await browser.newContext({
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
                viewport: { width: 390, height: 844 },
                locale: 'vi-VN',
                timezoneId: 'Asia/Ho_Chi_Minh',
                geolocation: { latitude: 10.8231, longitude: 106.6297 },
                permissions: ['geolocation'],
                recordHar: (process.env.DEBUG_HAR ?? '0') === '1' ? { path: `har/tk-meta-${Date.now()}.har` } : undefined,
                ...(storageStatePath ? { storageState: storageStatePath } : {}),
            });
            const page = await context.newPage();
            if (captureNetwork) {
                page.on('response', async (resp) => {
                    try {
                        const u = resp.url();
                        if (!patterns.some(p => u.includes(p)))
                            return;
                        const ct = (resp.headers()['content-type'] || '').toLowerCase();
                        if (ct.includes('json')) {
                            const json = await resp.json().catch(() => undefined);
                            if (json && typeof json === 'object')
                                buckets.push({ url: u, json });
                        }
                        else if (ct.includes('text') || ct === '') {
                            const text = await resp.text().catch(() => undefined);
                            if (text && text.length <= 2_000_000) {
                                const t = text.trim();
                                if ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))) {
                                    try {
                                        const json = JSON.parse(t);
                                        if (json && typeof json === 'object')
                                            buckets.push({ url: u, json });
                                    }
                                    catch { }
                                }
                            }
                        }
                    }
                    catch { }
                });
            }
            await page.goto(url, { waitUntil: 'load', timeout: timeoutMs });
            try {
                const content = await page.content();
                if (/captcha|verification|security check|verify to continue/i.test(content)) {
                    this.logger.warn('extractTikTokMetaWithPlaywright: CAPTCHA detected, will fallback to HTTP method');
                    await context.close();
                    await browser.close();
                    return {};
                }
            }
            catch { }
            try {
                await page.waitForLoadState('networkidle', { timeout: 3000 });
            }
            catch { }
            try {
                await page.click('text=Đánh giá', { timeout: 1500 });
            }
            catch { }
            try {
                await page.waitForTimeout(800);
            }
            catch { }
            try {
                for (let i = 0; i < 3; i++) {
                    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                    await page.waitForTimeout(500);
                }
            }
            catch { }
            const nums = [];
            const candidates = { currency: undefined, price: undefined, originalPrice: undefined, ratingAvg: undefined, reviewCount: undefined };
            const dig = (obj, path = []) => {
                if (!obj || typeof obj !== 'object')
                    return;
                for (const [k, v] of Object.entries(obj)) {
                    const key = k.toLowerCase();
                    const np = [...path, key];
                    if (v && typeof v === 'object')
                        dig(v, np);
                    else {
                        if (['price', 'sale_price', 'min_price', 'current_price'].includes(key)) {
                            const n = Number(v);
                            if (Number.isFinite(n))
                                candidates.price = candidates.price ?? n;
                        }
                        if (['original_price', 'origin_price', 'list_price', 'max_price'].includes(key)) {
                            const n = Number(v);
                            if (Number.isFinite(n))
                                candidates.originalPrice = candidates.originalPrice ?? n;
                        }
                        if (['currency', 'currency_code'].includes(key) && typeof v === 'string' && v.length <= 5) {
                            candidates.currency = candidates.currency ?? String(v);
                        }
                        if (['rating', 'avg_rating', 'rating_avg', 'average_rating'].includes(key)) {
                            const n = Number(v);
                            if (Number.isFinite(n))
                                candidates.ratingAvg = candidates.ratingAvg ?? n;
                        }
                        if (['review_count', 'rating_count', 'comment_count'].includes(key)) {
                            const n = Number(v);
                            if (Number.isInteger(n))
                                candidates.reviewCount = candidates.reviewCount ?? n;
                        }
                    }
                }
            };
            for (const b of buckets) {
                try {
                    dig(b.json);
                }
                catch { }
            }
            if ((!Number.isFinite(candidates.price) && !Number.isFinite(candidates.originalPrice))
                || (!Number.isFinite(candidates.ratingAvg) && !Number.isInteger(candidates.reviewCount))) {
                try {
                    const dom = await page.evaluate(() => {
                        const pickText = (sel) => {
                            for (const s of sel) {
                                const el = document.querySelector(s);
                                if (el) {
                                    const t = (el.getAttribute('content') || el.textContent || '').trim();
                                    if (t)
                                        return t;
                                }
                            }
                            return undefined;
                        };
                        const parseNum = (t) => {
                            if (!t)
                                return undefined;
                            const n = Number((t.replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(',', '.')));
                            return Number.isFinite(n) ? n : undefined;
                        };
                        const currencyFrom = (t) => {
                            if (!t)
                                return undefined;
                            if (/VND|₫|VNĐ/.test(t))
                                return 'VND';
                            if (/USD|\$/.test(t))
                                return 'USD';
                            if (/SGD/i.test(t))
                                return 'SGD';
                            if (/MYR/i.test(t))
                                return 'MYR';
                            return undefined;
                        };
                        const priceText = pickText([
                            '[data-e2e="product-price"]',
                            '.price, .product-price, .origin-price, .sale-price',
                            'meta[itemprop="price"]',
                        ]);
                        const origText = pickText([
                            '.original-price, .origin-price, [data-e2e="product-original-price"]'
                        ]);
                        const ratingText = pickText([
                            '[data-e2e="rating"]',
                            '.rating, .rating-avg, .average-rating'
                        ]);
                        const countText = pickText([
                            '[data-e2e="rating-count"]',
                            '.review-count, .rating-count, .comment-count'
                        ]);
                        const price = parseNum(priceText);
                        const originalPrice = parseNum(origText);
                        const ratingAvg = parseNum(ratingText);
                        const reviewCount = (() => {
                            const n = parseNum(countText);
                            return Number.isFinite(n) ? Math.round(n) : undefined;
                        })();
                        const currency = currencyFrom(priceText || origText);
                        return { price, originalPrice, ratingAvg, reviewCount, currency };
                    });
                    if (dom && typeof dom === 'object') {
                        if (!Number.isFinite(candidates.price) && Number.isFinite(dom.price))
                            candidates.price = dom.price;
                        if (!Number.isFinite(candidates.originalPrice) && Number.isFinite(dom.originalPrice))
                            candidates.originalPrice = dom.originalPrice;
                        if (!Number.isFinite(candidates.ratingAvg) && Number.isFinite(dom.ratingAvg))
                            candidates.ratingAvg = dom.ratingAvg;
                        if (!Number.isInteger(candidates.reviewCount) && Number.isInteger(dom.reviewCount))
                            candidates.reviewCount = dom.reviewCount;
                        if (!candidates.currency && typeof dom.currency === 'string')
                            candidates.currency = dom.currency;
                    }
                }
                catch { }
            }
            if ((!Number.isFinite(candidates.price) && !Number.isFinite(candidates.originalPrice))
                || (!Number.isFinite(candidates.ratingAvg) && !Number.isInteger(candidates.reviewCount))) {
                try {
                    const { mkdirSync, writeFileSync } = await import('fs');
                    const { resolve } = await import('path');
                    const logsDir = resolve(process.cwd(), 'logs');
                    mkdirSync(logsDir, { recursive: true });
                    const slim = buckets.slice(0, 50).map((it) => ({
                        url: it.url,
                        json: it.json,
                    }));
                    const out = resolve(logsDir, `scrape-net-${Date.now()}.json`);
                    writeFileSync(out, JSON.stringify({ url, count: buckets.length, items: slim }, null, 2), 'utf-8');
                    this.logger.warn(`extractTikTokMetaWithPlaywright: zero reviews, network dump saved: ${out}`);
                }
                catch { }
            }
            if ((!Number.isFinite(candidates.price) && !Number.isFinite(candidates.originalPrice))
                || (!Number.isFinite(candidates.ratingAvg) && !Number.isInteger(candidates.reviewCount))) {
                try {
                    const { mkdtempSync, writeFileSync } = await import('fs');
                    const { tmpdir } = await import('os');
                    const { sep } = await import('path');
                    const dir = mkdtempSync(tmpdir() + sep + 'gc-');
                    if ((process.env.DEBUG_ZERO ?? '0') === '1') {
                        const imgPath = dir + sep + `tiktok-zero-${Date.now()}.png`;
                        await page.screenshot({ path: imgPath, fullPage: true });
                        this.logger.warn(`extractTikTokMetaWithPlaywright: zero reviews, screenshot saved: ${imgPath}`);
                    }
                    if ((process.env.DEBUG_ZERO ?? '0') === '1') {
                        const htmlPath = dir + sep + `tiktok-zero-${Date.now()}.html`;
                        writeFileSync(htmlPath, await page.content(), { encoding: 'utf-8' });
                        this.logger.warn(`extractTikTokMetaWithPlaywright: zero reviews, html saved: ${htmlPath}`);
                    }
                }
                catch { }
            }
            try {
                await context.close();
            }
            catch { }
            try {
                await browser?.close?.();
            }
            catch { }
            const out = {};
            if (Number.isFinite(candidates.price))
                out.price = candidates.price;
            if (Number.isFinite(candidates.originalPrice))
                out.discountPrice = candidates.originalPrice;
            if (typeof candidates.currency === 'string')
                out.currency = candidates.currency;
            if (Number.isFinite(candidates.ratingAvg))
                out.ratingAvg = candidates.ratingAvg;
            if (Number.isInteger(candidates.reviewCount))
                out.reviewCount = candidates.reviewCount;
            return out;
        }
        catch (e) {
            this.logger.warn(`extractTikTokMetaWithPlaywright failed: ${e?.message || e}`);
            return {};
        }
    }
    async extractTikTokFromHtml(html) {
        this.logger.log(`extractTikTokFromHtml: Starting HTML parsing, length: ${html?.length || 0}`);
        try {
            if (typeof html !== 'string' || html.length < 50) {
                this.logger.warn(`extractTikTokFromHtml: Invalid HTML input, length: ${html?.length || 0}`);
                return {};
            }
            const out = {};
            const safeNum = (v) => {
                const n = typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.\-]/g, ''));
                return Number.isFinite(n) ? n : undefined;
            };
            const normCurrency = (s) => {
                if (!s)
                    return undefined;
                const t = s.trim().toUpperCase();
                if (/VND|₫|VNĐ/.test(t) || t === 'VND')
                    return 'VND';
                if (/USD|\$/.test(t) || t === 'USD')
                    return 'USD';
                if (/THB/.test(t))
                    return 'THB';
                if (/IDR/.test(t))
                    return 'IDR';
                return undefined;
            };
            const toIntPrice = (s) => {
                if (s == null)
                    return undefined;
                const raw = String(s);
                const digitsOnly = raw.replace(/[^0-9]/g, '');
                if (!digitsOnly)
                    return undefined;
                const n = Number(digitsOnly);
                return Number.isFinite(n) ? n : undefined;
            };
            const parseRangeMedian = (a, b) => {
                const n1 = toIntPrice(a);
                const n2 = toIntPrice(b);
                if (Number.isFinite(n1) && Number.isFinite(n2))
                    return Math.round((n1 + n2) / 2);
                return n1 ?? n2 ?? undefined;
            };
            this.logger.log('extractTikTokFromHtml: Step 1 - Looking for JSON-LD blocks...');
            const ldBlocks = [];
            try {
                const reLd = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
                let m;
                let jsonLdCount = 0;
                while ((m = reLd.exec(html))) {
                    jsonLdCount++;
                    const raw = (m[1] || '').trim();
                    if (!raw)
                        continue;
                    const candidates = splitJsonCandidates(raw);
                    for (const c of candidates) {
                        try {
                            const j = JSON.parse(c);
                            ldBlocks.push(j);
                            this.logger.log(`extractTikTokFromHtml: Found JSON-LD: ${JSON.stringify(j).substring(0, 200)}...`);
                        }
                        catch (parseErr) {
                            this.logger.warn(`extractTikTokFromHtml: Failed to parse JSON-LD: ${parseErr}`);
                        }
                    }
                }
                this.logger.log(`extractTikTokFromHtml: Found ${jsonLdCount} JSON-LD script tags, ${ldBlocks.length} parsed blocks`);
            }
            catch (ldErr) {
                this.logger.error(`extractTikTokFromHtml: Error in JSON-LD extraction: ${ldErr}`);
            }
            const fromLd = (obj) => {
                try {
                    if (!obj || typeof obj !== 'object')
                        return;
                    const pick = (o, k) => (o && typeof o === 'object') ? o[k] : undefined;
                    const name = pick(obj, 'name') ?? pick(obj, 'title');
                    const img = pick(obj, 'image');
                    const offers = pick(obj, 'offers');
                    const agg = pick(obj, 'aggregateRating');
                    if (name && !out.title)
                        out.title = String(name);
                    if (img && !out.images) {
                        const imgs = Array.isArray(img) ? img : [img];
                        out.images = imgs.map((x) => (typeof x === 'string' ? x : x?.url || x?.contentUrl)).filter(Boolean);
                    }
                    if (offers && typeof offers === 'object') {
                        const low = pick(offers, 'lowPrice');
                        const high = pick(offers, 'highPrice');
                        const price = pick(offers, 'price');
                        const cur = pick(offers, 'priceCurrency');
                        const pr = (low != null || high != null)
                            ? parseRangeMedian(low, high)
                            : toIntPrice(price) ?? safeNum(price);
                        if (pr && !out.price)
                            out.price = pr;
                        const c = normCurrency(cur);
                        if (c && !out.currency)
                            out.currency = c;
                    }
                    if (agg && typeof agg === 'object') {
                        const ratingValue = safeNum(pick(agg, 'ratingValue'));
                        const reviewCount = safeNum(pick(agg, 'reviewCount'));
                        if (ratingValue && !out.ratingAvg)
                            out.ratingAvg = ratingValue;
                        if (reviewCount && !out.reviewCount)
                            out.reviewCount = Math.round(reviewCount);
                    }
                }
                catch { }
            };
            for (const b of ldBlocks) {
                if (Array.isArray(b)) {
                    for (const it of b)
                        fromLd(it);
                }
                else {
                    fromLd(b);
                }
            }
            this.logger.log(`extractTikTokFromHtml: After JSON-LD processing - Price: ${out.price}, Currency: ${out.currency}, Title: ${out.title ? 'found' : 'not found'}`);
            this.logger.log('extractTikTokFromHtml: Step 1.5 - Looking for TikTok inline JSON...');
            try {
                if (out.price == null || !out.currency || out.discountPrice == null) {
                    const reScriptAll = /<script[^>]*>([\s\S]*?)<\/script>/gi;
                    let sm;
                    let inlineJsonCount = 0;
                    while ((sm = reScriptAll.exec(html))) {
                        const code = (sm[1] || '');
                        if (!/(sku_info|SkuPrice|price_val|price_str|original_price)/i.test(code))
                            continue;
                        inlineJsonCount++;
                        this.logger.log(`extractTikTokFromHtml: Found inline JSON script #${inlineJsonCount} with price patterns`);
                        const mPriceVal = /"price_val"\s*:\s*([0-9]+)/i.exec(code) || /"price"\s*:\s*([0-9]+)/i.exec(code);
                        const mPriceStr = /"price_str"\s*:\s*"([^"]+)"/i.exec(code);
                        const mOrig = /"(?:original_price|origin_price|list_price|max_price)"\s*:\s*([0-9]+)/i.exec(code);
                        if (mPriceVal)
                            this.logger.log(`extractTikTokFromHtml: Found price_val: ${mPriceVal[1]}`);
                        if (mPriceStr)
                            this.logger.log(`extractTikTokFromHtml: Found price_str: ${mPriceStr[1]}`);
                        if (mOrig)
                            this.logger.log(`extractTikTokFromHtml: Found original_price: ${mOrig[1]}`);
                        if (out.price == null) {
                            const pv = mPriceVal?.[1] ? toIntPrice(mPriceVal[1]) : undefined;
                            const ps = mPriceStr?.[1];
                            const pFromStr = ps ? (toIntPrice(ps) ?? safeNum(ps)) : undefined;
                            const p = pv ?? pFromStr;
                            if (Number.isFinite(p)) {
                                out.price = p;
                                this.logger.log(`extractTikTokFromHtml: Set price from inline JSON: ${out.price}`);
                            }
                        }
                        if (out.discountPrice == null && mOrig?.[1]) {
                            const op = toIntPrice(mOrig[1]);
                            if (Number.isFinite(op)) {
                                out.discountPrice = op;
                                this.logger.log(`extractTikTokFromHtml: Set discount price from inline JSON: ${out.discountPrice}`);
                            }
                        }
                        if (!out.currency) {
                            const mCur = /(VND|USD|IDR|THB|₫|VNĐ)/i.exec(code);
                            const c = normCurrency(mCur?.[1]);
                            if (c) {
                                out.currency = c;
                                this.logger.log(`extractTikTokFromHtml: Set currency from inline JSON: ${out.currency}`);
                            }
                        }
                        if (out.price != null && out.currency)
                            break;
                    }
                    this.logger.log(`extractTikTokFromHtml: Processed ${inlineJsonCount} inline JSON scripts`);
                }
            }
            catch (inlineErr) {
                this.logger.error(`extractTikTokFromHtml: Error in inline JSON parsing: ${inlineErr}`);
            }
            try {
                if (!out.title) {
                    const mt = /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i.exec(html) ||
                        /<meta[^>]+name=["']title["'][^>]+content=["']([^"']+)["'][^>]*>/i.exec(html);
                    if (mt?.[1])
                        out.title = decodeHtml(mt[1]);
                }
                if (!out.images || out.images.length === 0) {
                    const mi = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/ig;
                    const imgs = [];
                    let mm;
                    while ((mm = mi.exec(html)))
                        imgs.push(mm[1]);
                    if (imgs.length)
                        out.images = imgs;
                }
            }
            catch { }
            if (out.price == null) {
                const mRange = /([0-9][0-9.,]{1,})\s*[-–—]\s*([0-9][0-9.,]{1,})\s*(?:₫|VNĐ|VND)?/i.exec(html);
                if (mRange) {
                    const pr = parseRangeMedian(mRange[1], mRange[2]);
                    if (pr)
                        out.price = pr;
                }
                if (out.price == null) {
                    const mPrice = /\"price\"\s*:\s*\"?([0-9][0-9.,]{1,})\"?/i.exec(html) || /item_price\":\s*\"([0-9.,]+)\"/i.exec(html);
                    const rawPrice = mPrice?.[1];
                    const thousandsLike = typeof rawPrice === 'string' && /^[0-9]{1,3}(?:[.,][0-9]{3}){1,4}$/.test(rawPrice);
                    let p = thousandsLike ? toIntPrice(rawPrice) : safeNum(rawPrice);
                    if (!Number.isFinite(p) && typeof rawPrice === 'string') {
                        p = toIntPrice(rawPrice) ?? safeNum(rawPrice);
                    }
                    if (Number.isFinite(p))
                        out.price = p;
                }
                if (out.price == null) {
                    const mVN = /(?:^|[^0-9])([0-9]{1,3}(?:[.,][0-9]{3}){1,4})(?:\s*)(?:₫|VNĐ|VND)/i.exec(html);
                    const p2 = toIntPrice(mVN?.[1]);
                    if (p2)
                        out.price = p2;
                }
            }
            if (!out.currency) {
                const mCur = /"priceCurrency"\s*:\s*"([A-Z]{3})"/i.exec(html) || /(VND|USD|IDR|THB|₫|VNĐ)/i.exec(html);
                const c = normCurrency(mCur?.[1]);
                if (c)
                    out.currency = c;
            }
            if (!out.currency) {
                const vnSignal = /(lang=["']?vi\b|vi[-_]?VN|Asia\/Ho_Chi_Minh|\.vn\b)/i.test(html);
                if (vnSignal)
                    out.currency = 'VND';
            }
            if (out.ratingAvg == null) {
                const mR = /"ratingValue"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)"?/i.exec(html);
                const r = safeNum(mR?.[1]);
                if (r)
                    out.ratingAvg = r;
            }
            if (out.reviewCount == null) {
                const mC = /"reviewCount"\s*:\s*"?([0-9]+)"?/i.exec(html)
                    || /"ratingCount"\s*:\s*"?([0-9]+)"?/i.exec(html)
                    || /"commentCount"\s*:\s*"?([0-9]+)"?/i.exec(html);
                const c = safeNum(mC?.[1]);
                if (c)
                    out.reviewCount = Math.round(c);
            }
            if (out.currency === 'VND' && typeof out.price === 'number') {
                if (out.price < 1000 || out.price > 50_000_000) {
                    delete out.price;
                }
            }
            if (out.price == null) {
                const re = /(₫|VNĐ|VND)\s*([0-9]{1,3}(?:[.,][0-9]{3}){1,4})|([0-9]{1,3}(?:[.,][0-9]{3}){1,4})\s*(₫|VNĐ|VND)/gi;
                const found = [];
                for (const m of html.matchAll(re)) {
                    const raw = m[2] || m[3];
                    const val = toIntPrice(raw);
                    if (!val)
                        continue;
                    if (val < 1_000 || val > 50_000_000)
                        continue;
                    found.push(val);
                }
                if (found.length) {
                    found.sort((a, b) => a - b);
                    if (found.length >= 2) {
                        const min = found[0];
                        const max = found[found.length - 1];
                        const med = Math.round((min + max) / 2);
                        out.price = med;
                    }
                    else {
                        out.price = found[0];
                    }
                    if (!out.currency)
                        out.currency = 'VND';
                }
            }
            if (out.currency === 'VND' && typeof out.price === 'number') {
                if (out.price < 1000 || out.price > 50_000_000) {
                    this.logger.warn(`extractTikTokFromHtml: Removing invalid VND price: ${out.price}`);
                    delete out.price;
                }
            }
            this.logger.log(`extractTikTokFromHtml: Final result - Price: ${out.price}, Currency: ${out.currency}, Discount: ${out.discountPrice}, Title: ${out.title ? 'found' : 'not found'}, Images: ${out.images?.length || 0}`);
            this.logger.log(`extractTikTokFromHtml: Completed HTML parsing, returning: ${JSON.stringify(out)}`);
            return out;
        }
        catch (e) {
            this.logger.error(`extractTikTokFromHtml failed: ${e}`, e?.stack);
            return {};
        }
    }
    async extractReviews(product) {
        const { finalUrl, productId } = product;
        const source = product.source || this.detectSourceFromUrl(finalUrl);
        this.logger.log(`extractReviews: source=${source} url=${finalUrl} productId=${productId}`);
        const env = (process.env.NODE_ENV ?? '').toLowerCase();
        if (env === 'test') {
            this.logger.log('extractReviews: disabled in test env');
            return [];
        }
        try {
            switch (source) {
                case 'tiktok':
                    return await this.extractTikTokReviews(finalUrl, productId);
                case 'shopee':
                    return await this.extractShopeeReviews(finalUrl, productId);
                case 'lazada':
                    return await this.extractLazadaReviews(finalUrl, productId);
                default:
                    this.logger.warn(`Unsupported source for review extraction: ${source}`);
                    return [];
            }
        }
        catch (error) {
            this.logger.error(`Failed to extract reviews from ${source}:`, error);
            return [];
        }
    }
    async extractTikTokReviews(url, productId) {
        this.logger.log(`Extracting TikTok reviews from: ${url}`);
        try {
            const reviews = await this.scrapeWithPlaywright(url, {
                reviewSelector: '[data-e2e="review-item"], [data-e2e="pdp-review-item"], [data-testid="review-item"], .review-item, .comment-item',
                textSelector: '[data-e2e="review-text"], [data-e2e="pdp-review-text"], .review-content, .comment-text, [data-testid="review-text"]',
                ratingSelector: '[data-e2e*="star"], .rating, .star-rating, [data-testid="rating"]',
                authorSelector: '[data-e2e="review-author"], .author-name, .username, [data-testid="author"]',
                imageSelector: '.review-images img, .comment-images img, [data-e2e="review-images"] img',
                avatarSelector: '.author-avatar img, .user-avatar img, [data-e2e="review-avatar"] img'
            }, {
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
                viewport: { width: 390, height: 844 },
                locale: 'vi-VN',
                timezoneId: 'Asia/Ho_Chi_Minh',
                geolocation: { latitude: 10.8231, longitude: 106.6297 },
                permissions: ['geolocation'],
                waitForSelectors: [
                    '[data-e2e="review-item"]',
                    '[data-e2e="pdp-review-item"]',
                    '[data-testid="review-item"]',
                    '.comment-item',
                ],
                clicks: ['text=Đánh giá', 'text=Reviews'],
                captureNetwork: (process.env.TIKTOK_CAPTURE_NETWORK ?? '0') === '1',
                networkPatterns: [
                    'review', 'reviews', 'review_list', 'product/reviews', 'product/review', 'shop/review', 'ecom/review', 'review/list',
                    'comment', 'comment/list', 'comment/item_list', 'aweme/comment',
                    'rate', 'rating', 'feedback',
                    'graphql', 'gql',
                    'oec', 'ecom', 'ecommerce',
                    'pdp', 'api', 'api/v1', 'api/v2'
                ],
                screenshotOnZero: (process.env.DEBUG_ZERO ?? '0') === '1',
                saveHtmlOnZero: (process.env.DEBUG_ZERO ?? '0') === '1',
                headless: (process.env.PLAYWRIGHT_HEADLESS ?? 'true') === 'true',
            });
            return reviews.map((r, i) => ({
                id: `tk_${productId || 'unknown'}_${i}`,
                rating: this.parseRating(r.rating),
                text: r.text || '',
                images: r.images || [],
                authorName: r.author || `user_${i}`,
                authorAvatar: r.avatar,
                helpfulCount: Math.floor(Math.random() * 50),
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            }));
        }
        catch (error) {
            this.logger.warn(`TikTok review extraction failed: ${error.message}`);
            return [];
        }
    }
    async extractShopeeReviews(url, productId) {
        this.logger.log(`Extracting Shopee reviews from: ${url}`);
        try {
            const reviews = await this.scrapeWithPlaywright(url, {
                reviewSelector: '.shopee-product-rating__review-item, .review-item',
                textSelector: '.shopee-product-rating__review-text, .review-text',
                ratingSelector: '.shopee-product-rating__rating, .rating-stars',
                authorSelector: '.shopee-product-rating__author-name, .author-name',
                imageSelector: '.shopee-product-rating__images img, .review-images img',
                avatarSelector: '.shopee-product-rating__avatar img, .author-avatar img'
            });
            return reviews.map((r, i) => ({
                id: `sp_${productId || 'unknown'}_${i}`,
                rating: this.parseRating(r.rating),
                text: r.text || '',
                images: r.images || [],
                authorName: r.author || `shopee_user_${i}`,
                authorAvatar: r.avatar,
                helpfulCount: Math.floor(Math.random() * 100),
                createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
            }));
        }
        catch (error) {
            this.logger.warn(`Shopee review extraction failed: ${error.message}`);
            return [];
        }
    }
    async extractLazadaReviews(url, productId) {
        this.logger.log(`Extracting Lazada reviews from: ${url}`);
        try {
            const reviews = await this.scrapeWithPlaywright(url, {
                reviewSelector: '.review-item, .pdp-review-item',
                textSelector: '.review-content, .item-content',
                ratingSelector: '.rating, .score',
                authorSelector: '.reviewer-name, .author-name',
                imageSelector: '.review-images img',
                avatarSelector: '.reviewer-avatar img'
            });
            return reviews.map((r, i) => ({
                id: `lz_${productId || 'unknown'}_${i}`,
                rating: this.parseRating(r.rating),
                text: r.text || '',
                images: r.images || [],
                authorName: r.author || `lazada_user_${i}`,
                authorAvatar: r.avatar,
                helpfulCount: Math.floor(Math.random() * 80),
                createdAt: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000).toISOString()
            }));
        }
        catch (error) {
            this.logger.warn(`Lazada review extraction failed: ${error.message}`);
            return [];
        }
    }
    parseRating(ratingText) {
        if (!ratingText)
            return undefined;
        const match = ratingText.match(/(\d+(?:\.\d+)?)/);
        return match ? Math.min(5, Math.max(1, parseFloat(match[1]))) : undefined;
    }
    async scrapeWithPlaywright(url, selectors, options) {
        const maxRetries = 2;
        const navTimeout = 60000;
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const { chromium } = await import('playwright');
                let storageStateFromEnv = process.env.TIKTOK_STORAGE_STATE_PATH;
                if (!storageStateFromEnv) {
                    try {
                        const { existsSync } = await import('fs');
                        const { resolve } = await import('path');
                        const localPath = resolve(process.cwd(), 'storageState.json');
                        if (existsSync(localPath))
                            storageStateFromEnv = localPath;
                    }
                    catch { }
                }
                const recordHar = process.env.TIKTOK_RECORD_HAR === '1';
                let harPath;
                if (recordHar) {
                    try {
                        const { mkdtempSync } = await import('fs');
                        const { tmpdir } = await import('os');
                        const { sep } = await import('path');
                        const dir = mkdtempSync(tmpdir() + sep + 'gc-');
                        harPath = dir + sep + `tiktok-${Date.now()}.har`;
                    }
                    catch { }
                }
                const usePersistent = process.env.TIKTOK_USE_PERSISTENT === '1';
                const userDataDirEnv = process.env.TIKTOK_USER_DATA_DIR;
                let context;
                let ctxIsPersistent = false;
                if (usePersistent || userDataDirEnv) {
                    try {
                        const { resolve } = await import('path');
                        const { mkdirSync } = await import('fs');
                        const p = userDataDirEnv || resolve(process.cwd(), '.auth', 'tiktok');
                        mkdirSync(p, { recursive: true });
                        context = await chromium.launchPersistentContext(p, {
                            headless: options?.headless ?? true,
                            args: ['--no-sandbox', '--disable-setuid-sandbox'],
                            userAgent: options?.userAgent || 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
                            viewport: options?.viewport || { width: 390, height: 844 },
                            locale: options?.locale || 'vi-VN',
                            timezoneId: options?.timezoneId || 'Asia/Ho_Chi_Minh',
                            geolocation: options?.geolocation,
                            recordHar: recordHar && harPath ? { path: harPath, content: 'embed' } : undefined,
                        });
                        ctxIsPersistent = true;
                    }
                    catch { }
                }
                if (!context) {
                    const browser = await chromium.launch({ headless: options?.headless ?? true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
                    context = await browser.newContext({
                        userAgent: options?.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        viewport: options?.viewport || { width: 1366, height: 768 },
                        locale: options?.locale || 'vi-VN',
                        timezoneId: options?.timezoneId || 'Asia/Ho_Chi_Minh',
                        geolocation: options?.geolocation,
                        storageState: storageStateFromEnv || undefined,
                        recordHar: recordHar && harPath ? { path: harPath, content: 'embed' } : undefined,
                    });
                    context.__gc_browser__ = browser;
                }
                if (options?.permissions && options.permissions.length) {
                    try {
                        await context.grantPermissions(options.permissions);
                    }
                    catch { }
                }
                try {
                    await context.setExtraHTTPHeaders({
                        'Accept-Language': options?.locale || 'vi-VN,vi;q=0.9',
                    });
                }
                catch { }
                const page = await context.newPage();
                const networkBuckets = [];
                if (options?.captureNetwork) {
                    page.on('response', async (resp) => {
                        try {
                            const req = resp.request();
                            const rtype = req.resourceType();
                            if (rtype !== 'xhr' && rtype !== 'fetch')
                                return;
                            const rurl = resp.url();
                            const patterns = options?.networkPatterns || [];
                            if (!patterns.some((p) => rurl.toLowerCase().includes(p)))
                                return;
                            let json = undefined;
                            try {
                                json = await resp.json();
                            }
                            catch {
                                try {
                                    const text = await resp.text();
                                    json = JSON.parse(text);
                                }
                                catch { }
                            }
                            if (!json)
                                return;
                            networkBuckets.push({ url: rurl, json });
                            try {
                                if ((process.env.LOG_NETWORK_VERBOSE ?? '0') === '1')
                                    this.logger.log(`network match: ${rurl}`);
                            }
                            catch { }
                        }
                        catch { }
                    });
                    page.on('requestfinished', async (req) => {
                        try {
                            const rtype = req.resourceType();
                            if (rtype !== 'xhr' && rtype !== 'fetch')
                                return;
                            const rurl = req.url();
                            const patterns = options?.networkPatterns || [];
                            if (!patterns.some((p) => rurl.toLowerCase().includes(p)))
                                return;
                            try {
                                if ((process.env.LOG_NETWORK_VERBOSE ?? '0') === '1')
                                    this.logger.log(`requestfinished match: ${rurl}`);
                            }
                            catch { }
                        }
                        catch { }
                    });
                }
                await page.goto(url, { waitUntil: 'load', timeout: navTimeout });
                try {
                    const content = await page.content();
                    if (/Verify to continue|Security Check|captcha/i.test(content)) {
                        this.logger.warn('scrapeWithPlaywright: CAPTCHA/Security Check detected after navigation, waiting for manual solve ...');
                        const start = Date.now();
                        while (Date.now() - start < 120000) {
                            await page.waitForTimeout(2000);
                            const html = await page.content();
                            if (!/Verify to continue|Security Check|captcha/i.test(html))
                                break;
                        }
                    }
                }
                catch { }
                try {
                    if (!ctxIsPersistent) {
                        const state = await context.storageState();
                        const { writeFileSync, mkdirSync } = await import('fs');
                        const { resolve, dirname } = await import('path');
                        const out = resolve(process.cwd(), 'storageState.json');
                        mkdirSync(dirname(out), { recursive: true });
                        writeFileSync(out, JSON.stringify(state), 'utf-8');
                    }
                }
                catch { }
                await page.waitForTimeout(8000);
                try {
                    await page.waitForLoadState('networkidle', { timeout: 5000 });
                }
                catch { }
                try {
                    await page.waitForSelector(selectors.reviewSelector, { timeout: 8000 });
                }
                catch { }
                if (options?.clicks?.length) {
                    for (const c of options.clicks) {
                        try {
                            await page.click(c, { timeout: 2000 });
                            await page.waitForTimeout(1000);
                        }
                        catch { }
                    }
                    const extraReviewSelectors = [
                        '[data-e2e="pdp-review"]',
                        '[data-e2e="review-tab"]',
                        'text=Xem tất cả',
                        'text=Tất cả đánh giá',
                    ];
                    for (const s of extraReviewSelectors) {
                        try {
                            await page.click(s, { timeout: 1500 });
                            await page.waitForTimeout(800);
                        }
                        catch { }
                    }
                }
                if (options?.waitForSelectors?.length) {
                    for (const s of options.waitForSelectors) {
                        try {
                            await page.waitForSelector(s, { timeout: 1500 });
                        }
                        catch { }
                    }
                }
                for (let i = 0; i < 6; i++) {
                    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                    await page.waitForTimeout(1800);
                }
                try {
                    await page.waitForLoadState('networkidle', { timeout: 5000 });
                }
                catch { }
                const reviews = await page.evaluate((sel) => {
                    const reviewElements = document.querySelectorAll(sel.reviewSelector);
                    const results = [];
                    reviewElements.forEach((reviewEl, index) => {
                        if (index >= 20)
                            return;
                        const textEl = reviewEl.querySelector(sel.textSelector);
                        const ratingEl = reviewEl.querySelector(sel.ratingSelector);
                        const authorEl = reviewEl.querySelector(sel.authorSelector);
                        const avatarEl = reviewEl.querySelector(sel.avatarSelector);
                        const text = textEl?.textContent?.trim() || '';
                        const rating = (ratingEl?.textContent?.trim() || ratingEl?.getAttribute?.('data-rating') || '').toString();
                        const author = authorEl?.textContent?.trim() || '';
                        const avatar = avatarEl?.getAttribute?.('src') || '';
                        const imageEls = reviewEl.querySelectorAll(sel.imageSelector);
                        const images = [];
                        imageEls.forEach(img => {
                            const src = img.getAttribute('src') || img.getAttribute('data-src');
                            if (src && /^https?:\/\//i.test(src))
                                images.push(src);
                        });
                        if (text.length > 10)
                            results.push({ text, rating, author, images, avatar });
                    });
                    return results;
                }, selectors);
                let finalReviews = reviews;
                if ((!finalReviews || finalReviews.length === 0) && networkBuckets.length) {
                    const flattened = [];
                    for (const b of networkBuckets) {
                        const j = b.json;
                        try {
                            const candidates = [j?.data, j?.reviews, j?.comments, j?.result, j?.aweme_detail, j?.aweme_list];
                            const list = candidates.find((x) => Array.isArray(x) && x.length) || [];
                            for (const item of list)
                                flattened.push(item);
                        }
                        catch { }
                    }
                    const mapped = [];
                    for (const it of flattened) {
                        const text = it?.text || it?.content || it?.comment || it?.review_text || '';
                        const rating = it?.rating || it?.star || it?.rate || '';
                        const user = it?.user || it?.author || it?.creator || {};
                        const author = user?.nickname || user?.name || user?.username || '';
                        const avatar = user?.avatar || user?.avatar_url || user?.avatarThumb || '';
                        const imagesRaw = it?.images || it?.image_list || it?.pics || [];
                        const images = Array.isArray(imagesRaw)
                            ? imagesRaw.map((im) => (typeof im === 'string' ? im : im?.url || im?.uri)).filter(Boolean)
                            : [];
                        if (typeof text === 'string' && text.trim().length > 5) {
                            mapped.push({ text: String(text), rating: String(rating || ''), author: String(author || ''), images, avatar });
                        }
                        if (mapped.length >= 20)
                            break;
                    }
                    if (mapped.length) {
                        this.logger.log(`scrapeWithPlaywright(network): got ${mapped.length} reviews from XHR`);
                        finalReviews = mapped;
                    }
                }
                if ((!finalReviews || finalReviews.length === 0)) {
                    try {
                        const perfUrls = await page.evaluate(() => {
                            const entries = window.performance?.getEntriesByType?.('resource') || [];
                            return entries.map(e => e.name).filter(u => typeof u === 'string');
                        });
                        const interesting = (perfUrls || []).filter((u) => ['review', 'comment', 'rating', 'pdp', 'api'].some(k => u.toLowerCase().includes(k))).slice(0, 20);
                        if (interesting.length) {
                            try {
                                this.logger.log(`performance urls (sample):\n${interesting.join('\n')}`);
                            }
                            catch { }
                        }
                    }
                    catch { }
                }
                if ((!finalReviews || finalReviews.length === 0)) {
                    try {
                        const html = await page.content();
                        const sigiMatch = html.match(/<script[^>]*id=["']SIGI_STATE["'][^>]*>([\s\S]*?)<\/script>/i);
                        const initialMatch = html.match(/<script[^>]*data-e2e=["']initialState["'][^>]*>([\s\S]*?)<\/script>/i);
                        const raw = sigiMatch?.[1] || initialMatch?.[1];
                        if (raw) {
                            let json;
                            try {
                                json = JSON.parse(raw);
                            }
                            catch { }
                            if (!json) {
                                const unescaped = raw.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
                                try {
                                    json = JSON.parse(unescaped);
                                }
                                catch { }
                            }
                            if (json) {
                                const flat = [];
                                const stack = [json];
                                while (stack.length && flat.length < 200) {
                                    const cur = stack.pop();
                                    if (Array.isArray(cur)) {
                                        for (const v of cur)
                                            stack.push(v);
                                    }
                                    else if (cur && typeof cur === 'object') {
                                        if ((cur.text || cur.content || cur.comment || cur.review_text) && (cur.user || cur.author || cur.creator)) {
                                            flat.push(cur);
                                        }
                                        for (const k of Object.keys(cur))
                                            stack.push(cur[k]);
                                    }
                                }
                                const mapped = [];
                                for (const it of flat) {
                                    const text = it?.text || it?.content || it?.comment || it?.review_text || '';
                                    const rating = it?.rating || it?.star || it?.rate || '';
                                    const user = it?.user || it?.author || it?.creator || {};
                                    const author = user?.nickname || user?.name || user?.username || '';
                                    const avatar = user?.avatar || user?.avatar_url || user?.avatarThumb || '';
                                    const imagesRaw = it?.images || it?.image_list || it?.pics || [];
                                    const images = Array.isArray(imagesRaw)
                                        ? imagesRaw.map((im) => (typeof im === 'string' ? im : im?.url || im?.uri)).filter(Boolean)
                                        : [];
                                    if (typeof text === 'string' && text.trim().length > 5) {
                                        mapped.push({ text: String(text), rating: String(rating || ''), author: String(author || ''), images, avatar });
                                    }
                                    if (mapped.length >= 20)
                                        break;
                                }
                                if (mapped.length) {
                                    this.logger.log(`scrapeWithPlaywright(embedded): got ${mapped.length} reviews from HTML state`);
                                    finalReviews = mapped;
                                }
                            }
                        }
                    }
                    catch { }
                }
                if ((finalReviews?.length || 0) === 0 && networkBuckets.length) {
                    try {
                        const { mkdirSync, writeFileSync } = await import('fs');
                        const { resolve } = await import('path');
                        const logsDir = resolve(process.cwd(), 'logs');
                        mkdirSync(logsDir, { recursive: true });
                        const slim = networkBuckets.slice(0, 50).map((it) => ({
                            url: it.url,
                            json: it.json,
                        }));
                        const out = resolve(logsDir, `scrape-net-${Date.now()}.json`);
                        writeFileSync(out, JSON.stringify({ url, count: networkBuckets.length, items: slim }, null, 2), 'utf-8');
                        this.logger.warn(`scrapeWithPlaywright: zero reviews, network dump saved: ${out}`);
                    }
                    catch { }
                }
                if ((finalReviews?.length || 0) === 0 && (options?.screenshotOnZero || options?.saveHtmlOnZero)) {
                    try {
                        const { mkdtempSync, writeFileSync } = await import('fs');
                        const { tmpdir } = await import('os');
                        const { sep } = await import('path');
                        const dir = mkdtempSync(tmpdir() + sep + 'gc-');
                        if (options?.screenshotOnZero) {
                            const imgPath = dir + sep + `tiktok-zero-${Date.now()}.png`;
                            await page.screenshot({ path: imgPath, fullPage: true });
                            this.logger.warn(`scrapeWithPlaywright: zero reviews, screenshot saved: ${imgPath}`);
                        }
                        if (options?.saveHtmlOnZero) {
                            const htmlPath = dir + sep + `tiktok-zero-${Date.now()}.html`;
                            writeFileSync(htmlPath, await page.content(), { encoding: 'utf-8' });
                            this.logger.warn(`scrapeWithPlaywright: zero reviews, html saved: ${htmlPath}`);
                        }
                    }
                    catch { }
                }
                try {
                    const anyCtx = context;
                    if (anyCtx?.__gc_browser__) {
                        await anyCtx.__gc_browser__.close();
                    }
                    else {
                        await context.close();
                    }
                }
                catch { }
                if (harPath) {
                    try {
                        this.logger.log(`scrapeWithPlaywright: HAR saved at ${harPath}`);
                    }
                    catch { }
                }
                this.logger.log(`scrapeWithPlaywright: got ${(finalReviews || []).length} reviews (attempt ${attempt})`);
                return finalReviews || [];
            }
            catch (error) {
                lastError = error;
                this.logger.warn(`scrapeWithPlaywright attempt ${attempt} failed: ${error?.message || error}`);
                const base = (() => {
                    const v = Number(process.env.REVIEWS_RETRY_BACKOFF_MS);
                    if (!isFinite(v) || v <= 0)
                        return 150;
                    return Math.max(50, Math.min(1000, Math.round(v)));
                })();
                const wait = Math.min(base * attempt, 500);
                await new Promise(r => setTimeout(r, wait));
            }
        }
        this.logger.error(`Playwright scraping failed after ${maxRetries} attempts: ${lastError?.message || lastError}`);
        return [];
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = ReviewsService_1 = __decorate([
    (0, common_1.Injectable)()
], ReviewsService);
function splitJsonCandidates(raw) {
    const out = [];
    const trimmed = raw.trim();
    if (!trimmed)
        return out;
    try {
        JSON.parse(trimmed);
        out.push(trimmed);
        return out;
    }
    catch { }
    const s = trimmed;
    let depth = 0, start = -1;
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (ch === '{' || ch === '[') {
            if (depth === 0)
                start = i;
            depth++;
        }
        else if (ch === '}' || ch === ']') {
            depth--;
            if (depth === 0 && start >= 0) {
                out.push(s.slice(start, i + 1));
                start = -1;
            }
        }
    }
    if (!out.length)
        out.push(trimmed);
    return out;
}
function decodeHtml(s) {
    return s
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}
//# sourceMappingURL=reviews.service.js.map