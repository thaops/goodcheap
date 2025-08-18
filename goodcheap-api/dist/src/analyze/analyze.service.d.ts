import { ProductDTO, AnalysisDTO, AlternativeItem, ActionsDTO } from '../common/types';
import { ReviewsService } from '../reviews/reviews.service';
export declare class AnalyzeService {
    private readonly reviewsService;
    private gemini;
    private modelName;
    private readonly logger;
    private get debugTiming();
    private now;
    private dur;
    constructor(reviewsService: ReviewsService);
    private norm;
    private parseJsonLlm;
    calcScore(p: ProductDTO): number;
    summarizeProsCons(p: ProductDTO): Promise<{
        pros: any;
        cons: any;
        summary: any;
        confidence: any;
    }>;
    detectRedFlags(p: ProductDTO): string[];
    decisionAndReviewInsights(p: ProductDTO, baseAnalysis: Pick<AnalysisDTO, 'goodCheapScore' | 'pros' | 'cons' | 'redFlags' | 'summary'>): Promise<{
        decision: {
            verdict: any;
            rationale: any;
        };
        reviewInsights: {
            positives: any;
            negatives: any;
        };
    }>;
    private ruleVerdict;
    private buildAspects;
    private getRequiredAspects;
    private buildReviewHighlights;
    private buildPriceBenchmarks;
    private buildAlternatives;
    getCautions(p: ProductDTO, analysis: AnalysisDTO): string[];
    getAlternatives(p: ProductDTO): AlternativeItem[] | undefined;
    getActions(p: ProductDTO): ActionsDTO;
    private buildActions;
    analyzeProduct(p: ProductDTO): Promise<AnalysisDTO>;
    analyzeProductRich(p: ProductDTO): Promise<any>;
    private sanitizeUrl;
}
