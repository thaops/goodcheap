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
  
    shopName?: string;
    shopId?: string;
  
    description?: string;     // dùng cho AI tóm tắt Ưu/Nhược
    specs?: Record<string,string>;
    // Mẫu review để AI phân tích (client có thể gửi kèm)
    reviewsSample?: Array<{
      id?: string;
      rating?: number;       // 1..5
      text: string;          // nội dung review
      images?: string[];     // ảnh do khách đăng
      authorName?: string;
      authorAvatar?: string; // ảnh đại diện khách
      createdAt?: string;    // ISO datetime nếu có
      helpfulCount?: number; // số vote hữu ích
    }>;
  };
  
  export type ReviewItem = {
    id?: string;
    rating?: number;
    text: string;
    images?: string[];
    authorName?: string;
    authorAvatar?: string;
    createdAt?: string;
    helpfulCount?: number;
  };
  
  export type AnalysisDTO = {
    goodCheapScore: number;   // 0..100
    pros: string[];
    cons: string[];
    redFlags: string[];
    // mở rộng để phù hợp UI
    summary?: string;
    confidence?: number;        // 0..1
    priceBenchmarks?: {
      median?: number;
      low?: number;
      high?: number;
      currency?: string;
    };
    // Quyết định nên mua hay không
    decision?: {
      verdict: 'buy' | 'consider' | 'avoid';
      rationale: string[]; // các lý do chính
    };
    // Tóm lược điểm nổi bật từ bài đánh giá
    reviewInsights?: {
      positives: string[];
      negatives: string[];
      commonComplaints?: string[];
    };
    // Phân tích theo khía cạnh với dẫn chứng review
    aspects?: Array<{
      name: string;                 // ví dụ: Chất âm, Pin, Độ bền, Kết nối, Đóng gói, Hậu mãi
      pros: string[];
      cons: string[];
      positiveQuotes: string[];     // trích dẫn tốt từ review
      negativeQuotes: string[];     // trích dẫn xấu từ review
    }>;
    // Các review tiêu biểu (đầy đủ thông tin + ảnh) cho UI hiển thị
    reviewHighlights?: {
      positive: ReviewItem[];
      negative: ReviewItem[];
    };
  };
  
  export type AlternativeItem = {
    title: string;
    price?: number;
    currency?: string;
    score?: number; // 0..100
    url?: string;
    image?: string;
  };
  
  export type ActionsDTO = {
    buyUrl?: string;
    trackPrice?: boolean;
  };
  
  export type AnalyzeResponse = {
    product: ProductDTO;
    analysis: AnalysisDTO;
    cautions?: string[];
    alternatives?: AlternativeItem[];
    actions?: ActionsDTO;
  };