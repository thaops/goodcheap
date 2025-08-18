import { z } from 'zod';
export declare const CommerceReviewResponseSchema: z.ZodObject<{
    schemaVersion: z.ZodString;
    meta: z.ZodObject<{
        platform: z.ZodEnum<["tiktok", "shopee", "lazada", "other"]>;
        locale: z.ZodString;
        currency: z.ZodString;
        timestamp: z.ZodString;
        productId: z.ZodString;
        sourceUrl: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        locale: string;
        productId: string;
        currency: string;
        platform: "tiktok" | "shopee" | "lazada" | "other";
        timestamp: string;
        sourceUrl: string;
    }, {
        locale: string;
        productId: string;
        currency: string;
        platform: "tiktok" | "shopee" | "lazada" | "other";
        timestamp: string;
        sourceUrl: string;
    }>;
    product: z.ZodObject<{
        title: z.ZodString;
        canonicalUrl: z.ZodString;
        brand: z.ZodOptional<z.ZodString>;
        category: z.ZodOptional<z.ZodString>;
        attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>>;
        seller: z.ZodOptional<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
            rating: z.ZodOptional<z.ZodNumber>;
            followerCount: z.ZodOptional<z.ZodNumber>;
            shopAgeMonths: z.ZodOptional<z.ZodNumber>;
            badges: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            rating?: number | undefined;
            name?: string | undefined;
            id?: string | undefined;
            followerCount?: number | undefined;
            shopAgeMonths?: number | undefined;
            badges?: string[] | undefined;
        }, {
            rating?: number | undefined;
            name?: string | undefined;
            id?: string | undefined;
            followerCount?: number | undefined;
            shopAgeMonths?: number | undefined;
            badges?: string[] | undefined;
        }>>;
        images: z.ZodArray<z.ZodString, "many">;
        videos: z.ZodOptional<z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            type: z.ZodOptional<z.ZodEnum<["demo", "creator_review", "live_replay", "ugc"]>>;
            views: z.ZodOptional<z.ZodNumber>;
            likes: z.ZodOptional<z.ZodNumber>;
            evidenceId: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            url: string;
            type?: "demo" | "creator_review" | "live_replay" | "ugc" | undefined;
            views?: number | undefined;
            likes?: number | undefined;
            evidenceId?: string | undefined;
        }, {
            url: string;
            type?: "demo" | "creator_review" | "live_replay" | "ugc" | undefined;
            views?: number | undefined;
            likes?: number | undefined;
            evidenceId?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        images: string[];
        canonicalUrl: string;
        brand?: string | undefined;
        category?: string | undefined;
        attributes?: Record<string, string | number | boolean> | undefined;
        seller?: {
            rating?: number | undefined;
            name?: string | undefined;
            id?: string | undefined;
            followerCount?: number | undefined;
            shopAgeMonths?: number | undefined;
            badges?: string[] | undefined;
        } | undefined;
        videos?: {
            url: string;
            type?: "demo" | "creator_review" | "live_replay" | "ugc" | undefined;
            views?: number | undefined;
            likes?: number | undefined;
            evidenceId?: string | undefined;
        }[] | undefined;
    }, {
        title: string;
        images: string[];
        canonicalUrl: string;
        brand?: string | undefined;
        category?: string | undefined;
        attributes?: Record<string, string | number | boolean> | undefined;
        seller?: {
            rating?: number | undefined;
            name?: string | undefined;
            id?: string | undefined;
            followerCount?: number | undefined;
            shopAgeMonths?: number | undefined;
            badges?: string[] | undefined;
        } | undefined;
        videos?: {
            url: string;
            type?: "demo" | "creator_review" | "live_replay" | "ugc" | undefined;
            views?: number | undefined;
            likes?: number | undefined;
            evidenceId?: string | undefined;
        }[] | undefined;
    }>;
    pricing: z.ZodOptional<z.ZodObject<{
        currentPrice: z.ZodOptional<z.ZodNumber>;
        originalPrice: z.ZodOptional<z.ZodNumber>;
        currency: z.ZodOptional<z.ZodString>;
        discountPct: z.ZodOptional<z.ZodNumber>;
        priceHistory: z.ZodOptional<z.ZodArray<z.ZodObject<{
            date: z.ZodString;
            price: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            price: number;
            date: string;
        }, {
            price: number;
            date: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        currency?: string | undefined;
        originalPrice?: number | undefined;
        currentPrice?: number | undefined;
        discountPct?: number | undefined;
        priceHistory?: {
            price: number;
            date: string;
        }[] | undefined;
    }, {
        currency?: string | undefined;
        originalPrice?: number | undefined;
        currentPrice?: number | undefined;
        discountPct?: number | undefined;
        priceHistory?: {
            price: number;
            date: string;
        }[] | undefined;
    }>>;
    availability: z.ZodOptional<z.ZodObject<{
        stockStatus: z.ZodOptional<z.ZodEnum<["in_stock", "low_stock", "out_of_stock", "preorder", "unknown"]>>;
        stockCount: z.ZodOptional<z.ZodNumber>;
        shipFrom: z.ZodOptional<z.ZodString>;
        shippingOptions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            carrier: z.ZodOptional<z.ZodString>;
            etaDays: z.ZodOptional<z.ZodNumber>;
            fee: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            carrier?: string | undefined;
            etaDays?: number | undefined;
            fee?: number | undefined;
        }, {
            carrier?: string | undefined;
            etaDays?: number | undefined;
            fee?: number | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        stockStatus?: "unknown" | "in_stock" | "low_stock" | "out_of_stock" | "preorder" | undefined;
        stockCount?: number | undefined;
        shipFrom?: string | undefined;
        shippingOptions?: {
            carrier?: string | undefined;
            etaDays?: number | undefined;
            fee?: number | undefined;
        }[] | undefined;
    }, {
        stockStatus?: "unknown" | "in_stock" | "low_stock" | "out_of_stock" | "preorder" | undefined;
        stockCount?: number | undefined;
        shipFrom?: string | undefined;
        shippingOptions?: {
            carrier?: string | undefined;
            etaDays?: number | undefined;
            fee?: number | undefined;
        }[] | undefined;
    }>>;
    policies: z.ZodOptional<z.ZodObject<{
        returnPolicy: z.ZodOptional<z.ZodString>;
        returnWindowDays: z.ZodOptional<z.ZodNumber>;
        buyerProtection: z.ZodOptional<z.ZodString>;
        warranty: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        returnPolicy?: string | undefined;
        returnWindowDays?: number | undefined;
        buyerProtection?: string | undefined;
        warranty?: string | undefined;
    }, {
        returnPolicy?: string | undefined;
        returnWindowDays?: number | undefined;
        buyerProtection?: string | undefined;
        warranty?: string | undefined;
    }>>;
    socialProof: z.ZodOptional<z.ZodObject<{
        ratingAvg: z.ZodOptional<z.ZodNumber>;
        ratingCount: z.ZodOptional<z.ZodNumber>;
        ratingBreakdown: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        qnaCount: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        ratingAvg?: number | undefined;
        ratingCount?: number | undefined;
        ratingBreakdown?: Record<string, number> | undefined;
        qnaCount?: number | undefined;
    }, {
        ratingAvg?: number | undefined;
        ratingCount?: number | undefined;
        ratingBreakdown?: Record<string, number> | undefined;
        qnaCount?: number | undefined;
    }>>;
    reviews: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        author: z.ZodOptional<z.ZodString>;
        rating: z.ZodNumber;
        text: z.ZodString;
        pros: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        cons: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        media: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        helpfulCount: z.ZodOptional<z.ZodNumber>;
        verifiedPurchase: z.ZodOptional<z.ZodBoolean>;
        language: z.ZodOptional<z.ZodString>;
        date: z.ZodString;
        source: z.ZodEnum<["platform", "tiktok_video", "external", "unknown"]>;
        evidenceId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        source: "unknown" | "platform" | "tiktok_video" | "external";
        rating: number;
        text: string;
        date: string;
        id: string;
        evidenceId: string;
        pros?: string[] | undefined;
        cons?: string[] | undefined;
        author?: string | undefined;
        media?: string[] | undefined;
        helpfulCount?: number | undefined;
        verifiedPurchase?: boolean | undefined;
        language?: string | undefined;
    }, {
        source: "unknown" | "platform" | "tiktok_video" | "external";
        rating: number;
        text: string;
        date: string;
        id: string;
        evidenceId: string;
        pros?: string[] | undefined;
        cons?: string[] | undefined;
        author?: string | undefined;
        media?: string[] | undefined;
        helpfulCount?: number | undefined;
        verifiedPurchase?: boolean | undefined;
        language?: string | undefined;
    }>, "many">;
    reviewSummary: z.ZodOptional<z.ZodObject<{
        topPros: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        topCons: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        topics: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            sentiment: z.ZodOptional<z.ZodEnum<["positive", "neutral", "negative"]>>;
            supportCount: z.ZodOptional<z.ZodNumber>;
            confidence: z.ZodOptional<z.ZodNumber>;
            evidenceIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            confidence?: number | undefined;
            sentiment?: "positive" | "negative" | "neutral" | undefined;
            supportCount?: number | undefined;
            evidenceIds?: string[] | undefined;
        }, {
            name: string;
            confidence?: number | undefined;
            sentiment?: "positive" | "negative" | "neutral" | undefined;
            supportCount?: number | undefined;
            evidenceIds?: string[] | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        topPros?: string[] | undefined;
        topCons?: string[] | undefined;
        topics?: {
            name: string;
            confidence?: number | undefined;
            sentiment?: "positive" | "negative" | "neutral" | undefined;
            supportCount?: number | undefined;
            evidenceIds?: string[] | undefined;
        }[] | undefined;
    }, {
        topPros?: string[] | undefined;
        topCons?: string[] | undefined;
        topics?: {
            name: string;
            confidence?: number | undefined;
            sentiment?: "positive" | "negative" | "neutral" | undefined;
            supportCount?: number | undefined;
            evidenceIds?: string[] | undefined;
        }[] | undefined;
    }>>;
    psychology: z.ZodOptional<z.ZodObject<{
        buyerDecisionScorecard: z.ZodOptional<z.ZodObject<{
            trust: z.ZodOptional<z.ZodNumber>;
            evidence: z.ZodOptional<z.ZodNumber>;
            riskReversal: z.ZodOptional<z.ZodNumber>;
            easeToBuy: z.ZodOptional<z.ZodNumber>;
            urgency: z.ZodOptional<z.ZodNumber>;
            total: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            trust?: number | undefined;
            evidence?: number | undefined;
            riskReversal?: number | undefined;
            easeToBuy?: number | undefined;
            urgency?: number | undefined;
            total?: number | undefined;
        }, {
            trust?: number | undefined;
            evidence?: number | undefined;
            riskReversal?: number | undefined;
            easeToBuy?: number | undefined;
            urgency?: number | undefined;
            total?: number | undefined;
        }>>;
        factors: z.ZodOptional<z.ZodObject<{
            socialProofStrength: z.ZodOptional<z.ZodNumber>;
            lossAversionMitigation: z.ZodOptional<z.ZodNumber>;
            ambiguityMitigation: z.ZodOptional<z.ZodNumber>;
            urgencyScarcity: z.ZodOptional<z.ZodNumber>;
            abilityFriction: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            socialProofStrength?: number | undefined;
            lossAversionMitigation?: number | undefined;
            ambiguityMitigation?: number | undefined;
            urgencyScarcity?: number | undefined;
            abilityFriction?: number | undefined;
        }, {
            socialProofStrength?: number | undefined;
            lossAversionMitigation?: number | undefined;
            ambiguityMitigation?: number | undefined;
            urgencyScarcity?: number | undefined;
            abilityFriction?: number | undefined;
        }>>;
        notes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        buyerDecisionScorecard?: {
            trust?: number | undefined;
            evidence?: number | undefined;
            riskReversal?: number | undefined;
            easeToBuy?: number | undefined;
            urgency?: number | undefined;
            total?: number | undefined;
        } | undefined;
        factors?: {
            socialProofStrength?: number | undefined;
            lossAversionMitigation?: number | undefined;
            ambiguityMitigation?: number | undefined;
            urgencyScarcity?: number | undefined;
            abilityFriction?: number | undefined;
        } | undefined;
        notes?: string[] | undefined;
    }, {
        buyerDecisionScorecard?: {
            trust?: number | undefined;
            evidence?: number | undefined;
            riskReversal?: number | undefined;
            easeToBuy?: number | undefined;
            urgency?: number | undefined;
            total?: number | undefined;
        } | undefined;
        factors?: {
            socialProofStrength?: number | undefined;
            lossAversionMitigation?: number | undefined;
            ambiguityMitigation?: number | undefined;
            urgencyScarcity?: number | undefined;
            abilityFriction?: number | undefined;
        } | undefined;
        notes?: string[] | undefined;
    }>>;
    aiAnalysis: z.ZodObject<{
        verdict: z.ZodEnum<["buy", "consider", "hold", "avoid"]>;
        confidence: z.ZodNumber;
        reasons: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        claims: z.ZodOptional<z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodOptional<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>>, z.ZodOptional<z.ZodArray<z.ZodAny, "many">>, z.ZodNull]>;
            confidence: z.ZodOptional<z.ZodNumber>;
            evidenceId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            label: string;
            evidenceId: string;
            confidence?: number | undefined;
            value?: string | number | boolean | any[] | {} | null | undefined;
        }, {
            label: string;
            evidenceId: string;
            confidence?: number | undefined;
            value?: string | number | boolean | any[] | {} | null | undefined;
        }>, "many">>;
        citations: z.ZodArray<z.ZodObject<{
            evidenceId: z.ZodString;
            note: z.ZodOptional<z.ZodString>;
            reliability: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            evidenceId: string;
            note?: string | undefined;
            reliability?: number | undefined;
        }, {
            evidenceId: string;
            note?: string | undefined;
            reliability?: number | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        confidence: number;
        verdict: "buy" | "consider" | "avoid" | "hold";
        citations: {
            evidenceId: string;
            note?: string | undefined;
            reliability?: number | undefined;
        }[];
        reasons?: string[] | undefined;
        claims?: {
            label: string;
            evidenceId: string;
            confidence?: number | undefined;
            value?: string | number | boolean | any[] | {} | null | undefined;
        }[] | undefined;
    }, {
        confidence: number;
        verdict: "buy" | "consider" | "avoid" | "hold";
        citations: {
            evidenceId: string;
            note?: string | undefined;
            reliability?: number | undefined;
        }[];
        reasons?: string[] | undefined;
        claims?: {
            label: string;
            evidenceId: string;
            confidence?: number | undefined;
            value?: string | number | boolean | any[] | {} | null | undefined;
        }[] | undefined;
    }>;
    evidence: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["productPage", "review", "creatorVideo", "live", "qna", "shopPolicy", "externalPage"]>;
        url: z.ZodString;
        reliability: z.ZodOptional<z.ZodNumber>;
        freshnessDays: z.ZodOptional<z.ZodNumber>;
        scrapedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        type: "review" | "productPage" | "creatorVideo" | "live" | "qna" | "shopPolicy" | "externalPage";
        id: string;
        scrapedAt: string;
        reliability?: number | undefined;
        freshnessDays?: number | undefined;
    }, {
        url: string;
        type: "review" | "productPage" | "creatorVideo" | "live" | "qna" | "shopPolicy" | "externalPage";
        id: string;
        scrapedAt: string;
        reliability?: number | undefined;
        freshnessDays?: number | undefined;
    }>, "many">;
    system: z.ZodOptional<z.ZodObject<{
        llm: z.ZodOptional<z.ZodString>;
        llmVersion: z.ZodOptional<z.ZodString>;
        latencyMs: z.ZodOptional<z.ZodNumber>;
        warnings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        llm?: string | undefined;
        llmVersion?: string | undefined;
        latencyMs?: number | undefined;
        warnings?: string[] | undefined;
    }, {
        llm?: string | undefined;
        llmVersion?: string | undefined;
        latencyMs?: number | undefined;
        warnings?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    product: {
        title: string;
        images: string[];
        canonicalUrl: string;
        brand?: string | undefined;
        category?: string | undefined;
        attributes?: Record<string, string | number | boolean> | undefined;
        seller?: {
            rating?: number | undefined;
            name?: string | undefined;
            id?: string | undefined;
            followerCount?: number | undefined;
            shopAgeMonths?: number | undefined;
            badges?: string[] | undefined;
        } | undefined;
        videos?: {
            url: string;
            type?: "demo" | "creator_review" | "live_replay" | "ugc" | undefined;
            views?: number | undefined;
            likes?: number | undefined;
            evidenceId?: string | undefined;
        }[] | undefined;
    };
    reviews: {
        source: "unknown" | "platform" | "tiktok_video" | "external";
        rating: number;
        text: string;
        date: string;
        id: string;
        evidenceId: string;
        pros?: string[] | undefined;
        cons?: string[] | undefined;
        author?: string | undefined;
        media?: string[] | undefined;
        helpfulCount?: number | undefined;
        verifiedPurchase?: boolean | undefined;
        language?: string | undefined;
    }[];
    meta: {
        locale: string;
        productId: string;
        currency: string;
        platform: "tiktok" | "shopee" | "lazada" | "other";
        timestamp: string;
        sourceUrl: string;
    };
    schemaVersion: string;
    evidence: {
        url: string;
        type: "review" | "productPage" | "creatorVideo" | "live" | "qna" | "shopPolicy" | "externalPage";
        id: string;
        scrapedAt: string;
        reliability?: number | undefined;
        freshnessDays?: number | undefined;
    }[];
    aiAnalysis: {
        confidence: number;
        verdict: "buy" | "consider" | "avoid" | "hold";
        citations: {
            evidenceId: string;
            note?: string | undefined;
            reliability?: number | undefined;
        }[];
        reasons?: string[] | undefined;
        claims?: {
            label: string;
            evidenceId: string;
            confidence?: number | undefined;
            value?: string | number | boolean | any[] | {} | null | undefined;
        }[] | undefined;
    };
    pricing?: {
        currency?: string | undefined;
        originalPrice?: number | undefined;
        currentPrice?: number | undefined;
        discountPct?: number | undefined;
        priceHistory?: {
            price: number;
            date: string;
        }[] | undefined;
    } | undefined;
    availability?: {
        stockStatus?: "unknown" | "in_stock" | "low_stock" | "out_of_stock" | "preorder" | undefined;
        stockCount?: number | undefined;
        shipFrom?: string | undefined;
        shippingOptions?: {
            carrier?: string | undefined;
            etaDays?: number | undefined;
            fee?: number | undefined;
        }[] | undefined;
    } | undefined;
    policies?: {
        returnPolicy?: string | undefined;
        returnWindowDays?: number | undefined;
        buyerProtection?: string | undefined;
        warranty?: string | undefined;
    } | undefined;
    socialProof?: {
        ratingAvg?: number | undefined;
        ratingCount?: number | undefined;
        ratingBreakdown?: Record<string, number> | undefined;
        qnaCount?: number | undefined;
    } | undefined;
    reviewSummary?: {
        topPros?: string[] | undefined;
        topCons?: string[] | undefined;
        topics?: {
            name: string;
            confidence?: number | undefined;
            sentiment?: "positive" | "negative" | "neutral" | undefined;
            supportCount?: number | undefined;
            evidenceIds?: string[] | undefined;
        }[] | undefined;
    } | undefined;
    psychology?: {
        buyerDecisionScorecard?: {
            trust?: number | undefined;
            evidence?: number | undefined;
            riskReversal?: number | undefined;
            easeToBuy?: number | undefined;
            urgency?: number | undefined;
            total?: number | undefined;
        } | undefined;
        factors?: {
            socialProofStrength?: number | undefined;
            lossAversionMitigation?: number | undefined;
            ambiguityMitigation?: number | undefined;
            urgencyScarcity?: number | undefined;
            abilityFriction?: number | undefined;
        } | undefined;
        notes?: string[] | undefined;
    } | undefined;
    system?: {
        llm?: string | undefined;
        llmVersion?: string | undefined;
        latencyMs?: number | undefined;
        warnings?: string[] | undefined;
    } | undefined;
}, {
    product: {
        title: string;
        images: string[];
        canonicalUrl: string;
        brand?: string | undefined;
        category?: string | undefined;
        attributes?: Record<string, string | number | boolean> | undefined;
        seller?: {
            rating?: number | undefined;
            name?: string | undefined;
            id?: string | undefined;
            followerCount?: number | undefined;
            shopAgeMonths?: number | undefined;
            badges?: string[] | undefined;
        } | undefined;
        videos?: {
            url: string;
            type?: "demo" | "creator_review" | "live_replay" | "ugc" | undefined;
            views?: number | undefined;
            likes?: number | undefined;
            evidenceId?: string | undefined;
        }[] | undefined;
    };
    reviews: {
        source: "unknown" | "platform" | "tiktok_video" | "external";
        rating: number;
        text: string;
        date: string;
        id: string;
        evidenceId: string;
        pros?: string[] | undefined;
        cons?: string[] | undefined;
        author?: string | undefined;
        media?: string[] | undefined;
        helpfulCount?: number | undefined;
        verifiedPurchase?: boolean | undefined;
        language?: string | undefined;
    }[];
    meta: {
        locale: string;
        productId: string;
        currency: string;
        platform: "tiktok" | "shopee" | "lazada" | "other";
        timestamp: string;
        sourceUrl: string;
    };
    schemaVersion: string;
    evidence: {
        url: string;
        type: "review" | "productPage" | "creatorVideo" | "live" | "qna" | "shopPolicy" | "externalPage";
        id: string;
        scrapedAt: string;
        reliability?: number | undefined;
        freshnessDays?: number | undefined;
    }[];
    aiAnalysis: {
        confidence: number;
        verdict: "buy" | "consider" | "avoid" | "hold";
        citations: {
            evidenceId: string;
            note?: string | undefined;
            reliability?: number | undefined;
        }[];
        reasons?: string[] | undefined;
        claims?: {
            label: string;
            evidenceId: string;
            confidence?: number | undefined;
            value?: string | number | boolean | any[] | {} | null | undefined;
        }[] | undefined;
    };
    pricing?: {
        currency?: string | undefined;
        originalPrice?: number | undefined;
        currentPrice?: number | undefined;
        discountPct?: number | undefined;
        priceHistory?: {
            price: number;
            date: string;
        }[] | undefined;
    } | undefined;
    availability?: {
        stockStatus?: "unknown" | "in_stock" | "low_stock" | "out_of_stock" | "preorder" | undefined;
        stockCount?: number | undefined;
        shipFrom?: string | undefined;
        shippingOptions?: {
            carrier?: string | undefined;
            etaDays?: number | undefined;
            fee?: number | undefined;
        }[] | undefined;
    } | undefined;
    policies?: {
        returnPolicy?: string | undefined;
        returnWindowDays?: number | undefined;
        buyerProtection?: string | undefined;
        warranty?: string | undefined;
    } | undefined;
    socialProof?: {
        ratingAvg?: number | undefined;
        ratingCount?: number | undefined;
        ratingBreakdown?: Record<string, number> | undefined;
        qnaCount?: number | undefined;
    } | undefined;
    reviewSummary?: {
        topPros?: string[] | undefined;
        topCons?: string[] | undefined;
        topics?: {
            name: string;
            confidence?: number | undefined;
            sentiment?: "positive" | "negative" | "neutral" | undefined;
            supportCount?: number | undefined;
            evidenceIds?: string[] | undefined;
        }[] | undefined;
    } | undefined;
    psychology?: {
        buyerDecisionScorecard?: {
            trust?: number | undefined;
            evidence?: number | undefined;
            riskReversal?: number | undefined;
            easeToBuy?: number | undefined;
            urgency?: number | undefined;
            total?: number | undefined;
        } | undefined;
        factors?: {
            socialProofStrength?: number | undefined;
            lossAversionMitigation?: number | undefined;
            ambiguityMitigation?: number | undefined;
            urgencyScarcity?: number | undefined;
            abilityFriction?: number | undefined;
        } | undefined;
        notes?: string[] | undefined;
    } | undefined;
    system?: {
        llm?: string | undefined;
        llmVersion?: string | undefined;
        latencyMs?: number | undefined;
        warnings?: string[] | undefined;
    } | undefined;
}>;
export type CommerceReviewResponse = z.infer<typeof CommerceReviewResponseSchema>;
