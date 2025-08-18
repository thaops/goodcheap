import { CommerceReviewResponse } from '../common/schemas/commerceReviewResponse.schema';
import { ProductDTO, AnalysisDTO } from '../common/types';
import { PsychologyService } from '../psychology/psychology.service';
import { ResponseMapperInterface } from '../common/interfaces/response-mapper.interface';
export declare class ResponseMapper implements ResponseMapperInterface {
    private readonly psychologyService;
    constructor(psychologyService: PsychologyService);
    mapToEvidenceFirstResponse(product: ProductDTO, analysis: AnalysisDTO, actions: any): CommerceReviewResponse;
    private buildEvidenceArray;
    private buildReviews;
    private mapReviewItem;
    private determineVerdict;
    private hasCriticalData;
    private mapAspectScores;
    private buildDataIntegrity;
    private clampBuyerDecisionScorecard;
    private clampRating;
    private normalizeMedia;
    private normalizeSource;
    private pickTopicEvidenceIds;
}
