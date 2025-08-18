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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoController = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const gemini_service_1 = require("../ai/gemini.service");
const swagger_1 = require("@nestjs/swagger");
let VideoController = class VideoController {
    ai;
    unfurl;
    constructor(ai, unfurl) {
        this.ai = ai;
        this.unfurl = unfurl;
    }
    async search(body) {
        const schema = zod_1.z.object({
            title: zod_1.z.string().min(1).optional(),
            finalUrl: zod_1.z.string().url().optional(),
            max: zod_1.z.number().int().min(1).max(10).optional(),
        });
        const input = schema.parse(body);
        let product = {
            finalUrl: input.finalUrl ?? '',
            source: 'other',
            title: input.title,
            images: [],
        };
        if (!product.title && product.finalUrl) {
            try {
                const enriched = await this.unfurl.fromUrl(product.finalUrl);
                product = {
                    ...product,
                    ...enriched,
                    title: product.title || enriched.title,
                    images: (product.images && product.images.length ? product.images : (enriched.images || [])),
                };
            }
            catch { }
        }
        const [ytItems, ttItems] = await Promise.all([
            this.ai.searchYouTubeReviews(product).catch(() => []),
            this.ai.searchTikTokReviews(product).catch(() => []),
        ]);
        const max = input.max ?? undefined;
        const toLinks = (items) => (items || [])
            .map((it) => it?.url)
            .filter((u) => typeof u === 'string' && u.length > 0);
        const youtube = toLinks(ytItems).slice(0, max ?? ytItems.length);
        const tiktok = toLinks(ttItems).slice(0, max ?? ttItems.length);
        const all = Array.from(new Set([...youtube, ...tiktok]));
        return { youtube, tiktok, all };
    }
};
exports.VideoController = VideoController;
__decorate([
    (0, swagger_1.ApiBody)({
        description: 'Tìm video review liên quan theo title hoặc finalUrl (có thể set max 1..10)',
        required: true,
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'Apple AirPods Pro 2' },
                finalUrl: { type: 'string', format: 'uri', example: 'https://www.apple.com/airpods-pro/' },
                max: { type: 'integer', minimum: 1, maximum: 10, example: 5 },
            },
        },
    }),
    (0, common_1.Post)('search'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "search", null);
exports.VideoController = VideoController = __decorate([
    (0, swagger_1.ApiTags)('video'),
    (0, common_1.Controller)('video'),
    __param(0, (0, common_1.Inject)('GeminiService')),
    __param(1, (0, common_1.Inject)('UnfurlService')),
    __metadata("design:paramtypes", [gemini_service_1.GeminiService, Object])
], VideoController);
//# sourceMappingURL=video.controller.js.map