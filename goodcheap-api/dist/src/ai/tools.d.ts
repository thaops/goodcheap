export type FetchResult = {
    url: string;
    status: number;
    contentType?: string;
    body: string | Record<string, any> | null;
    robotsAllowed: boolean;
    fetchedAt: string;
};
export declare function fetchUrl(url: string): Promise<FetchResult>;
export type ExtractPriceResult = {
    url: string;
    currency?: string;
    currentPrice: number | null;
    listPrice: number | null;
    evidenceId?: string;
    fetchedAt: string;
};
export declare function extractPrice(url: string): Promise<ExtractPriceResult>;
export type ExtractSpecsResult = {
    url: string;
    specs: Record<string, any> | null;
    evidenceId?: string;
    fetchedAt: string;
};
export declare function extractSpecs(url: string): Promise<ExtractSpecsResult>;
export type SearchReviewsItem = {
    title: string;
    url: string;
    sourceType: 'youtube_review' | 'blog_review' | 'forum' | 'marketplace' | 'other';
};
export declare function searchReviews(query: string): Promise<SearchReviewsItem[]>;
export type YouTubeTranscript = {
    url: string;
    text: string;
    segments?: Array<{
        start: number;
        dur: number;
        text: string;
    }>;
    fetchedAt: string;
};
export declare function youtubeTranscript(url: string): Promise<YouTubeTranscript>;
export declare const search_reviews: typeof searchReviews;
export declare const youtube_transcript: typeof youtubeTranscript;
export declare const extract_specs: typeof extractSpecs;
export declare const extract_price: typeof extractPrice;
