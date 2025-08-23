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

    it('should compute per_100ml when size in ml is present in title', () => {
      const product: ProductDTO = {
        finalUrl: 'https://www.tiktok.com/@shop/product/abc',
        source: 'tiktok',
        title: 'Test Product 250ml',
        currency: 'VND',
        price: 100000, // VND
        images: ['https://example.com/image.jpg'],
      } as any;

      const analysis: AnalysisDTO = {
        pros: [],
        cons: [],
        aspects: [],
        decision: { verdict: 'consider' },
      } as any;

      const response = responseMapper.mapToEvidenceFirstResponse(product, analysis, {});
      expect(response.marketplace?.price?.per_100ml).toBe(40000); // 100000/250*100
    });

    it('should compute per_100g when size in g is present in title', () => {
      const product: ProductDTO = {
        finalUrl: 'https://www.tiktok.com/@shop/product/def',
        source: 'tiktok',
        title: 'Another Product 200g',
        currency: 'VND',
        price: 50000, // VND
        images: ['https://example.com/image.jpg'],
      } as any;

      const analysis: AnalysisDTO = {
        pros: [],
        cons: [],
        aspects: [],
        decision: { verdict: 'consider' },
      } as any;

      const response = responseMapper.mapToEvidenceFirstResponse(product, analysis, {});
      expect(response.marketplace?.price?.per_100g).toBe(25000); // 50000/200*100
    });

    it('should NOT scale VND < 1000 for TikTok platform', () => {
      const product: ProductDTO = {
        finalUrl: 'https://www.tiktok.com/@shop/product/abc',
        source: 'tiktok',
        title: 'Low price TikTok item',
        currency: 'VND',
        price: 350,
        discountPrice: 400,
        ratingAvg: 4.2,
        reviewCount: 20,
        images: ['https://example.com/image.jpg'],
      };

      const analysis: AnalysisDTO = {
        pros: [],
        cons: [],
        aspects: [],
        decision: { verdict: 'consider' },
      } as any;

      const response = responseMapper.mapToEvidenceFirstResponse(product, analysis, {});
      expect(response.meta.platform).toBe('tiktok');
      expect(response.marketplace?.price?.currency).toBe('VND');
      expect(response.marketplace?.price?.sale).toBe(350);
      expect(response.marketplace?.price?.list).toBe(400);
    });

    it('should scale VND < 1000 for Shopee platform (encoded in thousands)', () => {
      const product: ProductDTO = {
        finalUrl: 'https://shopee.vn/product/xyz',
        source: 'shopee',
        title: 'Low price Shopee item',
        currency: 'VND',
        price: 350,
        discountPrice: 400,
        ratingAvg: 4.2,
        reviewCount: 20,
        images: ['https://example.com/image.jpg'],
      };

      const analysis: AnalysisDTO = {
        pros: [],
        cons: [],
        aspects: [],
        decision: { verdict: 'consider' },
      } as any;

      const response = responseMapper.mapToEvidenceFirstResponse(product, analysis, {});
      expect(response.meta.platform).toBe('shopee');
      expect(response.marketplace?.price?.currency).toBe('VND');
      expect(response.marketplace?.price?.sale).toBe(350000);
      expect(response.marketplace?.price?.list).toBe(400000);
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

    it('should map ratingBreakdown into socialProof from ratingDistribution', () => {
      const product: ProductDTO = {
        finalUrl: 'https://example.com/product',
        source: 'tiktok',
        title: 'Product with breakdown',
        ratingAvg: 4.3,
        reviewCount: 21,
        images: ['https://example.com/img.jpg'],
      } as any;
      // Provide rating distribution under a supported key
      (product as any).ratingDistribution = { '5': 10, '4': 5, '3': 3, '2': 1, '1': 2 };

      const analysis: AnalysisDTO = {
        pros: [],
        cons: [],
        aspects: [],
        decision: { verdict: 'consider' },
      } as any;

      const response = responseMapper.mapToEvidenceFirstResponse(product, analysis, {});
      expect(response.socialProof?.ratingBreakdown).toEqual({ '5': 10, '4': 5, '3': 3, '2': 1, '1': 2 });
    });

    it('should compute reviewWithImagesPercent from reviewsSample when not provided', () => {
      const product: ProductDTO = {
        finalUrl: 'https://example.com/p',
        source: 'tiktok',
        title: 'Product with media ratio',
        ratingAvg: 4.0,
        reviewCount: 3,
        images: ['https://example.com/img.jpg'],
        reviewsSample: [
          { id: 'r1', rating: 5, text: 'nice', createdAt: new Date().toISOString(), images: ['a.jpg'] } as any,
          { id: 'r2', rating: 4, text: 'ok', createdAt: new Date().toISOString() } as any,
          { id: 'r3', rating: 3, text: 'meh', createdAt: new Date().toISOString(), videos: ['v.mp4'] } as any,
        ],
      } as any;

      const analysis: AnalysisDTO = { pros: [], cons: [], aspects: [], decision: { verdict: 'consider' } } as any;
      const response = responseMapper.mapToEvidenceFirstResponse(product, analysis, {});
      // withMedia = 2/3 => 0.666..., rounded to 0.67 by mapper
      expect(response.reviewsAggregate?.reviewWithImagesPercent).toBe(0.67);
    });

    it('should prefer product.reviewWithImagesPercent when provided', () => {
      const product: ProductDTO = {
        finalUrl: 'https://example.com/p2',
        source: 'tiktok',
        title: 'Product with provided media ratio',
        ratingAvg: 4.0,
        reviewCount: 10,
        images: ['https://example.com/img.jpg'],
        reviewWithImagesPercent: 0.4,
        reviewsSample: [
          { id: 'r1', rating: 5, text: 'nice', createdAt: new Date().toISOString(), images: ['a.jpg'] } as any,
          { id: 'r2', rating: 4, text: 'ok', createdAt: new Date().toISOString() } as any,
        ],
      } as any;

      const analysis: AnalysisDTO = { pros: [], cons: [], aspects: [], decision: { verdict: 'consider' } } as any;
      const response = responseMapper.mapToEvidenceFirstResponse(product, analysis, {});
      expect(response.reviewsAggregate?.reviewWithImagesPercent).toBe(0.4);
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
      
      // Psychology V2 should be calculated
      expect(response.psychologyV2).toBeDefined();
      expect(response.psychologyV2!.scorecard).toBeDefined();
    });
  });
});
