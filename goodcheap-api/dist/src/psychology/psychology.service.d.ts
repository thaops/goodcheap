import { ProductDTO } from '../common/types';
import { PsychologyInterface } from '../common/interfaces/psychology.interface';
export declare class PsychologyService implements PsychologyInterface {
    calculatePsychologyScore(product: ProductDTO): number;
    calculateBuyerDecisionFactors(product: ProductDTO): any;
    calculateBuyerDecisionScorecard(product: ProductDTO): any;
}
