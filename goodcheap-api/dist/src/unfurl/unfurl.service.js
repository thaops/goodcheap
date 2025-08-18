"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnfurlService = void 0;
const common_1 = require("@nestjs/common");
const ua_1 = require("../common/ua");
const html_1 = require("../common/html");
let UnfurlService = class UnfurlService {
    ensureValidUrl(url) {
        try {
            new URL(url);
        }
        catch {
            throw new common_1.BadRequestException('Invalid URL');
        }
    }
    async expandUrl(url) {
        this.ensureValidUrl(url);
        try {
            const { default: got } = await import('got');
            const res = await got(url, {
                followRedirect: true,
                headers: { 'user-agent': ua_1.UA },
                timeout: { request: 10000 },
            });
            return res.url;
        }
        catch (e) {
            const status = e?.response?.statusCode ?? 502;
            const msg = e?.message || 'Failed to expand URL';
            throw new common_1.HttpException(`Expand URL error: ${msg}`, status);
        }
    }
    detectSource(finalUrl) {
        if (finalUrl.includes('tiktok'))
            return 'tiktok';
        if (finalUrl.includes('shopee'))
            return 'shopee';
        if (finalUrl.includes('lazada'))
            return 'lazada';
        return 'other';
    }
    parseTiktokOgInfo(finalUrl) {
        try {
            const u = new URL(finalUrl);
            const raw = u.searchParams.get('og_info');
            if (!raw)
                return {};
            const data = JSON.parse(decodeURIComponent(raw));
            const title = typeof data?.title === 'string' ? data.title : undefined;
            const image = typeof data?.image === 'string' ? data.image : undefined;
            return { title, image };
        }
        catch {
            return {};
        }
    }
    async fetchHtml(url) {
        this.ensureValidUrl(url);
        try {
            const { default: got } = await import('got');
            return await got(url, {
                headers: { 'user-agent': ua_1.UA },
                timeout: { request: 10000 },
            }).text();
        }
        catch (e) {
            const status = e?.response?.statusCode ?? 502;
            const msg = e?.message || 'Failed to fetch HTML';
            throw new common_1.HttpException(`Fetch HTML error: ${msg}`, status);
        }
    }
    async fromUrl(url) {
        try {
            const finalUrl = await this.expandUrl(url);
            const dto = {
                finalUrl,
                source: this.detectSource(finalUrl),
                images: [],
            };
            if (dto.source === 'tiktok') {
                const og = this.parseTiktokOgInfo(finalUrl);
                if (og.title && !dto.title)
                    dto.title = og.title;
                if (og.image)
                    dto.images = [og.image];
            }
            let html = null;
            try {
                html = await this.fetchHtml(finalUrl);
            }
            catch {
                html = null;
            }
            if (html) {
                const ld = (0, html_1.pickJsonLdProduct)(html);
                if (ld) {
                    if (!dto.title && ld.name)
                        dto.title = ld.name;
                    const imgs = ld.image || [];
                    const parsedImgs = Array.isArray(imgs) ? imgs : [imgs].filter(Boolean);
                    if (!dto.images?.length && parsedImgs.length)
                        dto.images = parsedImgs;
                    const offers = Array.isArray(ld.offers) ? ld.offers?.[0] : ld.offers || {};
                    if (offers?.price)
                        dto.price = Number(offers.price);
                    if (offers?.priceCurrency)
                        dto.currency = offers.priceCurrency;
                    const agg = ld.aggregateRating || {};
                    if (agg?.ratingValue)
                        dto.ratingAvg = Number(agg.ratingValue);
                    if (agg?.reviewCount)
                        dto.reviewCount = Number(agg.reviewCount);
                    if (!dto.description && ld.description)
                        dto.description = String(ld.description);
                }
                else {
                    const ogm = (0, html_1.pickOpenGraph)(html);
                    if (!dto.title && ogm['og:title'])
                        dto.title = ogm['og:title'];
                    if (!dto.images.length && ogm['og:image'])
                        dto.images = [ogm['og:image']];
                    if (ogm['product:price:amount'])
                        dto.price = Number(ogm['product:price:amount']);
                    if (ogm['product:price:currency'])
                        dto.currency = ogm['product:price:currency'];
                }
            }
            return dto;
        }
        catch (e) {
            if (e instanceof common_1.HttpException)
                throw e;
            throw new common_1.InternalServerErrorException(e?.message || 'Unfurl failed');
        }
    }
};
exports.UnfurlService = UnfurlService;
exports.UnfurlService = UnfurlService = __decorate([
    (0, common_1.Injectable)()
], UnfurlService);
//# sourceMappingURL=unfurl.service.js.map