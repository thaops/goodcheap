import { ProductDTO, ReviewItem } from '../types';

export interface ReviewsInterface {
  extractReviews(product: ProductDTO): Promise<ReviewItem[]>;
  /**
   * Trích xuất meta từ TikTok PDP/network JSON: price/discountPrice/currency, ratingAvg, reviewCount
   * Không phụ thuộc LLM.
   */
  extractTikTokMeta(product: ProductDTO): Promise<Partial<ProductDTO>>;
}
