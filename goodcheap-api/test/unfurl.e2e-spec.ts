import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Unfurl (e2e)', () => {
  let app: INestApplication;
  const prevNodeEnv = process.env.NODE_ENV;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/unfurl (POST) - TikTok og_info fallback', async () => {
    const og = encodeURIComponent(JSON.stringify({ title: 'Foo Bar', image: 'https://cdn.example.com/img.jpg' }));
    const url = `https://www.tiktok.com/@abc/video/123?og_info=${og}`;
    const res = await request(app.getHttpServer())
      .post('/unfurl')
      .send({ url })
      .expect(201);

    expect(res.body.source).toBe('tiktok');
    expect(res.body.finalUrl).toBe(url);
    expect(res.body.title).toBe('Foo Bar');
    expect(res.body.images).toEqual(['https://cdn.example.com/img.jpg']);
  });

  it('/unfurl (POST) - happy path', async () => {
    const res = await request(app.getHttpServer())
      .post('/unfurl')
      .send({ url: 'https://example.com/product' })
      .expect(201);

    expect(res.body).toBeDefined();
    expect(typeof res.body.finalUrl).toBe('string');
    expect(res.body.finalUrl).toBe('https://example.com/product');
    expect(res.body.source).toBe('other');
    expect(Array.isArray(res.body.images)).toBe(true);
  });

  it('/unfurl (POST) - 400 invalid URL', async () => {
    await request(app.getHttpServer())
      .post('/unfurl')
      .send({ url: 'not-a-url' })
      .expect(400);
  });

  it('/unfurl (POST) - debug raw html (GC_DEBUG_RAW=1)', async () => {
    const prev = process.env.GC_DEBUG_RAW;
    process.env.GC_DEBUG_RAW = '1';
    try {
      const res = await request(app.getHttpServer())
        .post('/unfurl')
        .send({ url: 'https://example.com/product', debug: { includeRawHtml: true } })
        .expect(201);

      expect(res.body).toBeDefined();
      expect(res.body._debug).toBeDefined();
      expect(
        typeof res.body._debug.rawHtml === 'string' ||
          res.body._debug.error === 'fetch_html_failed'
      ).toBe(true);
    } finally {
      process.env.GC_DEBUG_RAW = prev;
    }
  });

  it('/unfurl (POST) - Shopee source detection', async () => {
    const url = 'https://shopee.vn/product/123';
    const res = await request(app.getHttpServer())
      .post('/unfurl')
      .send({ url })
      .expect(201);

    expect(res.body.source).toBe('shopee');
    expect(res.body.finalUrl).toBe(url);
  });

  it('/unfurl (POST) - Lazada source detection', async () => {
    const url = 'https://www.lazada.vn/products/abc';
    const res = await request(app.getHttpServer())
      .post('/unfurl')
      .send({ url })
      .expect(201);

    expect(res.body.source).toBe('lazada');
    expect(res.body.finalUrl).toBe(url);
  });

  afterAll(async () => {
    await app.close();
    process.env.NODE_ENV = prevNodeEnv;
  });
});
