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
    ratingBreakdown?: Record<string, number>;
    reviewWithImagesPercent?: number; // 0..1 (tỉ lệ review có ảnh/video)
  
    shopName?: string;
    shopId?: string;
  
    description?: string;
    specs?: Record<string,string>;

    // Policies
    returnPolicy?: string;
    returnWindowDays?: number;
    buyerProtection?: string | boolean;
    warranty?: string;
    shipping?: {
      cod?: boolean;
      freeThreshold?: number;
      maxDays?: number;
      minDays?: number;
    };
    reviewsSample?: Array<{
      authorAvatar?: string; // ảnh đại diện khách
      authorName?: string;
      createdAt?: string;    // ISO datetime nếu có
      helpfulCount?: number; // số vote hữu ích
      id?: string;
      images?: string[];     // ảnh do khách đăng
      rating?: number;       // 1..5
      text: string;          // nội dung review
    }>;
  };
  
  export type ReviewItem = {
    authorAvatar?: string;
    authorName?: string;
    createdAt?: string;
    helpfulCount?: number;
    id?: string;
    images?: string[];
    rating?: number;
    text: string;
  };
  
  export type AnalysisDTO = {
    aspects?: Array<{
      cons: string[];
      name: string;                 // ví dụ: Chất âm, Pin, Độ bền, Kết nối, Đóng gói, Hậu mãi
      negativeQuotes: string[];     // trích dẫn xấu từ review
      positiveQuotes: string[];     // trích dẫn tốt từ review
      pros: string[];
    }>;
    confidence?: number;        // 0..1
    decision?: {
      rationale: string[]; // các lý do chính
      verdict: 'avoid' | 'buy' | 'consider';
    };
    goodCheapScore: number;   // 0..100
    priceBenchmarks?: {
      currency?: string;
      high?: number;
      low?: number;
      median?: number;
    };
    pros: string[];
    cons: string[];
    redFlags: string[];
    reviewHighlights?: {
      negative: ReviewItem[];
      positive: ReviewItem[];
    };
    reviewInsights?: {
      commonComplaints?: string[];
      negatives: string[];
      positives: string[];
    };
    summary?: string;
  };
  
  export type AlternativeItem = {
    currency?: string;
    image?: string;
    price?: number;
    score?: number; // 0..100
    title: string;
    url?: string;
  };
  
  export type ActionsDTO = {
    buyUrl?: string;
    trackPrice?: boolean;
  };
  
  export type AnalyzeResponse = {
    actions?: ActionsDTO;
    alternatives?: AlternativeItem[];
    analysis: AnalysisDTO;
    cautions?: string[];
    product: ProductDTO;
  };