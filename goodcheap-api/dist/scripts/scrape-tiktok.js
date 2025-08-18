"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reviews_service_1 = require("../src/reviews/reviews.service");
const fs_1 = require("fs");
const playwright_1 = require("playwright");
const path_1 = require("path");
function parseArg(flag) {
    const idx = process.argv.indexOf(flag);
    if (idx >= 0 && idx + 1 < process.argv.length)
        return process.argv[idx + 1];
    return undefined;
}
function nowSlug() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return (d.getFullYear() +
        pad(d.getMonth() + 1) +
        pad(d.getDate()) +
        '-' +
        pad(d.getHours()) +
        pad(d.getMinutes()) +
        pad(d.getSeconds()));
}
async function precheck(url, storageStatePath) {
    const browser = await playwright_1.chromium.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const context = await browser.newContext({
        storageState: storageStatePath || undefined,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        viewport: { width: 390, height: 844 },
        locale: 'vi-VN',
        timezoneId: 'Asia/Ho_Chi_Minh',
        geolocation: { latitude: 10.8231, longitude: 106.6297 },
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'load', timeout: 120000 });
    await page.waitForTimeout(3000 + Math.floor(Math.random() * 1000));
    let reason;
    let html = await page.content();
    if (/Verify to continue|Security Check|captcha/i.test(html)) {
        const start = Date.now();
        while (Date.now() - start < 120000) {
            await page.waitForTimeout(2000);
            html = await page.content();
            if (!/Verify to continue|Security Check|captcha/i.test(html))
                break;
        }
        html = await page.content();
        if (/Verify to continue|Security Check|captcha/i.test(html))
            reason = 'captcha';
    }
    if (!reason && /not available in your region|không khả dụng ở khu vực của bạn/i.test(html)) {
        reason = 'region_restricted';
    }
    await browser.close();
    return { reason };
}
async function main() {
    const url = parseArg('--url') || 'https://www.tiktok.com/view/product/1732182775018654226';
    const productId = parseArg('--productId') || parseArg('--id') || 'demo';
    const storageStatePath = parseArg('--storageState');
    const logsDir = (0, path_1.resolve)('logs');
    (0, fs_1.mkdirSync)(logsDir, { recursive: true });
    console.log(`[scrape] Start TikTok reviews: url=${url}, productId=${productId}`);
    const pre = await precheck(url, storageStatePath);
    if (pre.reason) {
        const out = { ok: false, reason: pre.reason, url, productId };
        const outPath = (0, path_1.resolve)(logsDir, `scrape-${nowSlug()}.json`);
        (0, fs_1.writeFileSync)(outPath, JSON.stringify(out, null, 2), { encoding: 'utf-8' });
        console.error(`[scrape] Blocked: ${pre.reason}. Saved log: ${outPath}`);
        console.log(JSON.stringify(out, null, 2));
        process.exit(2);
        return;
    }
    await new Promise((r) => setTimeout(r, 200 + Math.floor(Math.random() * 600)));
    if (storageStatePath) {
        process.env.TIKTOK_STORAGE_STATE_PATH = storageStatePath;
    }
    process.env.TIKTOK_USE_PERSISTENT = '1';
    const svc = new reviews_service_1.ReviewsService();
    const reviews = await svc.extractTikTokReviews(url, productId);
    if (!Array.isArray(reviews) || reviews.length === 0) {
        const out = { ok: false, reason: 'no_reviews_found', url, productId };
        const outPath = (0, path_1.resolve)(logsDir, `scrape-${nowSlug()}.json`);
        (0, fs_1.writeFileSync)(outPath, JSON.stringify(out, null, 2), { encoding: 'utf-8' });
        console.warn(`[scrape] No reviews found. Saved log: ${outPath}`);
        console.log(JSON.stringify(out, null, 2));
        process.exit(3);
        return;
    }
    const out = { ok: true, url, productId, count: reviews.length, reviews };
    const outPath = (0, path_1.resolve)(logsDir, `scrape-${nowSlug()}.json`);
    (0, fs_1.writeFileSync)(outPath, JSON.stringify(out, null, 2), { encoding: 'utf-8' });
    console.log(`[scrape] Reviews count = ${reviews.length}. Saved: ${outPath}`);
    console.log(JSON.stringify(out, null, 2));
}
main().catch((e) => {
    const logsDir = (0, path_1.resolve)('logs');
    (0, fs_1.mkdirSync)(logsDir, { recursive: true });
    const outPath = (0, path_1.resolve)(logsDir, `scrape-error-${nowSlug()}.json`);
    const payload = { ok: false, reason: 'exception', message: String(e?.message || e), stack: String(e?.stack || '') };
    (0, fs_1.writeFileSync)(outPath, JSON.stringify(payload, null, 2), { encoding: 'utf-8' });
    console.error('[scrape] Error. Saved:', outPath);
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=scrape-tiktok.js.map