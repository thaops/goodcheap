import { ProductDTO, ReviewItem } from '../types';
export interface ReviewsInterface {
    extractReviews(product: ProductDTO): Promise<ReviewItem[]>;
    extractTikTokMeta(product: ProductDTO): Promise<Partial<ProductDTO>>;
    extractTikTokFromHtml(html: string): Promise<Partial<ProductDTO>>;
}
