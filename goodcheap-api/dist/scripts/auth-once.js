"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const fs_1 = require("fs");
const path_1 = require("path");
function parseArg(flag) {
    const idx = process.argv.indexOf(flag);
    if (idx >= 0 && idx + 1 < process.argv.length)
        return process.argv[idx + 1];
    return undefined;
}
async function main() {
    const url = parseArg('--url') || 'https://www.tiktok.com';
    const outPath = (0, path_1.resolve)(parseArg('--out') || 'storageState.json');
    const userDataDir = (0, path_1.resolve)(parseArg('--profileDir') || '.playwright-tiktok');
    console.log(`[auth-once] Launching persistent context: ${userDataDir}`);
    const context = await playwright_1.chromium.launchPersistentContext(userDataDir, {
        headless: false,
        viewport: { width: 420, height: 820 },
        locale: 'vi-VN',
        timezoneId: 'Asia/Ho_Chi_Minh',
        geolocation: { latitude: 10.8231, longitude: 106.6297 },
        permissions: ['geolocation'],
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    });
    const page = context.pages()[0] || (await context.newPage());
    await page.goto(url, { waitUntil: 'load', timeout: 120_000 });
    console.log('[auth-once] Trang đã mở. Hãy giải CAPTCHA / đăng nhập nếu cần.');
    console.log('[auth-once] Script sẽ tự kiểm tra trạng thái mỗi 5s. Đóng tab sau khi hoàn tất hoặc để script lưu state.');
    let solved = false;
    for (let i = 0; i < 120; i++) {
        try {
            const content = (await page.content()) || '';
            if (/Verify to continue|Security Check|captcha/i.test(content)) {
                console.log('[auth-once] Vẫn thấy CAPTCHA. Đang chờ bạn tương tác...');
            }
            else {
                solved = true;
                break;
            }
        }
        catch { }
        await page.waitForTimeout(5000);
    }
    (0, fs_1.mkdirSync)((0, path_1.dirname)(outPath), { recursive: true });
    const state = await context.storageState();
    (0, fs_1.writeFileSync)(outPath, JSON.stringify(state, null, 2), { encoding: 'utf-8' });
    console.log(`[auth-once] storageState saved: ${outPath}`);
    if (!solved) {
        console.warn('[auth-once] Cảnh báo: Có thể CAPTCHA chưa được vượt qua. Dù vậy state đã được lưu.');
    }
    await context.close();
}
main().catch(async (e) => {
    console.error('[auth-once] Error:', e);
    process.exit(1);
});
//# sourceMappingURL=auth-once.js.map