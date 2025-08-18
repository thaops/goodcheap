import { ProductDTO } from '../types';

export interface PsychologyInterface {
  calculatePsychologyScore(product: ProductDTO): number;
  calculateBuyerDecisionFactors(product: ProductDTO): any;
  calculateBuyerDecisionScorecard(product: ProductDTO): any;
}
