import { Test, TestingModule } from '@nestjs/testing';
import { ResponseMapper } from './response.mapper';
import { PsychologyService } from '../psychology/psychology.service';
import { ProductDTO, AnalysisDTO } from '../common/types';
import { CommerceReviewResponseSchema } from '../common/schemas/commerceReviewResponse.schema';

describe('ResponseMapper', () => {
  let responseMapper: ResponseMapper;
  let psychologyService: PsychologyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseMapper, PsychologyService],
    }).compile();

    responseMapper = module.get<ResponseMapper>(ResponseMapper);
    psychologyService = module.get<PsychologyService>(PsychologyService);
  });

  it('should be defined', () => {
    expect(responseMapper).toBeDefined();
  });

  describe('mapToEvidenceFirstResponse', () => {
    it('should map product data to evidence-first response schema', () => {
      const product: ProductDTO = {
        finalUrl: 'https://example.com/product',
        source: 'tiktok',
        title: 'Test Product',
        price: 100000,
        ratingAvg: 4.5,
        reviewCount: 100,
        images: ['https://example.com/image.jpg'],
        reviewsSample: [
          {
            id: 'review_1',
            rating: 5,
            text: 'Great product!',
            authorName: 'Test User',
            createdAt: new Date().toISOString(),
          },
        ],
      };

      const analysis: AnalysisDTO = {
        goodCheapScore: 80,
        pros: ['Good quality', 'Fair price'],
        cons: ['Limited availability'],
        redFlags: [],
        summary: 'This is a good product',
        aspects: [
          {
            name: 'overview',
            pros: [],
            cons: [],
            positiveQuotes: [],
            negativeQuotes: [],
          },
        ],
        confidence: 0.8,
        decision: {
          verdict: 'buy',
          rationale: ['High quality', 'Good value'],
        },
      };

      const actions = {};

      const response = responseMapper.mapToEvidenceFirstResponse(product, analysis, actions);
      
      // Validate against Zod schema
      const parsed = CommerceReviewResponseSchema.safeParse(response);
      expect(parsed.success).toBe(true);
      
      // Check that essential fields are mapped correctly
      expect(response.meta.platform).toBe('tiktok');
      expect(response.product.title).toBe('Test Product');
      expect(response.aiAnalysis.verdict).toBe('buy');
      expect(response.evidence.length).toBeGreaterThan(0);
    });

    it('should return hold verdict when critical data is missing', () => {
      const product: ProductDTO = {
        finalUrl: 'https://example.com/product',
        source: 'tiktok',
        title: 'Test Product',
        images: ['https://example.com/image.jpg'],
        // Missing price, ratingAvg, reviewCount, etc.
      };

      const analysis: AnalysisDTO = {
        goodCheapScore: 30,
        pros: [],
        cons: [],
        redFlags: [],
        summary: '',
        aspects: [],
        confidence: 0.5,
      };

      const actions = {};

      const response = responseMapper.mapToEvidenceFirstResponse(product, analysis, actions);
      
      // Should return hold verdict when critical data is missing
      expect(response.aiAnalysis.verdict).toBe('hold');
    });
  });

  describe('psychology service integration', () => {
    it('should calculate psychology scores using PsychologyService', () => {
      const product: ProductDTO = {
        finalUrl: 'https://example.com/product',
        source: 'tiktok',
        title: 'Test Product',
        price: 100000,
        ratingAvg: 4.5,
        reviewCount: 100,
        images: ['https://example.com/image.jpg'],
        reviewsSample: [
          {
            id: 'review_1',
            rating: 5,
            text: 'Great product!',
            authorName: 'Test User',
            createdAt: new Date().toISOString(),
            helpfulCount: 10,
          },
          {
            id: 'review_2',
            rating: 4,
            text: 'Good product!',
            authorName: 'Test User 2',
            createdAt: new Date().toISOString(),
            helpfulCount: 5,
          },
        ],
      };

      const analysis: AnalysisDTO = {
        goodCheapScore: 80,
        pros: ['Good quality', 'Fair price'],
        cons: ['Limited availability'],
        redFlags: [],
        summary: 'This is a good product',
        aspects: [],
        confidence: 0.8,
      };

      const actions = {};
      const response = responseMapper.mapToEvidenceFirstResponse(product, analysis, actions);
      
      // Psychology scores should be calculated
      expect(response.psychology).toBeDefined();
      expect(response.psychology!.buyerDecisionScorecard).toBeDefined();
      expect(response.psychology!.factors).toBeDefined();
      expect(response.psychology!.notes).toBeDefined();
    });
  });
});
