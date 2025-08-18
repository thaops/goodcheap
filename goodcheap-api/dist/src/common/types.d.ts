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
    shopName?: string;
    shopId?: string;
    description?: string;
    specs?: Record<string, string>;
    reviewsSample?: Array<{
        id?: string;
        rating?: number;
        text: string;
        images?: string[];
        authorName?: string;
        authorAvatar?: string;
        createdAt?: string;
        helpfulCount?: number;
    }>;
};
export type ReviewItem = {
    id?: string;
    rating?: number;
    text: string;
    images?: string[];
    authorName?: string;
    authorAvatar?: string;
    createdAt?: string;
    helpfulCount?: number;
};
export type AnalysisDTO = {
    goodCheapScore: number;
    pros: string[];
    cons: string[];
    redFlags: string[];
    summary?: string;
    confidence?: number;
    priceBenchmarks?: {
        median?: number;
        low?: number;
        high?: number;
        currency?: string;
    };
    decision?: {
        verdict: 'buy' | 'consider' | 'avoid';
        rationale: string[];
    };
    reviewInsights?: {
        positives: string[];
        negatives: string[];
        commonComplaints?: string[];
    };
    aspects?: Array<{
        name: string;
        pros: string[];
        cons: string[];
        positiveQuotes: string[];
        negativeQuotes: string[];
    }>;
    reviewHighlights?: {
        positive: ReviewItem[];
        negative: ReviewItem[];
    };
};
export type AlternativeItem = {
    title: string;
    price?: number;
    currency?: string;
    score?: number;
    url?: string;
    image?: string;
};
export type ActionsDTO = {
    buyUrl?: string;
    trackPrice?: boolean;
};
export type AnalyzeResponse = {
    product: ProductDTO;
    analysis: AnalysisDTO;
    cautions?: string[];
    alternatives?: AlternativeItem[];
    actions?: ActionsDTO;
};
