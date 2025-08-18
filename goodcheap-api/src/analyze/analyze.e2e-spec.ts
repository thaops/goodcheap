import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AnalyzeModule } from './analyze.module';
import { CommerceReviewResponseSchema } from '../common/schemas/commerceReviewResponse.schema';

describe('AnalyzeController (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AnalyzeModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /analyze', () => {
    it('should analyze a product URL and return evidence-first response', async () => {
      const response = await request(app.getHttpServer())
        .post('/analyze')
        .send({
          url: 'https://tiktok.com/product/123456',
        })
        .expect(201);

      // Validate response against Zod schema
      const parsed = CommerceReviewResponseSchema.safeParse(response.body);
      expect(parsed.success).toBe(true);
      
      // Check essential response structure
      expect(response.body.meta).toBeDefined();
      expect(response.body.product).toBeDefined();
      expect(response.body.aiAnalysis).toBeDefined();
      expect(response.body.psychology).toBeDefined();
      expect(response.body.evidence).toBeDefined();
      expect(response.body.system).toBeDefined();
    });

    it('should analyze a product DTO and return evidence-first response', async () => {
      const response = await request(app.getHttpServer())
        .post('/analyze')
        .send({
          product: {
            finalUrl: 'https://tiktok.com/product/123456',
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
          },
        })
        .expect(201);

      // Validate response against Zod schema
      const parsed = CommerceReviewResponseSchema.safeParse(response.body);
      expect(parsed.success).toBe(true);
      
      // Check that product data is properly mapped
      expect(response.body.product.title).toBe('Test Product');
      expect(response.body.pricing.currentPrice).toBe(100000);
      expect(response.body.socialProof.ratingAvg).toBe(4.5);
    });

    it('should return hold verdict when critical data is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/analyze')
        .send({
          product: {
            finalUrl: 'https://tiktok.com/product/123456',
            source: 'tiktok',
            title: 'Test Product',
            images: ['https://example.com/image.jpg'],
            // Missing price, ratingAvg, reviewCount
          },
        })
        .expect(201);

      // Should return hold verdict when critical data is missing
      expect(response.body.aiAnalysis.verdict).toBe('hold');
    });
  });
});
