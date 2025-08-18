// RAG tool interfaces & light stubs for Gemini tool-calling
// NOTE: Tuân thủ robots và timeout/retry nên thực hiện ở tầng infra/http.
// Ở đây chỉ cung cấp interface và stub fail-soft.

export type FetchResult = {
  url: string;
  status: number;
  contentType?: string;
  body: string | Record<string, any> | null;
  robotsAllowed: boolean;
  fetchedAt: string; // ISO
};

export async function fetchUrl(url: string): Promise<FetchResult> {
  // TODO(verify): implement with got + robots.txt guard
  return {
    url,
    status: 0,
    contentType: undefined,
    body: null,
    robotsAllowed: false,
    fetchedAt: new Date().toISOString(),
  };
}

export type ExtractPriceResult = {
  url: string;
  currency?: string;
  currentPrice: number | null;
  listPrice: number | null;
  evidenceId?: string;
  fetchedAt: string; // ISO
};

export async function extractPrice(url: string): Promise<ExtractPriceResult> {
  // TODO(verify): parse DOM/JSON-LD/OG/meta
  return { url, currentPrice: null, listPrice: null, fetchedAt: new Date().toISOString() };
}

export type ExtractSpecsResult = {
  url: string;
  specs: Record<string, any> | null; // null when unknown
  evidenceId?: string;
  fetchedAt: string; // ISO
};

export async function extractSpecs(url: string): Promise<ExtractSpecsResult> {
  // TODO(verify): parse table/definition lists/JSON-LD
  return { url, specs: null, fetchedAt: new Date().toISOString() };
}

export type SearchReviewsItem = {
  title: string;
  url: string;
  sourceType: 'youtube_review' | 'blog_review' | 'forum' | 'marketplace' | 'other';
};

export async function searchReviews(query: string): Promise<SearchReviewsItem[]> {
  // TODO(verify): use search API; guard SSRF
  return [];
}

export type YouTubeTranscript = {
  url: string;
  text: string;
  segments?: Array<{ start: number; dur: number; text: string }>;
  fetchedAt: string; // ISO
};

export async function youtubeTranscript(url: string): Promise<YouTubeTranscript> {
  // TODO(verify): use YouTube captions API or scraper respecting ToS
  return { url, text: '', segments: [], fetchedAt: new Date().toISOString() };
}

// Aliases (snake_case) to match tool names referenced in prompts/guardrails
export const search_reviews = searchReviews;
export const youtube_transcript = youtubeTranscript;
export const extract_specs = extractSpecs;
export const extract_price = extractPrice;
