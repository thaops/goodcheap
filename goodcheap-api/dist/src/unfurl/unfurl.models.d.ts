export declare class ReviewItemModel {
    authorAvatar?: string;
    authorName?: string;
    createdAt?: string;
    helpfulCount?: number;
    id?: string;
    images?: string[];
    rating?: number;
    text: string;
}
export declare class ShippingModel {
    cod?: boolean;
    freeThreshold?: number;
    maxDays?: number;
    minDays?: number;
}
export declare class DebugModel {
    rawHtml?: string | null;
    truncated?: boolean;
    error?: string;
    message?: string;
}
export declare class ProductResponseModel {
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
    returnPolicy?: string;
    returnWindowDays?: number;
    buyerProtection?: string | boolean;
    warranty?: string;
    shipping?: ShippingModel;
    reviewsSample?: ReviewItemModel[];
    _debug?: DebugModel;
}
