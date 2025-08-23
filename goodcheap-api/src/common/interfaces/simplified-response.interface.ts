/**
 * Simplified Response Interface - Optimized for Frontend
 * Gom nhóm thông tin theo 7 categories chính để dễ sử dụng
 */

export interface SimplifiedAnalyzeResponse {
  // 1. Thông tin cơ bản sản phẩm
  product: {
    id: string;
    title: string;
    brand?: string;
    images: string[];
    canonicalUrl: string;
    size?: {
      value: number;
      unit: string;
    };
    category?: string;
  };

  // 2. Giá & tình trạng
  pricing: {
    currentPrice?: number;
    originalPrice?: number;
    currency: string;
    discount?: number; // % giảm giá
    priceHistory?: Array<{
      date: string;
      price: number;
    }>;
    availability:
      | 'in_stock'
      | 'low_stock'
      | 'out_of_stock'
      | 'preorder'
      | 'unknown';
  };

  // 3. Đánh giá
  reviews: {
    totalCount: number;
    averageRating?: number;
    breakdown?: Record<string, number>; // {"5": 10, "4": 5, "3": 2, "2": 1, "1": 0}
    items: Array<{
      id: string;
      author?: string;
      rating: number;
      text: string;
      date: string;
      media?: string[]; // ảnh/video từ review
      source: 'platform' | 'tiktok_video' | 'external' | 'unknown';
      verifiedPurchase?: boolean;
    }>;
  };

  // 4. Tổng hợp review
  reviewSummary: {
    topPros: string[];
    topCons: string[];
    topics: Array<{
      name: string;
      sentiment: 'positive' | 'neutral' | 'negative';
      mentions: number;
    }>;
    reviewWithMediaPercent: number; // 0-1
  };

  // 5. Chính sách shop/sản phẩm
  policies: {
    returnPolicy?: string;
    returnWindowDays?: number;
    warranty?: string;
    cod?: boolean; // thanh toán khi nhận hàng
    shipping?: {
      minDays?: number;
      maxDays?: number;
      freeThreshold?: number;
    };
  };

  // 6. Phân tích AI
  aiAnalysis: {
    verdict: 'buy' | 'consider' | 'hold' | 'avoid' | 'unknown';
    confidence: number; // 0-100
    reasons: string[];
    overallScore: number; // 0-100
    trustScore: number; // 0-100
    evidenceScore: number; // 0-100
  };

  // 7. Bằng chứng & nguồn
  evidence: {
    productPage: string;
    linkedVideos: Array<{
      id: string;
      title: string;
      author: string;
      url: string;
      views?: number;
      likes?: number;
      thumbnail?: string;
    }>;
    screenshots?: string[];
    reliability: number; // 0-1
  };

  // Meta thông tin
  meta: {
    platform: 'tiktok' | 'shopee' | 'lazada' | 'other';
    locale: string;
    timestamp: string;
    processingTime?: number; // ms
    warnings?: string[];
  };
}

/**
 * Shop Information (có thể tách riêng nếu cần)
 */
export interface ShopInfo {
  id?: string;
  name?: string;
  isOfficialStore?: boolean;
  rating?: number;
  ratingCount?: number;
  followers?: number;
  responseRate?: number; // %
  ageDays?: number;
  badges?: string[];
}

/**
 * Alternative Products (để suggest)
 */
export interface AlternativeProduct {
  id: string;
  title: string;
  image?: string;
  price?: number;
  currency?: string;
  score?: number; // 0-100
  url?: string;
  platform: string;
}

/**
 * Extended Response với shop info và alternatives
 */
export interface ExtendedAnalyzeResponse extends SimplifiedAnalyzeResponse {
  shop?: ShopInfo;
  alternatives?: AlternativeProduct[];
  actions?: {
    buyUrl?: string;
    trackPrice?: boolean;
  };
}
