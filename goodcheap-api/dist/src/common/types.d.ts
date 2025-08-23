export type ProductDTO = {
    finalUrl: string;
    source: 'tiktok' | 'shopee' | 'lazada' | 'other';
    productId?: string;
    title?: string;
    images: string[];
    price?: number;
    currency?: string;
    discountPrice?: number;
    ratingAvg?: number;
    reviewCount?: number;
    ratingBreakdown?: Record<string, number>;
    reviewWithImagesPercent?: number;
    shopName?: string;
    shopId?: string;
    description?: string;
    specs?: Record<string, string>;
    returnPolicy?: string;
    returnWindowDays?: number;
    buyerProtection?: string | boolean;
    warranty?: string;
    shipping?: {
        cod?: boolean;
        freeThreshold?: number;
        maxDays?: number;
        minDays?: number;
    };
    reviewsSample?: Array<{
        authorAvatar?: string;
        authorName?: string;
        createdAt?: string;
        helpfulCount?: number;
        id?: string;
        images?: string[];
        rating?: number;
        text: string;
    }>;
};
export type ReviewItem = {
    authorAvatar?: string;
    authorName?: string;
    createdAt?: string;
    helpfulCount?: number;
    id?: string;
    images?: string[];
    rating?: number;
    text: string;
};
export type AnalysisDTO = {
    aspects?: Array<{
        cons: string[];
        name: string;
        negativeQuotes: string[];
        positiveQuotes: string[];
        pros: string[];
    }>;
    confidence?: number;
    decision?: {
        rationale: string[];
        verdict: 'avoid' | 'buy' | 'consider';
    };
    goodCheapScore: number;
    priceBenchmarks?: {
        currency?: string;
        high?: number;
        low?: number;
        median?: number;
    };
    pros: string[];
    cons: string[];
    redFlags: string[];
    reviewHighlights?: {
        negative: ReviewItem[];
        positive: ReviewItem[];
    };
    reviewInsights?: {
        commonComplaints?: string[];
        negatives: string[];
        positives: string[];
    };
    summary?: string;
};
export type AlternativeItem = {
    currency?: string;
    image?: string;
    price?: number;
    score?: number;
    title: string;
    url?: string;
};
export type ActionsDTO = {
    buyUrl?: string;
    trackPrice?: boolean;
};
export type AnalyzeResponse = {
    actions?: ActionsDTO;
    alternatives?: AlternativeItem[];
    analysis: AnalysisDTO;
    cautions?: string[];
    product: ProductDTO;
};
