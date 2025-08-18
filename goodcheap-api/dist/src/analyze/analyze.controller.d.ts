import { AnalyzeService } from './analyze.service';
import type { ProductDTO } from '../common/types';
import type { UnfurlInterface } from '../common/interfaces/unfurl.interface';
import type { AIInterface } from '../common/interfaces/ai.interface';
import type { ResponseMapperInterface } from '../common/interfaces/response-mapper.interface';
import type { EvidenceValidatorInterface } from '../common/interfaces/evidence-validator.interface';
import type { ReviewsInterface } from '../common/interfaces/reviews.interface';
import type { EvidenceAggregatorInterface } from '../common/interfaces/evidence-aggregator.interface';
export declare class AnalyzeController {
    private readonly analyze;
    private readonly unfurl;
    private readonly responseMapper;
    private readonly geminiService;
    private readonly evidenceValidator;
    private readonly reviewsService;
    private readonly evidenceAggregator;
    constructor(analyze: AnalyzeService, unfurl: UnfurlInterface, responseMapper: ResponseMapperInterface, geminiService: AIInterface, evidenceValidator: EvidenceValidatorInterface, reviewsService: ReviewsInterface, evidenceAggregator: EvidenceAggregatorInterface);
    private readonly logger;
    private get debugTiming();
    private now;
    private dur;
    analyzeUrl(body: {
        url?: string;
        product?: ProductDTO;
        html?: string;
    }): Promise<any>;
    private alignAspectsToRubric;
    private buildAspectScores;
    private defaultMetricsForAspect;
    private normalizeAspectName;
    private platformFromUrl;
    private productIdFromUrl;
    private buildDataIntegrity;
}
