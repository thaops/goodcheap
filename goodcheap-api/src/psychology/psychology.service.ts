import { Injectable } from '@nestjs/common';
import { ProductDTO } from '../common/types';
import { PsychologyInterface } from '../common/interfaces/psychology.interface';

@Injectable()
export class PsychologyService implements PsychologyInterface {
  /**
   * Calculate psychology score based on product reviews
   * This implements evidence-first scoring where all metrics are backed by review evidence
   */
  calculatePsychologyScore(product: ProductDTO): number {
    // Calculate psychology score based on evidence from reviews
    const reviews = product.reviewsSample || [];
    
    if (reviews.length === 0) {
      return 50; // Neutral score when no evidence
    }
    
    // Calculate average rating as a base for psychology score
    const avgRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length;
    
    // Calculate social proof strength based on review count
    const socialProofStrength = Math.min(reviews.length / 100, 1); // Normalize review count to 0-1
    
    // Calculate evidence strength based on reviews with helpful counts
    const helpfulReviews = reviews.filter(review => review.helpfulCount && review.helpfulCount > 0);
    const evidenceStrength = helpfulReviews.length / reviews.length;
    
    // Combine factors to create a psychology score between 0-100
    const score = (avgRating * 20) + (socialProofStrength * 30) + (evidenceStrength * 50);
    
    return Math.min(Math.max(Math.round(score), 0), 100);
  }
  
  /**
   * Calculate detailed buyer decision factors
   */
  calculateBuyerDecisionFactors(product: ProductDTO): any {
    const reviews = product.reviewsSample || [];
    
    // Social proof strength (0-1)
    const socialProofStrength = Math.min(reviews.length / 100, 1);
    
    // Loss aversion mitigation (0-1) - based on positive sentiment
    const positiveReviews = reviews.filter(review => review.rating && review.rating >= 4);
    const lossAversionMitigation = positiveReviews.length / Math.max(reviews.length, 1);
    
    // Ambiguity mitigation (0-1) - based on reviews with text content
    const detailedReviews = reviews.filter(review => review.text && review.text.length > 50);
    const ambiguityMitigation = detailedReviews.length / Math.max(reviews.length, 1);
    
    // Urgency scarcity (0-1) - mock implementation
    const urgencyScarcity = 0.5;
    
    // Ability friction (0-1) - based on reviews with images (more detailed evidence)
    const imageReviews = reviews.filter(review => review.images && review.images.length > 0);
    const abilityFriction = imageReviews.length / Math.max(reviews.length, 1);
    
    return {
      socialProofStrength,
      lossAversionMitigation,
      ambiguityMitigation,
      urgencyScarcity,
      abilityFriction,
    };
  }
  
  /**
   * Calculate buyer decision scorecard
   */
  calculateBuyerDecisionScorecard(product: ProductDTO): any {
    const psychologyScore = this.calculatePsychologyScore(product);
    
    // Distribute the psychology score across the five factors (0-2 each, total 0-10)
    const trust = Math.min(2, psychologyScore / 50);
    const evidence = Math.min(2, psychologyScore / 50);
    const riskReversal = Math.min(2, psychologyScore / 50);
    const easeToBuy = Math.min(2, psychologyScore / 50);
    const urgency = Math.min(2, psychologyScore / 50);
    
    return {
      trust,
      evidence,
      riskReversal,
      easeToBuy,
      urgency,
      total: psychologyScore,
    };
  }
}
