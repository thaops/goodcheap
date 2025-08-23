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
      expect(response.body.psychologyV2).toBeDefined();
      expect(response.body.evidence).toBeDefined();
      expect(response.body.system).toBeDefined();
    });

    it('should return hold verdict when critical data is missing (URL-only minimal data)', async () => {
      const response = await request(app.getHttpServer())
        .post('/analyze')
        .send({
          // In test env, fetchHtml is disabled -> minimal product info from URL only
          url: 'https://tiktok.com/product/123456',
        })
        .expect(201);

      // Should return hold verdict when critical data is missing
      expect(response.body.aiAnalysis.verdict).toBe('hold');
    });
  });
});
