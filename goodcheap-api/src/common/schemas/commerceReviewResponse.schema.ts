import { z } from 'zod';

// Define the Zod schema for the evidence-first product analysis response
export const CommerceReviewResponseSchema = z.object({
  schemaVersion: z.string(),
  meta: z.object({
    platform: z.enum(['tiktok', 'shopee', 'lazada', 'other']),
    locale: z.string(),
    currency: z.string(),
    timestamp: z.string().datetime(), // ISO date-time format
    productId: z.string(),
    sourceUrl: z.string().url(),
  }),
  product: z.object({
    title: z.string(),
    canonicalUrl: z.string().url(),
    canonicalUrlClean: z.string().url().optional(),
    brand: z.string().optional(),
    category: z.string().optional(),
    attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
    seller: z.object({
      id: z.string().optional(),
      name: z.string().optional(),
      rating: z.number().min(0).max(5).optional(),
      followerCount: z.number().int().min(0).optional(),
      shopAgeMonths: z.number().int().min(0).optional(),
      badges: z.array(z.string()).optional(),
    }).optional(),
    images: z.array(z.string().url()).min(1),
    videos: z.array(z.object({
      url: z.string().url(),
      type: z.enum(['demo', 'creator_review', 'live_replay', 'ugc']).optional(),
      views: z.number().int().min(0).optional(),
      likes: z.number().int().min(0).optional(),
      evidenceId: z.string().optional(),
    })).optional(),
  }),
  // Chuẩn hoá sản phẩm (brand/line/size/category/gtin/variant)
  productNormalization: z.object({
    brand: z.string().nullable().optional(),
    line: z.string().nullable().optional(),
    size: z.object({
      value: z.number(),
      unit: z.string(),
    }).nullable().optional(),
    categoryPath: z.array(z.string()).optional(),
    gtin: z.string().nullable().optional(),
    variantKey: z.string().nullable().optional(),
    ingredientHash: z.string().nullable().optional(),
  }).optional(),
  availability: z.object({
    stockStatus: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'preorder', 'unknown']).optional(),
    stockCount: z.number().int().optional(),
    shipFrom: z.string().optional(),
    shippingOptions: z.array(z.object({
      carrier: z.string().optional(),
      etaDays: z.number().int().optional(),
      fee: z.number().optional(),
    })).optional(),
  }).optional(),
  policies: z.object({
    returnPolicy: z.string().optional(),
    returnWindowDays: z.number().int().optional(),
    buyerProtection: z.string().optional(),
    warranty: z.string().optional(),
    cod: z.boolean().optional(),
    shippingTimeDays: z.number().int().optional(),
    freeShipThreshold: z.number().optional(),
  }).optional(),
  socialProof: z.object({
    ratingAvg: z.number().min(0).max(5).optional(),
    ratingCount: z.number().int().min(0).optional(),
    ratingBreakdown: z.record(z.string(), z.number().int()).optional(),
    qnaCount: z.number().int().min(0).optional(),
  }).optional(),
  reviews: z.array(z.object({
    id: z.string(),
    author: z.string().optional(),
    rating: z.number().min(1).max(5),
    text: z.string(),
    pros: z.array(z.string()).optional(),
    cons: z.array(z.string()).optional(),
    media: z.array(z.string().url()).optional(),
    helpfulCount: z.number().int().optional(),
    verifiedPurchase: z.boolean().optional(),
    language: z.string().optional(),
    date: z.string().date(), // ISO date format (YYYY-MM-DD)
    source: z.enum(['platform', 'tiktok_video', 'external', 'unknown']),
    evidenceId: z.string(),
  })),
  reviewsAggregate: z.object({
    count: z.number().int().min(0).optional(),
    average: z.number().min(0).max(5).optional(),
    breakdown: z.record(z.string(), z.number().int()).optional(),
    recentCount30d: z.number().int().min(0).optional(),
    verifiedPurchaseRatio: z.number().min(0).max(1).optional(),
  }).optional(),
  reviewSummary: z.object({
    topPros: z.array(z.string()).optional(),
    topCons: z.array(z.string()).optional(),
    topics: z.array(z.object({
      name: z.string(),
      sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
      supportCount: z.number().int().optional(),
      confidence: z.number().min(0).max(1).optional(),
      evidenceIds: z.array(z.string()).optional(),
    })).optional(),
  }).optional(),
  // Psychology V2 (0-100 + signals/gaps + flags)
  psychologyV2: z.object({
    scorecard: z.object({
      trust: z.object({ score: z.number().min(0).max(100), signals: z.array(z.string()).optional(), gaps: z.array(z.string()).optional() }).optional(),
      evidence: z.object({ score: z.number().min(0).max(100), signals: z.array(z.string()).optional(), gaps: z.array(z.string()).optional() }).optional(),
      riskReversal: z.object({ score: z.number().min(0).max(100), signals: z.array(z.string()).optional(), gaps: z.array(z.string()).optional() }).optional(),
      easeToBuy: z.object({ score: z.number().min(0).max(100), signals: z.array(z.string()).optional(), gaps: z.array(z.string()).optional() }).optional(),
      urgency: z.object({ score: z.number().min(0).max(100), signals: z.array(z.string()).optional(), gaps: z.array(z.string()).optional() }).optional(),
      total: z.number().min(0).max(100).optional(),
    }),
    flags: z.array(z.string()).optional(),
  }).optional(),
  aiAnalysis: z.object({
    verdict: z.enum(['buy', 'consider', 'hold', 'avoid', 'unknown']),
    confidence: z.number().min(0).max(1),
    reasons: z.array(z.string()).optional(),
    claims: z.array(z.object({
      label: z.string(),
      value: z.union([z.string(), z.number(), z.boolean(), z.object({}).optional(), z.array(z.any()).optional(), z.null()]),
      confidence: z.number().min(0).max(1).optional(),
      evidenceId: z.string(),
    })).optional(),
    citations: z.array(z.object({
      evidenceId: z.string(),
      note: z.string().optional(),
      reliability: z.number().min(0).max(1).optional(),
    })),
  }),
  // Quyết định AI có giải thích (V2)
  aiDecision: z.object({
    verdict: z.enum(['buy', 'consider', 'avoid', 'unknown']),
    confidence: z.number().min(0).max(100).optional(),
    reasons: z.array(z.object({ id: z.string(), weight: z.number().min(0).max(1).optional(), detail: z.string().optional() })).optional(),
    whatToCollectNext: z.array(z.string()).optional(),
  }).optional(),
  evidencePolicy: z.object({
    countUnlinked: z.boolean(),
  }).optional(),
  evidence: z.array(z.object({
    id: z.string(),
    type: z.enum(['productPage', 'review', 'creatorVideo', 'live', 'qna', 'shopPolicy', 'externalPage']),
    url: z.string().url().optional(),
    reliability: z.number().min(0).max(1).optional(),
    freshnessDays: z.number().min(0).optional(),
    scrapedAt: z.string().datetime().optional(), // ISO date-time format
    // Mở rộng evidence để gom cả video/review về 1 mảng thống nhất
    source: z.object({ platform: z.string(), type: z.string().optional() }).optional(),
    title: z.string().optional(),
    lang: z.string().optional(),
    publishedAt: z.string().date().optional(),
    engagement: z.object({ views: z.number().int().min(0).optional(), likes: z.number().int().min(0).optional(), comments: z.number().int().min(0).optional() }).optional(),
    author: z.object({ name: z.string().optional(), channelSubs: z.number().int().min(0).optional(), verified: z.boolean().optional() }).optional(),
    linkedToProduct: z.boolean().optional(),
    relevanceScore: z.number().min(0).max(1).optional(),
    claims: z.array(z.string()).optional(),
    sentiment: z.object({ polarity: z.enum(['pos','neu','neg']).optional(), score: z.number().min(0).max(1).optional() }).optional(),
  })).min(1),
  system: z.object({
    llm: z.string().optional(),
    llmVersion: z.string().optional(),
    latencyMs: z.number().int().optional(),
    warnings: z.array(z.string()).optional(),
  }).optional(),
  // Lõi marketplace bổ sung (shop/product/price)
  marketplace: z.object({
    shop: z.object({
      shopId: z.string().optional(),
      name: z.string().optional(),
      isOfficialStore: z.boolean().optional(),
      ratings: z.object({ avg: z.number().min(0).max(5).optional(), count: z.number().int().min(0).optional() }).optional(),
      rating: z.number().min(0).max(5).optional(),
      followers: z.number().int().min(0).optional(),
      responseRate: z.number().min(0).max(100).optional(),
      ageDays: z.number().int().min(0).optional(),
      badges: z.array(z.string()).optional(),
    }).optional(),
    product: z.object({
      ratingAvg: z.number().min(0).max(5).optional(),
      ratingCount: z.number().int().min(0).optional(),
      soldCount: z.union([z.number(), z.string()]).optional(),
      ratingDist: z.record(z.string(), z.number().int()).optional(),
      qaCount: z.number().int().min(0).optional(),
      returnPolicy: z.string().optional(),
      warranty: z.string().optional(),
      shipping: z.object({ minDays: z.number().int().optional(), maxDays: z.number().int().optional(), cod: z.boolean().optional(), freeThreshold: z.number().optional() }).optional(),
    }).optional(),
    price: z.object({
      list: z.number().optional(),
      sale: z.number().optional(),
      currency: z.string().optional(),
      per_100ml: z.number().optional(),
      per_100g: z.number().optional(),
      history: z.array(z.object({ date: z.string().date(), price: z.number() })).optional(),
      current: z.number().optional(),
      original: z.number().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      updatedAt: z.string().datetime().optional(),
      discountPct: z.number().int().min(0).max(100).optional(),
    }).optional(),
  }).optional(),
});

export type CommerceReviewResponse = z.infer<typeof CommerceReviewResponseSchema>;
