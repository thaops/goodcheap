export interface AIInterface {
  enrichAnalysis(data: any): Promise<any>;
  generateSummary(product: any): Promise<string>;
  analyzeReviews(reviews: any[]): Promise<any>;
  /**
   * Tìm các video/bài review trên TikTok liên quan đến sản phẩm
   * Trả về danh sách ReviewItem-like objects (tối thiểu: text, rating?, author, images?, source='tiktok_video')
   */
  searchTikTokReviews(product: any): Promise<any[]>;
  /**
   * Tìm video review trên YouTube liên quan tới sản phẩm.
   * Trả về danh sách ReviewItem-like objects (tối thiểu: text, author, images?, source='youtube_video')
   */
  searchYouTubeReviews(product: any): Promise<any[]>;
}
