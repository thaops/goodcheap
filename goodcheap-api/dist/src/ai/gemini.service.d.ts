import { AIInterface } from '../common/interfaces/ai.interface';
import { ProductDTO } from '../common/types';
export declare class GeminiService implements AIInterface {
    enrichAnalysis(input: any): Promise<any>;
    searchYouTubeReviews(product: ProductDTO): Promise<any[]>;
    generateSummary(product: ProductDTO): Promise<string>;
    analyzeReviews(reviews: any[]): Promise<any>;
    private parseLikeCount;
    private isReviewish;
    private normalizeText;
    private buildProductKeywords;
    private productMatchScore;
    private passesTikTokFilter;
    private prioritizeTikTok;
    private tiktokRecover;
    searchTikTokReviews(product: ProductDTO): Promise<any[]>;
    private sanitizeTextArray;
    private isAllowedVideoUrl;
    private extractYouTubeId;
    private normalizeYouTubeUrl;
    private verifyUrlExists;
    private fetchOEmbed;
    private postValidateVideos;
    private ddgFindTiktokVideos;
    private isVietnamese;
    private isVietnamesePage;
}
