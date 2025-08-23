"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimplifiedResponseMapper = void 0;
const common_1 = require("@nestjs/common");
let SimplifiedResponseMapper = class SimplifiedResponseMapper {
    transform(originalResponse) {
        return {
            product: {
                id: originalResponse.meta.productId,
                title: originalResponse.product.title,
                brand: originalResponse.product.brand ||
                    originalResponse.productNormalization?.brand ||
                    undefined,
                images: originalResponse.product.images,
                canonicalUrl: originalResponse.product.canonicalUrl,
                size: originalResponse.productNormalization?.size || undefined,
                category: originalResponse.product.category,
            },
            pricing: {
                currentPrice: originalResponse.marketplace?.price?.current ||
                    originalResponse.marketplace?.price?.sale ||
                    undefined,
                originalPrice: originalResponse.marketplace?.price?.original ||
                    originalResponse.marketplace?.price?.list ||
                    undefined,
                currency: originalResponse.meta.currency,
                discount: originalResponse.marketplace?.price?.discountPct,
                priceHistory: originalResponse.marketplace?.price?.history?.map((h) => ({
                    date: h.date,
                    price: h.price,
                })) || [],
                availability: originalResponse.availability?.stockStatus || 'unknown',
            },
            reviews: {
                totalCount: originalResponse.reviewsAggregate?.count ||
                    originalResponse.socialProof?.ratingCount ||
                    originalResponse.reviews?.length ||
                    0,
                averageRating: originalResponse.reviewsAggregate?.average ||
                    originalResponse.socialProof?.ratingAvg ||
                    originalResponse.marketplace?.product?.ratingAvg ||
                    undefined,
                breakdown: originalResponse.reviewsAggregate?.breakdown ||
                    originalResponse.socialProof?.ratingBreakdown ||
                    originalResponse.marketplace?.product?.ratingDist ||
                    undefined,
                items: originalResponse.reviews?.map((review) => ({
                    id: review.id,
                    author: review.author,
                    rating: review.rating,
                    text: review.text,
                    date: review.date,
                    media: review.media || [],
                    source: review.source,
                    verifiedPurchase: review.verifiedPurchase,
                })) || [],
            },
            reviewSummary: {
                topPros: originalResponse.reviewSummary?.topPros || [],
                topCons: originalResponse.reviewSummary?.topCons || [],
                topics: originalResponse.reviewSummary?.topics?.map((topic) => ({
                    name: topic.name,
                    sentiment: topic.sentiment || 'neutral',
                    mentions: topic.supportCount || 0,
                })) || [],
                reviewWithMediaPercent: originalResponse.reviewsAggregate?.reviewWithImagesPercent || 0,
            },
            policies: {
                returnPolicy: originalResponse.policies?.returnPolicy ||
                    originalResponse.marketplace?.product?.returnPolicy ||
                    undefined,
                returnWindowDays: originalResponse.policies?.returnWindowDays,
                warranty: originalResponse.policies?.warranty ||
                    originalResponse.marketplace?.product?.warranty ||
                    undefined,
                cod: originalResponse.policies?.cod ||
                    originalResponse.marketplace?.product?.shipping?.cod ||
                    undefined,
                shipping: {
                    minDays: originalResponse.policies?.shippingTimeDays ||
                        originalResponse.marketplace?.product?.shipping?.minDays ||
                        undefined,
                    maxDays: originalResponse.marketplace?.product?.shipping?.maxDays ||
                        undefined,
                    freeThreshold: originalResponse.policies?.freeShipThreshold ||
                        originalResponse.marketplace?.product?.shipping?.freeThreshold ||
                        undefined,
                },
            },
            aiAnalysis: {
                verdict: originalResponse.aiAnalysis?.verdict ||
                    originalResponse.aiDecision?.verdict ||
                    'unknown',
                confidence: Math.round((originalResponse.aiAnalysis?.confidence || 0) * 100),
                reasons: originalResponse.aiAnalysis?.reasons ||
                    originalResponse.aiDecision?.reasons?.map((r) => r.detail || r.id) ||
                    [],
                overallScore: originalResponse.psychologyV2?.scorecard?.total || 0,
                trustScore: originalResponse.psychologyV2?.scorecard?.trust?.score || 0,
                evidenceScore: originalResponse.psychologyV2?.scorecard?.evidence?.score || 0,
            },
            evidence: {
                productPage: originalResponse.meta.sourceUrl,
                linkedVideos: this.extractLinkedVideos(originalResponse),
                reliability: this.calculateOverallReliability(originalResponse),
            },
            meta: {
                platform: originalResponse.meta.platform,
                locale: originalResponse.meta.locale,
                timestamp: originalResponse.meta.timestamp,
                processingTime: originalResponse.system?.latencyMs,
                warnings: originalResponse.system?.warnings,
            },
        };
    }
    extractLinkedVideos(response) {
        const videos = [];
        if (response.product.videos) {
            videos.push(...response.product.videos.map((video) => ({
                id: video.url.split('/').pop() || '',
                title: '',
                author: '',
                url: video.url,
                views: video.views,
                likes: video.likes,
                thumbnail: '',
            })));
        }
        const videoEvidence = response.evidence.filter((e) => e.type === 'creatorVideo' || e.type === 'live');
        videos.push(...videoEvidence.map((evidence) => ({
            id: evidence.id,
            title: evidence.title || '',
            author: evidence.author?.name || '',
            url: evidence.url || '',
            views: evidence.engagement?.views,
            likes: evidence.engagement?.likes,
            thumbnail: '',
        })));
        return videos;
    }
    calculateOverallReliability(response) {
        if (!response.evidence || response.evidence.length === 0) {
            return 0;
        }
        const reliabilities = response.evidence
            .map((e) => e.reliability || 0)
            .filter((r) => r > 0);
        if (reliabilities.length === 0) {
            return 0;
        }
        const productPageReliability = response.evidence.find((e) => e.type === 'productPage')?.reliability || 0;
        const otherReliabilities = response.evidence
            .filter((e) => e.type !== 'productPage')
            .map((e) => e.reliability || 0);
        const totalWeight = otherReliabilities.length + 2;
        const weightedSum = productPageReliability * 2 +
            otherReliabilities.reduce((sum, r) => sum + r, 0);
        return weightedSum / totalWeight;
    }
};
exports.SimplifiedResponseMapper = SimplifiedResponseMapper;
exports.SimplifiedResponseMapper = SimplifiedResponseMapper = __decorate([
    (0, common_1.Injectable)()
], SimplifiedResponseMapper);
//# sourceMappingURL=simplified-response.mapper.js.map