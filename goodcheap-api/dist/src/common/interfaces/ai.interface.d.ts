export interface AIInterface {
    enrichAnalysis(data: any): Promise<any>;
    generateSummary(product: any): Promise<string>;
    analyzeReviews(reviews: any[]): Promise<any>;
    searchTikTokReviews(product: any): Promise<any[]>;
    searchYouTubeReviews(product: any): Promise<any[]>;
}
