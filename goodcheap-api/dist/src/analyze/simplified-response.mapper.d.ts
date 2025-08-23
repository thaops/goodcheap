import { CommerceReviewResponse } from '../common/schemas/commerceReviewResponse.schema';
import { SimplifiedAnalyzeResponse } from '../common/interfaces/simplified-response.interface';
export declare class SimplifiedResponseMapper {
    transform(originalResponse: CommerceReviewResponse): SimplifiedAnalyzeResponse;
    private extractLinkedVideos;
    private calculateOverallReliability;
}
