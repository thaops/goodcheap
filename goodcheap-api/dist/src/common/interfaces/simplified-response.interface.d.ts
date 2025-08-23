export interface SimplifiedAnalyzeResponse {
    product: {
        id: string;
        title: string;
        brand?: string;
        images: string[];
        canonicalUrl: string;
        size?: {
            value: number;
            unit: string;
        };
        category?: string;
    };
    pricing: {
        currentPrice?: number;
        originalPrice?: number;
        currency: string;
        discount?: number;
        priceHistory?: Array<{
            date: string;
            price: number;
        }>;
        availability: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder' | 'unknown';
    };
    reviews: {
        totalCount: number;
        averageRating?: number;
        breakdown?: Record<string, number>;
        items: Array<{
            id: string;
            author?: string;
            rating: number;
            text: string;
            date: string;
            media?: string[];
            source: 'platform' | 'tiktok_video' | 'external' | 'unknown';
            verifiedPurchase?: boolean;
        }>;
    };
    reviewSummary: {
        topPros: string[];
        topCons: string[];
        topics: Array<{
            name: string;
            sentiment: 'positive' | 'neutral' | 'negative';
            mentions: number;
        }>;
        reviewWithMediaPercent: number;
    };
    policies: {
        returnPolicy?: string;
        returnWindowDays?: number;
        warranty?: string;
        cod?: boolean;
        shipping?: {
            minDays?: number;
            maxDays?: number;
            freeThreshold?: number;
        };
    };
    aiAnalysis: {
        verdict: 'buy' | 'consider' | 'hold' | 'avoid' | 'unknown';
        confidence: number;
        reasons: string[];
        overallScore: number;
        trustScore: number;
        evidenceScore: number;
    };
    evidence: {
        productPage: string;
        linkedVideos: Array<{
            id: string;
            title: string;
            author: string;
            url: string;
            views?: number;
            likes?: number;
            thumbnail?: string;
        }>;
        screenshots?: string[];
        reliability: number;
    };
    meta: {
        platform: 'tiktok' | 'shopee' | 'lazada' | 'other';
        locale: string;
        timestamp: string;
        processingTime?: number;
        warnings?: string[];
    };
}
export interface ShopInfo {
    id?: string;
    name?: string;
    isOfficialStore?: boolean;
    rating?: number;
    ratingCount?: number;
    followers?: number;
    responseRate?: number;
    ageDays?: number;
    badges?: string[];
}
export interface AlternativeProduct {
    id: string;
    title: string;
    image?: string;
    price?: number;
    currency?: string;
    score?: number;
    url?: string;
    platform: string;
}
export interface ExtendedAnalyzeResponse extends SimplifiedAnalyzeResponse {
    shop?: ShopInfo;
    alternatives?: AlternativeProduct[];
    actions?: {
        buyUrl?: string;
        trackPrice?: boolean;
    };
}
