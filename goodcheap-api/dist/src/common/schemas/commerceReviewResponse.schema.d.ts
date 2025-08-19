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
        canonicalUrlClean: z.ZodOptional<z.ZodString>;
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
        canonicalUrlClean?: string | undefined;
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
        canonicalUrlClean?: string | undefined;
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
    productNormalization: z.ZodOptional<z.ZodObject<{
        brand: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        line: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        size: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: string;
        }, {
            value: number;
            unit: string;
        }>>>;
        categoryPath: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        gtin: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        variantKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        ingredientHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        line?: string | null | undefined;
        brand?: string | null | undefined;
        size?: {
            value: number;
            unit: string;
        } | null | undefined;
        categoryPath?: string[] | undefined;
        gtin?: string | null | undefined;
        variantKey?: string | null | undefined;
        ingredientHash?: string | null | undefined;
    }, {
        line?: string | null | undefined;
        brand?: string | null | undefined;
        size?: {
            value: number;
            unit: string;
        } | null | undefined;
        categoryPath?: string[] | undefined;
        gtin?: string | null | undefined;
        variantKey?: string | null | undefined;
        ingredientHash?: string | null | undefined;
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
        cod: z.ZodOptional<z.ZodBoolean>;
        shippingTimeDays: z.ZodOptional<z.ZodNumber>;
        freeShipThreshold: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        returnPolicy?: string | undefined;
        returnWindowDays?: number | undefined;
        buyerProtection?: string | undefined;
        warranty?: string | undefined;
        cod?: boolean | undefined;
        shippingTimeDays?: number | undefined;
        freeShipThreshold?: number | undefined;
    }, {
        returnPolicy?: string | undefined;
        returnWindowDays?: number | undefined;
        buyerProtection?: string | undefined;
        warranty?: string | undefined;
        cod?: boolean | undefined;
        shippingTimeDays?: number | undefined;
        freeShipThreshold?: number | undefined;
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
        author?: string | undefined;
        pros?: string[] | undefined;
        cons?: string[] | undefined;
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
        author?: string | undefined;
        pros?: string[] | undefined;
        cons?: string[] | undefined;
        media?: string[] | undefined;
        helpfulCount?: number | undefined;
        verifiedPurchase?: boolean | undefined;
        language?: string | undefined;
    }>, "many">;
    reviewsAggregate: z.ZodOptional<z.ZodObject<{
        count: z.ZodOptional<z.ZodNumber>;
        average: z.ZodOptional<z.ZodNumber>;
        breakdown: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        recentCount30d: z.ZodOptional<z.ZodNumber>;
        verifiedPurchaseRatio: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        count?: number | undefined;
        average?: number | undefined;
        breakdown?: Record<string, number> | undefined;
        recentCount30d?: number | undefined;
        verifiedPurchaseRatio?: number | undefined;
    }, {
        count?: number | undefined;
        average?: number | undefined;
        breakdown?: Record<string, number> | undefined;
        recentCount30d?: number | undefined;
        verifiedPurchaseRatio?: number | undefined;
    }>>;
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
            sentiment?: "positive" | "negative" | "neutral" | undefined;
            supportCount?: number | undefined;
            confidence?: number | undefined;
            evidenceIds?: string[] | undefined;
        }, {
            name: string;
            sentiment?: "positive" | "negative" | "neutral" | undefined;
            supportCount?: number | undefined;
            confidence?: number | undefined;
            evidenceIds?: string[] | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        topPros?: string[] | undefined;
        topCons?: string[] | undefined;
        topics?: {
            name: string;
            sentiment?: "positive" | "negative" | "neutral" | undefined;
            supportCount?: number | undefined;
            confidence?: number | undefined;
            evidenceIds?: string[] | undefined;
        }[] | undefined;
    }, {
        topPros?: string[] | undefined;
        topCons?: string[] | undefined;
        topics?: {
            name: string;
            sentiment?: "positive" | "negative" | "neutral" | undefined;
            supportCount?: number | undefined;
            confidence?: number | undefined;
            evidenceIds?: string[] | undefined;
        }[] | undefined;
    }>>;
    psychologyV2: z.ZodOptional<z.ZodObject<{
        scorecard: z.ZodObject<{
            trust: z.ZodOptional<z.ZodObject<{
                score: z.ZodNumber;
                signals: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                gaps: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            }, {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            }>>;
            evidence: z.ZodOptional<z.ZodObject<{
                score: z.ZodNumber;
                signals: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                gaps: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            }, {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            }>>;
            riskReversal: z.ZodOptional<z.ZodObject<{
                score: z.ZodNumber;
                signals: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                gaps: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            }, {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            }>>;
            easeToBuy: z.ZodOptional<z.ZodObject<{
                score: z.ZodNumber;
                signals: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                gaps: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            }, {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            }>>;
            urgency: z.ZodOptional<z.ZodObject<{
                score: z.ZodNumber;
                signals: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                gaps: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            }, {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            }>>;
            total: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            trust?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            evidence?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            riskReversal?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            easeToBuy?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            urgency?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            total?: number | undefined;
        }, {
            trust?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            evidence?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            riskReversal?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            easeToBuy?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            urgency?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            total?: number | undefined;
        }>;
        flags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        scorecard: {
            trust?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            evidence?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            riskReversal?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            easeToBuy?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            urgency?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            total?: number | undefined;
        };
        flags?: string[] | undefined;
    }, {
        scorecard: {
            trust?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            evidence?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            riskReversal?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            easeToBuy?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            urgency?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            total?: number | undefined;
        };
        flags?: string[] | undefined;
    }>>;
    aiAnalysis: z.ZodObject<{
        verdict: z.ZodEnum<["buy", "consider", "hold", "avoid", "unknown"]>;
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
            value?: string | number | boolean | any[] | {} | null | undefined;
            confidence?: number | undefined;
        }, {
            label: string;
            evidenceId: string;
            value?: string | number | boolean | any[] | {} | null | undefined;
            confidence?: number | undefined;
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
        verdict: "buy" | "consider" | "avoid" | "unknown" | "hold";
        citations: {
            evidenceId: string;
            note?: string | undefined;
            reliability?: number | undefined;
        }[];
        reasons?: string[] | undefined;
        claims?: {
            label: string;
            evidenceId: string;
            value?: string | number | boolean | any[] | {} | null | undefined;
            confidence?: number | undefined;
        }[] | undefined;
    }, {
        confidence: number;
        verdict: "buy" | "consider" | "avoid" | "unknown" | "hold";
        citations: {
            evidenceId: string;
            note?: string | undefined;
            reliability?: number | undefined;
        }[];
        reasons?: string[] | undefined;
        claims?: {
            label: string;
            evidenceId: string;
            value?: string | number | boolean | any[] | {} | null | undefined;
            confidence?: number | undefined;
        }[] | undefined;
    }>;
    aiDecision: z.ZodOptional<z.ZodObject<{
        verdict: z.ZodEnum<["buy", "consider", "avoid", "unknown"]>;
        confidence: z.ZodOptional<z.ZodNumber>;
        reasons: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            weight: z.ZodOptional<z.ZodNumber>;
            detail: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            detail?: string | undefined;
            weight?: number | undefined;
        }, {
            id: string;
            detail?: string | undefined;
            weight?: number | undefined;
        }>, "many">>;
        whatToCollectNext: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        verdict: "buy" | "consider" | "avoid" | "unknown";
        confidence?: number | undefined;
        reasons?: {
            id: string;
            detail?: string | undefined;
            weight?: number | undefined;
        }[] | undefined;
        whatToCollectNext?: string[] | undefined;
    }, {
        verdict: "buy" | "consider" | "avoid" | "unknown";
        confidence?: number | undefined;
        reasons?: {
            id: string;
            detail?: string | undefined;
            weight?: number | undefined;
        }[] | undefined;
        whatToCollectNext?: string[] | undefined;
    }>>;
    evidencePolicy: z.ZodOptional<z.ZodObject<{
        countUnlinked: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        countUnlinked: boolean;
    }, {
        countUnlinked: boolean;
    }>>;
    evidence: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["productPage", "review", "creatorVideo", "live", "qna", "shopPolicy", "externalPage"]>;
        url: z.ZodOptional<z.ZodString>;
        reliability: z.ZodOptional<z.ZodNumber>;
        freshnessDays: z.ZodOptional<z.ZodNumber>;
        scrapedAt: z.ZodOptional<z.ZodString>;
        source: z.ZodOptional<z.ZodObject<{
            platform: z.ZodString;
            type: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            platform: string;
            type?: string | undefined;
        }, {
            platform: string;
            type?: string | undefined;
        }>>;
        title: z.ZodOptional<z.ZodString>;
        lang: z.ZodOptional<z.ZodString>;
        publishedAt: z.ZodOptional<z.ZodString>;
        engagement: z.ZodOptional<z.ZodObject<{
            views: z.ZodOptional<z.ZodNumber>;
            likes: z.ZodOptional<z.ZodNumber>;
            comments: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            views?: number | undefined;
            likes?: number | undefined;
            comments?: number | undefined;
        }, {
            views?: number | undefined;
            likes?: number | undefined;
            comments?: number | undefined;
        }>>;
        author: z.ZodOptional<z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            channelSubs: z.ZodOptional<z.ZodNumber>;
            verified: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            name?: string | undefined;
            channelSubs?: number | undefined;
            verified?: boolean | undefined;
        }, {
            name?: string | undefined;
            channelSubs?: number | undefined;
            verified?: boolean | undefined;
        }>>;
        linkedToProduct: z.ZodOptional<z.ZodBoolean>;
        relevanceScore: z.ZodOptional<z.ZodNumber>;
        claims: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        sentiment: z.ZodOptional<z.ZodObject<{
            polarity: z.ZodOptional<z.ZodEnum<["pos", "neu", "neg"]>>;
            score: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            score?: number | undefined;
            polarity?: "pos" | "neu" | "neg" | undefined;
        }, {
            score?: number | undefined;
            polarity?: "pos" | "neu" | "neg" | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "review" | "productPage" | "creatorVideo" | "live" | "qna" | "shopPolicy" | "externalPage";
        id: string;
        source?: {
            platform: string;
            type?: string | undefined;
        } | undefined;
        title?: string | undefined;
        url?: string | undefined;
        author?: {
            name?: string | undefined;
            channelSubs?: number | undefined;
            verified?: boolean | undefined;
        } | undefined;
        sentiment?: {
            score?: number | undefined;
            polarity?: "pos" | "neu" | "neg" | undefined;
        } | undefined;
        claims?: string[] | undefined;
        reliability?: number | undefined;
        freshnessDays?: number | undefined;
        scrapedAt?: string | undefined;
        lang?: string | undefined;
        publishedAt?: string | undefined;
        engagement?: {
            views?: number | undefined;
            likes?: number | undefined;
            comments?: number | undefined;
        } | undefined;
        linkedToProduct?: boolean | undefined;
        relevanceScore?: number | undefined;
    }, {
        type: "review" | "productPage" | "creatorVideo" | "live" | "qna" | "shopPolicy" | "externalPage";
        id: string;
        source?: {
            platform: string;
            type?: string | undefined;
        } | undefined;
        title?: string | undefined;
        url?: string | undefined;
        author?: {
            name?: string | undefined;
            channelSubs?: number | undefined;
            verified?: boolean | undefined;
        } | undefined;
        sentiment?: {
            score?: number | undefined;
            polarity?: "pos" | "neu" | "neg" | undefined;
        } | undefined;
        claims?: string[] | undefined;
        reliability?: number | undefined;
        freshnessDays?: number | undefined;
        scrapedAt?: string | undefined;
        lang?: string | undefined;
        publishedAt?: string | undefined;
        engagement?: {
            views?: number | undefined;
            likes?: number | undefined;
            comments?: number | undefined;
        } | undefined;
        linkedToProduct?: boolean | undefined;
        relevanceScore?: number | undefined;
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
    marketplace: z.ZodOptional<z.ZodObject<{
        shop: z.ZodOptional<z.ZodObject<{
            shopId: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
            isOfficialStore: z.ZodOptional<z.ZodBoolean>;
            ratings: z.ZodOptional<z.ZodObject<{
                avg: z.ZodOptional<z.ZodNumber>;
                count: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                count?: number | undefined;
                avg?: number | undefined;
            }, {
                count?: number | undefined;
                avg?: number | undefined;
            }>>;
            rating: z.ZodOptional<z.ZodNumber>;
            followers: z.ZodOptional<z.ZodNumber>;
            responseRate: z.ZodOptional<z.ZodNumber>;
            ageDays: z.ZodOptional<z.ZodNumber>;
            badges: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            shopId?: string | undefined;
            rating?: number | undefined;
            name?: string | undefined;
            badges?: string[] | undefined;
            isOfficialStore?: boolean | undefined;
            ratings?: {
                count?: number | undefined;
                avg?: number | undefined;
            } | undefined;
            followers?: number | undefined;
            responseRate?: number | undefined;
            ageDays?: number | undefined;
        }, {
            shopId?: string | undefined;
            rating?: number | undefined;
            name?: string | undefined;
            badges?: string[] | undefined;
            isOfficialStore?: boolean | undefined;
            ratings?: {
                count?: number | undefined;
                avg?: number | undefined;
            } | undefined;
            followers?: number | undefined;
            responseRate?: number | undefined;
            ageDays?: number | undefined;
        }>>;
        product: z.ZodOptional<z.ZodObject<{
            ratingAvg: z.ZodOptional<z.ZodNumber>;
            ratingCount: z.ZodOptional<z.ZodNumber>;
            soldCount: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
            ratingDist: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
            qaCount: z.ZodOptional<z.ZodNumber>;
            returnPolicy: z.ZodOptional<z.ZodString>;
            warranty: z.ZodOptional<z.ZodString>;
            shipping: z.ZodOptional<z.ZodObject<{
                minDays: z.ZodOptional<z.ZodNumber>;
                maxDays: z.ZodOptional<z.ZodNumber>;
                cod: z.ZodOptional<z.ZodBoolean>;
                freeThreshold: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                cod?: boolean | undefined;
                minDays?: number | undefined;
                maxDays?: number | undefined;
                freeThreshold?: number | undefined;
            }, {
                cod?: boolean | undefined;
                minDays?: number | undefined;
                maxDays?: number | undefined;
                freeThreshold?: number | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            ratingAvg?: number | undefined;
            returnPolicy?: string | undefined;
            warranty?: string | undefined;
            ratingCount?: number | undefined;
            soldCount?: string | number | undefined;
            ratingDist?: Record<string, number> | undefined;
            qaCount?: number | undefined;
            shipping?: {
                cod?: boolean | undefined;
                minDays?: number | undefined;
                maxDays?: number | undefined;
                freeThreshold?: number | undefined;
            } | undefined;
        }, {
            ratingAvg?: number | undefined;
            returnPolicy?: string | undefined;
            warranty?: string | undefined;
            ratingCount?: number | undefined;
            soldCount?: string | number | undefined;
            ratingDist?: Record<string, number> | undefined;
            qaCount?: number | undefined;
            shipping?: {
                cod?: boolean | undefined;
                minDays?: number | undefined;
                maxDays?: number | undefined;
                freeThreshold?: number | undefined;
            } | undefined;
        }>>;
        price: z.ZodOptional<z.ZodObject<{
            list: z.ZodOptional<z.ZodNumber>;
            sale: z.ZodOptional<z.ZodNumber>;
            currency: z.ZodOptional<z.ZodString>;
            per_100ml: z.ZodOptional<z.ZodNumber>;
            per_100g: z.ZodOptional<z.ZodNumber>;
            history: z.ZodOptional<z.ZodArray<z.ZodObject<{
                date: z.ZodString;
                price: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                price: number;
                date: string;
            }, {
                price: number;
                date: string;
            }>, "many">>;
            current: z.ZodOptional<z.ZodNumber>;
            original: z.ZodOptional<z.ZodNumber>;
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
            updatedAt: z.ZodOptional<z.ZodString>;
            discountPct: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            currency?: string | undefined;
            min?: number | undefined;
            max?: number | undefined;
            list?: number | undefined;
            sale?: number | undefined;
            per_100ml?: number | undefined;
            per_100g?: number | undefined;
            history?: {
                price: number;
                date: string;
            }[] | undefined;
            current?: number | undefined;
            original?: number | undefined;
            updatedAt?: string | undefined;
            discountPct?: number | undefined;
        }, {
            currency?: string | undefined;
            min?: number | undefined;
            max?: number | undefined;
            list?: number | undefined;
            sale?: number | undefined;
            per_100ml?: number | undefined;
            per_100g?: number | undefined;
            history?: {
                price: number;
                date: string;
            }[] | undefined;
            current?: number | undefined;
            original?: number | undefined;
            updatedAt?: string | undefined;
            discountPct?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        price?: {
            currency?: string | undefined;
            min?: number | undefined;
            max?: number | undefined;
            list?: number | undefined;
            sale?: number | undefined;
            per_100ml?: number | undefined;
            per_100g?: number | undefined;
            history?: {
                price: number;
                date: string;
            }[] | undefined;
            current?: number | undefined;
            original?: number | undefined;
            updatedAt?: string | undefined;
            discountPct?: number | undefined;
        } | undefined;
        product?: {
            ratingAvg?: number | undefined;
            returnPolicy?: string | undefined;
            warranty?: string | undefined;
            ratingCount?: number | undefined;
            soldCount?: string | number | undefined;
            ratingDist?: Record<string, number> | undefined;
            qaCount?: number | undefined;
            shipping?: {
                cod?: boolean | undefined;
                minDays?: number | undefined;
                maxDays?: number | undefined;
                freeThreshold?: number | undefined;
            } | undefined;
        } | undefined;
        shop?: {
            shopId?: string | undefined;
            rating?: number | undefined;
            name?: string | undefined;
            badges?: string[] | undefined;
            isOfficialStore?: boolean | undefined;
            ratings?: {
                count?: number | undefined;
                avg?: number | undefined;
            } | undefined;
            followers?: number | undefined;
            responseRate?: number | undefined;
            ageDays?: number | undefined;
        } | undefined;
    }, {
        price?: {
            currency?: string | undefined;
            min?: number | undefined;
            max?: number | undefined;
            list?: number | undefined;
            sale?: number | undefined;
            per_100ml?: number | undefined;
            per_100g?: number | undefined;
            history?: {
                price: number;
                date: string;
            }[] | undefined;
            current?: number | undefined;
            original?: number | undefined;
            updatedAt?: string | undefined;
            discountPct?: number | undefined;
        } | undefined;
        product?: {
            ratingAvg?: number | undefined;
            returnPolicy?: string | undefined;
            warranty?: string | undefined;
            ratingCount?: number | undefined;
            soldCount?: string | number | undefined;
            ratingDist?: Record<string, number> | undefined;
            qaCount?: number | undefined;
            shipping?: {
                cod?: boolean | undefined;
                minDays?: number | undefined;
                maxDays?: number | undefined;
                freeThreshold?: number | undefined;
            } | undefined;
        } | undefined;
        shop?: {
            shopId?: string | undefined;
            rating?: number | undefined;
            name?: string | undefined;
            badges?: string[] | undefined;
            isOfficialStore?: boolean | undefined;
            ratings?: {
                count?: number | undefined;
                avg?: number | undefined;
            } | undefined;
            followers?: number | undefined;
            responseRate?: number | undefined;
            ageDays?: number | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    product: {
        title: string;
        images: string[];
        canonicalUrl: string;
        canonicalUrlClean?: string | undefined;
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
        author?: string | undefined;
        pros?: string[] | undefined;
        cons?: string[] | undefined;
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
        type: "review" | "productPage" | "creatorVideo" | "live" | "qna" | "shopPolicy" | "externalPage";
        id: string;
        source?: {
            platform: string;
            type?: string | undefined;
        } | undefined;
        title?: string | undefined;
        url?: string | undefined;
        author?: {
            name?: string | undefined;
            channelSubs?: number | undefined;
            verified?: boolean | undefined;
        } | undefined;
        sentiment?: {
            score?: number | undefined;
            polarity?: "pos" | "neu" | "neg" | undefined;
        } | undefined;
        claims?: string[] | undefined;
        reliability?: number | undefined;
        freshnessDays?: number | undefined;
        scrapedAt?: string | undefined;
        lang?: string | undefined;
        publishedAt?: string | undefined;
        engagement?: {
            views?: number | undefined;
            likes?: number | undefined;
            comments?: number | undefined;
        } | undefined;
        linkedToProduct?: boolean | undefined;
        relevanceScore?: number | undefined;
    }[];
    aiAnalysis: {
        confidence: number;
        verdict: "buy" | "consider" | "avoid" | "unknown" | "hold";
        citations: {
            evidenceId: string;
            note?: string | undefined;
            reliability?: number | undefined;
        }[];
        reasons?: string[] | undefined;
        claims?: {
            label: string;
            evidenceId: string;
            value?: string | number | boolean | any[] | {} | null | undefined;
            confidence?: number | undefined;
        }[] | undefined;
    };
    productNormalization?: {
        line?: string | null | undefined;
        brand?: string | null | undefined;
        size?: {
            value: number;
            unit: string;
        } | null | undefined;
        categoryPath?: string[] | undefined;
        gtin?: string | null | undefined;
        variantKey?: string | null | undefined;
        ingredientHash?: string | null | undefined;
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
        cod?: boolean | undefined;
        shippingTimeDays?: number | undefined;
        freeShipThreshold?: number | undefined;
    } | undefined;
    socialProof?: {
        ratingAvg?: number | undefined;
        ratingCount?: number | undefined;
        ratingBreakdown?: Record<string, number> | undefined;
        qnaCount?: number | undefined;
    } | undefined;
    reviewsAggregate?: {
        count?: number | undefined;
        average?: number | undefined;
        breakdown?: Record<string, number> | undefined;
        recentCount30d?: number | undefined;
        verifiedPurchaseRatio?: number | undefined;
    } | undefined;
    reviewSummary?: {
        topPros?: string[] | undefined;
        topCons?: string[] | undefined;
        topics?: {
            name: string;
            sentiment?: "positive" | "negative" | "neutral" | undefined;
            supportCount?: number | undefined;
            confidence?: number | undefined;
            evidenceIds?: string[] | undefined;
        }[] | undefined;
    } | undefined;
    psychologyV2?: {
        scorecard: {
            trust?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            evidence?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            riskReversal?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            easeToBuy?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            urgency?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            total?: number | undefined;
        };
        flags?: string[] | undefined;
    } | undefined;
    aiDecision?: {
        verdict: "buy" | "consider" | "avoid" | "unknown";
        confidence?: number | undefined;
        reasons?: {
            id: string;
            detail?: string | undefined;
            weight?: number | undefined;
        }[] | undefined;
        whatToCollectNext?: string[] | undefined;
    } | undefined;
    evidencePolicy?: {
        countUnlinked: boolean;
    } | undefined;
    system?: {
        llm?: string | undefined;
        llmVersion?: string | undefined;
        latencyMs?: number | undefined;
        warnings?: string[] | undefined;
    } | undefined;
    marketplace?: {
        price?: {
            currency?: string | undefined;
            min?: number | undefined;
            max?: number | undefined;
            list?: number | undefined;
            sale?: number | undefined;
            per_100ml?: number | undefined;
            per_100g?: number | undefined;
            history?: {
                price: number;
                date: string;
            }[] | undefined;
            current?: number | undefined;
            original?: number | undefined;
            updatedAt?: string | undefined;
            discountPct?: number | undefined;
        } | undefined;
        product?: {
            ratingAvg?: number | undefined;
            returnPolicy?: string | undefined;
            warranty?: string | undefined;
            ratingCount?: number | undefined;
            soldCount?: string | number | undefined;
            ratingDist?: Record<string, number> | undefined;
            qaCount?: number | undefined;
            shipping?: {
                cod?: boolean | undefined;
                minDays?: number | undefined;
                maxDays?: number | undefined;
                freeThreshold?: number | undefined;
            } | undefined;
        } | undefined;
        shop?: {
            shopId?: string | undefined;
            rating?: number | undefined;
            name?: string | undefined;
            badges?: string[] | undefined;
            isOfficialStore?: boolean | undefined;
            ratings?: {
                count?: number | undefined;
                avg?: number | undefined;
            } | undefined;
            followers?: number | undefined;
            responseRate?: number | undefined;
            ageDays?: number | undefined;
        } | undefined;
    } | undefined;
}, {
    product: {
        title: string;
        images: string[];
        canonicalUrl: string;
        canonicalUrlClean?: string | undefined;
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
        author?: string | undefined;
        pros?: string[] | undefined;
        cons?: string[] | undefined;
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
        type: "review" | "productPage" | "creatorVideo" | "live" | "qna" | "shopPolicy" | "externalPage";
        id: string;
        source?: {
            platform: string;
            type?: string | undefined;
        } | undefined;
        title?: string | undefined;
        url?: string | undefined;
        author?: {
            name?: string | undefined;
            channelSubs?: number | undefined;
            verified?: boolean | undefined;
        } | undefined;
        sentiment?: {
            score?: number | undefined;
            polarity?: "pos" | "neu" | "neg" | undefined;
        } | undefined;
        claims?: string[] | undefined;
        reliability?: number | undefined;
        freshnessDays?: number | undefined;
        scrapedAt?: string | undefined;
        lang?: string | undefined;
        publishedAt?: string | undefined;
        engagement?: {
            views?: number | undefined;
            likes?: number | undefined;
            comments?: number | undefined;
        } | undefined;
        linkedToProduct?: boolean | undefined;
        relevanceScore?: number | undefined;
    }[];
    aiAnalysis: {
        confidence: number;
        verdict: "buy" | "consider" | "avoid" | "unknown" | "hold";
        citations: {
            evidenceId: string;
            note?: string | undefined;
            reliability?: number | undefined;
        }[];
        reasons?: string[] | undefined;
        claims?: {
            label: string;
            evidenceId: string;
            value?: string | number | boolean | any[] | {} | null | undefined;
            confidence?: number | undefined;
        }[] | undefined;
    };
    productNormalization?: {
        line?: string | null | undefined;
        brand?: string | null | undefined;
        size?: {
            value: number;
            unit: string;
        } | null | undefined;
        categoryPath?: string[] | undefined;
        gtin?: string | null | undefined;
        variantKey?: string | null | undefined;
        ingredientHash?: string | null | undefined;
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
        cod?: boolean | undefined;
        shippingTimeDays?: number | undefined;
        freeShipThreshold?: number | undefined;
    } | undefined;
    socialProof?: {
        ratingAvg?: number | undefined;
        ratingCount?: number | undefined;
        ratingBreakdown?: Record<string, number> | undefined;
        qnaCount?: number | undefined;
    } | undefined;
    reviewsAggregate?: {
        count?: number | undefined;
        average?: number | undefined;
        breakdown?: Record<string, number> | undefined;
        recentCount30d?: number | undefined;
        verifiedPurchaseRatio?: number | undefined;
    } | undefined;
    reviewSummary?: {
        topPros?: string[] | undefined;
        topCons?: string[] | undefined;
        topics?: {
            name: string;
            sentiment?: "positive" | "negative" | "neutral" | undefined;
            supportCount?: number | undefined;
            confidence?: number | undefined;
            evidenceIds?: string[] | undefined;
        }[] | undefined;
    } | undefined;
    psychologyV2?: {
        scorecard: {
            trust?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            evidence?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            riskReversal?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            easeToBuy?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            urgency?: {
                score: number;
                signals?: string[] | undefined;
                gaps?: string[] | undefined;
            } | undefined;
            total?: number | undefined;
        };
        flags?: string[] | undefined;
    } | undefined;
    aiDecision?: {
        verdict: "buy" | "consider" | "avoid" | "unknown";
        confidence?: number | undefined;
        reasons?: {
            id: string;
            detail?: string | undefined;
            weight?: number | undefined;
        }[] | undefined;
        whatToCollectNext?: string[] | undefined;
    } | undefined;
    evidencePolicy?: {
        countUnlinked: boolean;
    } | undefined;
    system?: {
        llm?: string | undefined;
        llmVersion?: string | undefined;
        latencyMs?: number | undefined;
        warnings?: string[] | undefined;
    } | undefined;
    marketplace?: {
        price?: {
            currency?: string | undefined;
            min?: number | undefined;
            max?: number | undefined;
            list?: number | undefined;
            sale?: number | undefined;
            per_100ml?: number | undefined;
            per_100g?: number | undefined;
            history?: {
                price: number;
                date: string;
            }[] | undefined;
            current?: number | undefined;
            original?: number | undefined;
            updatedAt?: string | undefined;
            discountPct?: number | undefined;
        } | undefined;
        product?: {
            ratingAvg?: number | undefined;
            returnPolicy?: string | undefined;
            warranty?: string | undefined;
            ratingCount?: number | undefined;
            soldCount?: string | number | undefined;
            ratingDist?: Record<string, number> | undefined;
            qaCount?: number | undefined;
            shipping?: {
                cod?: boolean | undefined;
                minDays?: number | undefined;
                maxDays?: number | undefined;
                freeThreshold?: number | undefined;
            } | undefined;
        } | undefined;
        shop?: {
            shopId?: string | undefined;
            rating?: number | undefined;
            name?: string | undefined;
            badges?: string[] | undefined;
            isOfficialStore?: boolean | undefined;
            ratings?: {
                count?: number | undefined;
                avg?: number | undefined;
            } | undefined;
            followers?: number | undefined;
            responseRate?: number | undefined;
            ageDays?: number | undefined;
        } | undefined;
    } | undefined;
}>;
export type CommerceReviewResponse = z.infer<typeof CommerceReviewResponseSchema>;
