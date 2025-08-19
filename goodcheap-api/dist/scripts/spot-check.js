"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_mapper_1 = require("../src/analyze/response.mapper");
const psychology_service_1 = require("../src/psychology/psychology.service");
async function main() {
    const mapper = new response_mapper_1.ResponseMapper(new psychology_service_1.PsychologyService());
    const tiktokProduct = {
        finalUrl: 'https://www.tiktok.com/@shop/product/123456',
        canonicalUrl: 'https://www.tiktok.com/@shop/product/123456',
        source: 'tiktok',
        title: 'CeraVe Blemish Control Cleanser 40ml',
        currency: 'VND',
        price: 350,
        listPrice: 400,
        ratingAvg: 4.6,
        reviewCount: 120,
        images: ['https://example.com/img.jpg'],
        videos: [
            { url: 'https://www.tiktok.com/@creator/video/123', views: 10000, likes: 500 },
        ],
    };
    const shopeeProduct = {
        finalUrl: 'https://shopee.vn/product/987654',
        canonicalUrl: 'https://shopee.vn/product/987654',
        source: 'shopee',
        title: 'CeraVe Blemish Control Cleanser 40ml',
        currency: 'VND',
        price: 350,
        listPrice: 400,
        ratingAvg: 4.6,
        reviewCount: 120,
    };
    const analysis = {
        pros: ['Good'],
        cons: [],
        aspects: [],
        decision: { verdict: 'consider', rationale: ['demo'] },
    };
    const resTikTok = mapper.mapToEvidenceFirstResponse(tiktokProduct, analysis, {});
    const resShopee = mapper.mapToEvidenceFirstResponse(shopeeProduct, analysis, {});
    const pick = (r) => ({
        platform: r.meta?.platform,
        currency: r.marketplace?.price?.currency,
        sale: r.marketplace?.price?.sale,
        list: r.marketplace?.price?.list,
        current: r.marketplace?.price?.current,
        original: r.marketplace?.price?.original,
        per_100ml: r.marketplace?.price?.per_100ml,
        brand: r.productNormalization?.brand,
    });
    console.log('TikTok result:', pick(resTikTok));
    console.log('Shopee result:', pick(resShopee));
}
main().catch(err => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=spot-check.js.map