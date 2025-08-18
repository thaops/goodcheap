// Minimal response type for validator contracts to avoid coupling
export type CommerceReviewResponse = {
  // Accept various shapes of aiAnalysis from controller/tests
  aiAnalysis?: any;
  analysis?: {
    aspects?: Array<{
      quotes?: Array<{ text: string; evidenceId?: string }>;
      fitFor?: Array<{ text: string; evidenceId?: string }>;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
  // Allow both new schema (array of items) and legacy object shape
  reviews?: Array<{
    id: string;
    author?: string;
    rating: number;
    text: string;
    pros?: string[];
    cons?: string[];
    media?: string[];
    helpfulCount?: number;
    verifiedPurchase?: boolean;
    language?: string;
    date: string;
    source?: string;
    evidenceId?: string;
  }> | {
    topics?: Array<{
      evidenceId?: string;
      reviews?: Array<{ evidenceId?: string }>;
      [key: string]: unknown;
    }>;
    items?: Array<{ evidenceId?: string }>;
  };
  // Add reviewSummary alignment with Zod schema (topics with evidenceIds)
  reviewSummary?: {
    topics?: Array<{
      name?: string;
      evidenceIds?: string[];
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
  evidence: Array<{ id: string; type: string; [key: string]: unknown }>;
  [key: string]: unknown;
};

export interface EvidenceValidatorInterface {
  /**
   * Validates that all evidenceId references in the response are valid
   * @param response The response to validate
   * @returns Array of validation errors
   */
  validateEvidenceReferences(response: CommerceReviewResponse): Array<{path: string; error: string}>;
  
  /**
   * Validates the evidence array for completeness and diversity
   * @param response The response to validate
   * @returns Array of validation errors
   */
  validateEvidenceArray(response: CommerceReviewResponse): Array<{path: string; error: string}>;
  
  /**
   * Performs comprehensive evidence validation
   * @param response The response to validate
   * @returns Validation result with status and errors
   */
  validate(response: CommerceReviewResponse): { 
    isValid: boolean; 
    errors: Array<{path: string; error: string}>; 
    status: 'valid' | 'invalid' | 'partial' 
  };
}
