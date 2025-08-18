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
  pricing: z.object({
    currentPrice: z.number().optional(),
    originalPrice: z.number().optional(),
    currency: z.string().optional(),
    discountPct: z.number().optional(),
    priceHistory: z.array(z.object({
      date: z.string().date(), // ISO date format (YYYY-MM-DD)
      price: z.number(),
    })).optional(),
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
  psychology: z.object({
    buyerDecisionScorecard: z.object({
      trust: z.number().min(0).max(2).optional(),
      evidence: z.number().min(0).max(2).optional(),
      riskReversal: z.number().min(0).max(2).optional(),
      easeToBuy: z.number().min(0).max(2).optional(),
      urgency: z.number().min(0).max(2).optional(),
      total: z.number().min(0).max(10).optional(),
    }).optional(),
    factors: z.object({
      socialProofStrength: z.number().min(0).max(1).optional(),
      lossAversionMitigation: z.number().min(0).max(1).optional(),
      ambiguityMitigation: z.number().min(0).max(1).optional(),
      urgencyScarcity: z.number().min(0).max(1).optional(),
      abilityFriction: z.number().min(0).max(1).optional(),
    }).optional(),
    notes: z.array(z.string()).optional(),
  }).optional(),
  aiAnalysis: z.object({
    verdict: z.enum(['buy', 'consider', 'hold', 'avoid']),
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
  evidence: z.array(z.object({
    id: z.string(),
    type: z.enum(['productPage', 'review', 'creatorVideo', 'live', 'qna', 'shopPolicy', 'externalPage']),
    url: z.string().url(),
    reliability: z.number().min(0).max(1).optional(),
    freshnessDays: z.number().min(0).optional(),
    scrapedAt: z.string().datetime(), // ISO date-time format
  })).min(1),
  system: z.object({
    llm: z.string().optional(),
    llmVersion: z.string().optional(),
    latencyMs: z.number().int().optional(),
    warnings: z.array(z.string()).optional(),
  }).optional(),
});

export type CommerceReviewResponse = z.infer<typeof CommerceReviewResponseSchema>;
