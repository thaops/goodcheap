import { Injectable } from '@nestjs/common';

// Response type used by EvidenceValidator with permissive index signature
export type CommerceReviewResponse = {
  // Make aiAnalysis permissive to accept different shapes from controller/tests
  aiAnalysis: any;
  analysis?: {
    overallScore?: number;
    verdict?: string;
    reasons?: string[];
    aspects?: Array<{
      name?: string;
      quotes?: Array<{ text: string; evidenceId?: string }>;
      fitFor?: Array<{ text: string; evidenceId?: string }>;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
  // reviews can be either the new schema (array of items) or the legacy object with topics/items
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
      reviews?: Array<{ evidenceId?: string }>
    }>;
    items?: Array<{ evidenceId?: string }>;
  };
  // reviewSummary exists in the new schema and may contain topics with evidenceIds
  reviewSummary?: {
    topics?: Array<{
      name?: string;
      evidenceIds?: string[];
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
  evidence: Array<{ id: string; type: string; source?: string; content?: string; timestamp?: string }>;
  [key: string]: any; // allow additional fields from tests or other schema parts
};

@Injectable()
export class EvidenceValidator {
  /**
   * Validates that all evidenceId references in the response are valid
   * @param response The response to validate
   * @returns Array of validation errors
   */
  validateEvidenceReferences(response: CommerceReviewResponse): Array<{path: string; error: string}> {
    const errors: Array<{path: string; error: string}> = [];
    const evidenceIds = new Set(response.evidence.map(e => e.id));
    
    // Validate aiAnalysis claims have valid evidenceId references
    if (response.aiAnalysis && response.aiAnalysis.pros) {
      response.aiAnalysis.pros.forEach((pro, index) => {
        if (pro.evidenceIds) {
          pro.evidenceIds.forEach((evidenceId, evidenceIndex) => {
            if (!evidenceIds.has(evidenceId)) {
              errors.push({
                path: `aiAnalysis.pros[${index}].evidenceIds[${evidenceIndex}]`,
                error: `Invalid evidenceId reference: ${evidenceId}`
              });
            }
          });
        }
      });
    }
    
    if (response.aiAnalysis && response.aiAnalysis.cons) {
      response.aiAnalysis.cons.forEach((con, index) => {
        if (con.evidenceIds) {
          con.evidenceIds.forEach((evidenceId, evidenceIndex) => {
            if (!evidenceIds.has(evidenceId)) {
              errors.push({
                path: `aiAnalysis.cons[${index}].evidenceIds[${evidenceIndex}]`,
                error: `Invalid evidenceId reference: ${evidenceId}`
              });
            }
          });
        }
      });
    }
    
    // Validate aspects have valid evidenceId references
    if (response.analysis?.aspects) {
      response.analysis.aspects.forEach((aspect, aspectIndex) => {
        // Validate quotes
        if (aspect.quotes) {
          aspect.quotes.forEach((quote, quoteIndex) => {
            if (quote.evidenceId && !evidenceIds.has(quote.evidenceId)) {
              errors.push({
                path: `analysis.aspects[${aspectIndex}].quotes[${quoteIndex}].evidenceId`,
                error: `Invalid evidenceId reference: ${quote.evidenceId}`
              });
            }
          });
        }
        
        // Validate fitFor items
        if (aspect.fitFor) {
          aspect.fitFor.forEach((fitForItem, fitForIndex) => {
            if (fitForItem.evidenceId && !evidenceIds.has(fitForItem.evidenceId)) {
              errors.push({
                path: `analysis.aspects[${aspectIndex}].fitFor[${fitForIndex}].evidenceId`,
                error: `Invalid evidenceId reference: ${fitForItem.evidenceId}`
              });
            }
          });
        }
      });
    }
    
    // Validate review topics have valid evidenceId references
    if (response.reviews && (response as any).reviews.topics) {
      (response as any).reviews.topics.forEach((topic: any, topicIndex: number) => {
        if (topic.evidenceId && !evidenceIds.has(topic.evidenceId)) {
          errors.push({
            path: `reviews.topics[${topicIndex}].evidenceId`,
            error: `Invalid evidenceId reference: ${topic.evidenceId}`
          });
        }
        
        // Validate topic reviews
        if (topic.reviews) {
          topic.reviews.forEach((review: any, reviewIndex: number) => {
            if (review.evidenceId && !evidenceIds.has(review.evidenceId)) {
              errors.push({
                path: `reviews.topics[${topicIndex}].reviews[${reviewIndex}].evidenceId`,
                error: `Invalid evidenceId reference: ${review.evidenceId}`
              });
            }
          });
        }
      });
    }

    // Validate reviewSummary topics (new schema): topics[*].evidenceIds[*]
    if (response.reviewSummary && response.reviewSummary.topics) {
      response.reviewSummary.topics.forEach((topic, topicIndex) => {
        if (Array.isArray(topic.evidenceIds)) {
          topic.evidenceIds.forEach((evidenceId, evidenceIndex) => {
            if (!evidenceIds.has(evidenceId)) {
              errors.push({
                path: `reviewSummary.topics[${topicIndex}].evidenceIds[${evidenceIndex}]`,
                error: `Invalid evidenceId reference: ${evidenceId}`
              });
            }
          });
        }
      });
    }
    
    // Validate review items have valid evidenceId references
    if (response.reviews && (response as any).reviews.items) {
      (response as any).reviews.items.forEach((item: any, itemIndex: number) => {
        if (item.evidenceId && !evidenceIds.has(item.evidenceId)) {
          errors.push({
            path: `reviews.items[${itemIndex}].evidenceId`,
            error: `Invalid evidenceId reference: ${item.evidenceId}`
          });
        }
      });
    }

    // If reviews is an array (new schema), validate each item's evidenceId
    if (Array.isArray(response.reviews)) {
      (response.reviews as Array<any>).forEach((item, itemIndex) => {
        if (item?.evidenceId && !evidenceIds.has(item.evidenceId)) {
          errors.push({
            path: `reviews[${itemIndex}].evidenceId`,
            error: `Invalid evidenceId reference: ${item.evidenceId}`
          });
        }
      });
    }
    
    return errors;
  }
  
  /**
   * Validates the evidence array for completeness and diversity
   * @param response The response to validate
   * @returns Array of validation errors
   */
  validateEvidenceArray(response: CommerceReviewResponse): Array<{path: string; error: string}> {
    const errors: Array<{path: string; error: string}> = [];
    
    // Determine presence of review-related signals strictly from reviews array
    const hasReviewSignals = Array.isArray((response as any).reviews) && (response as any).reviews.length > 0;
    
    // Evidence diversity threshold: 2 when we expect multiple sources, otherwise 1
    const evidenceTypes = new Set(response.evidence.map(e => e.type));
    const diversityThreshold = hasReviewSignals ? 2 : 1;
    if (evidenceTypes.size < diversityThreshold) {
      errors.push({
        path: 'evidence',
        error: `Insufficient evidence diversity - need at least ${diversityThreshold} distinct evidence types`,
      });
    }
    
    // Evidence completeness: always require productPage; require 'review' only when review signals exist
    const essentialEvidenceTypes = ['productPage', ...(hasReviewSignals ? ['review'] : [])];
    const missingTypes = essentialEvidenceTypes.filter(type => !response.evidence.some(e => e.type === type));
    if (missingTypes.length > 0) {
      errors.push({
        path: 'evidence',
        error: `Missing essential evidence types: ${missingTypes.join(', ')}`
      });
    }
    
    return errors;
  }
  
  /**
   * Performs comprehensive evidence validation
   * @param response The response to validate
   * @returns Validation result with status and errors
   */
  validate(response: CommerceReviewResponse): { 
    isValid: boolean; 
    errors: Array<{path: string; error: string}>; 
    status: 'valid' | 'invalid' | 'partial' 
  } {
    const referenceErrors = this.validateEvidenceReferences(response);
    const arrayErrors = this.validateEvidenceArray(response);
    const allErrors = [...referenceErrors, ...arrayErrors];
    
    const isValid = allErrors.length === 0;
    const status = isValid ? 'valid' : 'invalid';
    
    return {
      isValid,
      errors: allErrors,
      status
    };
  }
}
