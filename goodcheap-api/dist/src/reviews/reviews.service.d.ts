import { ReviewItem, ProductDTO } from '../common/types';
import { ReviewsInterface } from '../common/interfaces/reviews.interface';
export declare class ReviewsService implements ReviewsInterface {
    private readonly logger;
    private detectSourceFromUrl;
    extractTikTokMeta(product: ProductDTO): Promise<Partial<ProductDTO>>;
    private extractTikTokMetaWithHttp;
    private extractTikTokMetaWithPlaywright;
    extractTikTokFromHtml(html: string): Promise<Partial<ProductDTO>>;
    extractReviews(product: ProductDTO): Promise<ReviewItem[]>;
    private extractTikTokReviews;
    private extractShopeeReviews;
    private extractLazadaReviews;
    private parseRating;
    private scrapeWithPlaywright;
}
