import { Test, TestingModule } from '@nestjs/testing';
import { AnalyzeService } from './analyze.service';
import { ReviewsService } from '../reviews/reviews.service';
import { PsychologyService } from '../psychology/psychology.service';
import { ProductDTO } from '../common/types';

describe('AnalyzeService', () => {
  let analyzeService: AnalyzeService;
  let reviewsService: ReviewsService;
  let psychologyService: PsychologyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyzeService,
        ReviewsService,
        PsychologyService,
      ],
    }).compile();

    analyzeService = module.get<AnalyzeService>(AnalyzeService);
    reviewsService = module.get<ReviewsService>(ReviewsService);
    psychologyService = module.get<PsychologyService>(PsychologyService);
  });

  it('should be defined', () => {
    expect(analyzeService).toBeDefined();
  });

  describe('analyzeProduct', () => {
    it('should analyze a product and return analysis DTO', async () => {
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

      const analysis = await analyzeService.analyzeProduct(product);
      
      expect(analysis).toBeDefined();
      expect(typeof analysis.goodCheapScore).toBe('number');
      expect(Array.isArray(analysis.pros)).toBe(true);
      expect(Array.isArray(analysis.cons)).toBe(true);
      expect(Array.isArray(analysis.redFlags)).toBe(true);
      expect(typeof analysis.summary).toBe('string');
      expect(Array.isArray(analysis.aspects)).toBe(true);
      expect(typeof analysis.confidence).toBe('number');
    });

    it('should handle products with no reviews', async () => {
      const product: ProductDTO = {
        finalUrl: 'https://example.com/product',
        source: 'tiktok',
        title: 'Test Product',
        price: 100000,
        ratingAvg: 0,
        reviewCount: 0,
        images: ['https://example.com/image.jpg'],
        // No reviewsSample
      };

      const analysis = await analyzeService.analyzeProduct(product);
      
      expect(analysis).toBeDefined();
      // Should still return a valid analysis DTO even with no reviews
      expect(typeof analysis.goodCheapScore).toBe('number');
      expect(Array.isArray(analysis.pros)).toBe(true);
      expect(Array.isArray(analysis.cons)).toBe(true);
      expect(Array.isArray(analysis.redFlags)).toBe(true);
    });
  });

  describe('getActions', () => {
    it('should return actions based on product data', () => {
      const product: ProductDTO = {
        finalUrl: 'https://example.com/product',
        source: 'tiktok',
        title: 'Test Product',
        price: 100000,
        ratingAvg: 4.5,
        reviewCount: 100,
        images: ['https://example.com/image.jpg'],
      };

      const actions = analyzeService.getActions(product);
      
      expect(actions).toBeDefined();
      // Actions object should have the expected structure
      expect(typeof actions).toBe('object');
    });
  });
});
