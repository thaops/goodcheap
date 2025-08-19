import type { ProductDTO, AnalysisDTO } from '../types';
import type { CommerceReviewResponse } from '../schemas/commerceReviewResponse.schema';

export interface ResponseMapperInterface {
  mapToEvidenceFirstResponse(
    product: ProductDTO,
    analysis: AnalysisDTO,
    actions: any,
  ): CommerceReviewResponse;
}
