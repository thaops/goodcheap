import { AnalyzeService } from './analyze.service';
import type { UnfurlInterface } from '../common/interfaces/unfurl.interface';
import type { AIInterface } from '../common/interfaces/ai.interface';
import type { ResponseMapperInterface } from '../common/interfaces/response-mapper.interface';
import type { EvidenceValidatorInterface } from '../common/interfaces/evidence-validator.interface';
import type { ReviewsInterface } from '../common/interfaces/reviews.interface';
import type { EvidenceAggregatorInterface } from '../common/interfaces/evidence-aggregator.interface';
import { SimplifiedResponseMapper } from './simplified-response.mapper';
export declare class AnalyzeController {
    private readonly analyze;
    private readonly unfurl;
    private readonly responseMapper;
    private readonly simplifiedResponseMapper;
    private readonly geminiService;
    private readonly evidenceValidator;
    private readonly reviewsService;
    private readonly evidenceAggregator;
    constructor(analyze: AnalyzeService, unfurl: UnfurlInterface, responseMapper: ResponseMapperInterface, simplifiedResponseMapper: SimplifiedResponseMapper, geminiService: AIInterface, evidenceValidator: EvidenceValidatorInterface, reviewsService: ReviewsInterface, evidenceAggregator: EvidenceAggregatorInterface);
    private readonly logger;
    private get debugTiming();
    private now;
    private dur;
    analyzeUrl(body: {
        url: string;
    }, format?: 'detailed' | 'simplified'): Promise<any>;
    private alignAspectsToRubric;
    private buildAspectScores;
    private defaultMetricsForAspect;
    private normalizeAspectName;
    private platformFromUrl;
    private productIdFromUrl;
    private buildDataIntegrity;
}
