'use strict';
const { ResponseMapper } = require('../dist/src/analyze/response.mapper.js');
const { PsychologyService } = require('../dist/src/psychology/psychology.service.js');

async function main() {
  const mapper = new ResponseMapper(new PsychologyService());

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
    videos: [ { url: 'https://www.tiktok.com/@creator/video/123', views: 10000, likes: 500 } ],
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
    images: ['https://example.com/img.jpg'],
  };

  const analysis = {
    pros: ['Good'], cons: [], aspects: [],
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
  });

  console.log('TikTok result:', pick(resTikTok));
  console.log('Shopee result:', pick(resShopee));
}

main().catch((e) => { console.error(e); process.exit(1); });
