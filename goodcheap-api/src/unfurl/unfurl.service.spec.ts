import { Test, TestingModule } from '@nestjs/testing';
import { UnfurlService } from './unfurl.service';

describe('UnfurlService', () => {
  let unfurlService: UnfurlService;
  const prevEnv = process.env.NODE_ENV;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnfurlService],
    }).compile();

    unfurlService = module.get<UnfurlService>(UnfurlService);
  });

  afterAll(() => {
    process.env.NODE_ENV = prevEnv;
  });

  it('should be defined', () => {
    expect(unfurlService).toBeDefined();
  });

  describe('fromUrl', () => {
    it('should create a basic product DTO from URL', async () => {
      const url = 'https://example.com/product';
      const product = await unfurlService.fromUrl(url);
      
      expect(product).toBeDefined();
      expect(product.finalUrl).toBe(url);
      expect(product.source).toBe('other'); // default for non-marketplace domains
    });

    it('should determine source from URL', async () => {
      const tiktokUrl = 'https://tiktok.com/product';
      const shopeeUrl = 'https://shopee.vn/product';
      const lazadaUrl = 'https://lazada.vn/product';
      
      const tiktokProduct = await unfurlService.fromUrl(tiktokUrl);
      const shopeeProduct = await unfurlService.fromUrl(shopeeUrl);
      const lazadaProduct = await unfurlService.fromUrl(lazadaUrl);
      
      expect(tiktokProduct.source).toBe('tiktok');
      expect(shopeeProduct.source).toBe('shopee');
      expect(lazadaProduct.source).toBe('lazada');
    });
  });

  describe('expandUrl', () => {
    it('should return the same URL if no expansion needed', async () => {
      const url = 'https://example.com/product';
      const expandedUrl = await unfurlService.expandUrl(url);
      
      expect(expandedUrl).toBe(url);
    });
  });

  describe('fetchHtml', () => {
    it('should handle URL fetching', async () => {
      const url = 'https://example.com/product';
      // This would normally fetch HTML, but in tests we can't make real HTTP requests
      // We'll just verify the method exists and can be called
      expect(unfurlService.fetchHtml).toBeDefined();
    });
  });

  describe('parsing', () => {
    it('parses JSON-LD Product fields when present', async () => {
      const html = `
        <html><head>
          <script type="application/ld+json">
            {"@type":"Product","name":"Sample Product","image":["https://img/1.jpg","https://img/2.jpg"],
            "offers":{"price":"19.99","priceCurrency":"USD"},
            "aggregateRating":{"ratingValue":"4.5","reviewCount":"120"},
            "description":"A nice product"}
          </script>
        </head><body></body></html>
      `;
      const spy = jest.spyOn(unfurlService, 'fetchHtml').mockResolvedValue(html);
      const url = 'https://shop.test/item';
      const dto = await unfurlService.fromUrl(url);
      spy.mockRestore();

      expect(dto.finalUrl).toBe(url);
      expect(dto.title).toBe('Sample Product');
      expect(dto.images).toEqual(['https://img/1.jpg', 'https://img/2.jpg']);
      expect(dto.price).toBe(19.99);
      expect(dto.currency).toBe('USD');
      expect(dto.ratingAvg).toBe(4.5);
      expect(dto.reviewCount).toBe(120);
      expect(dto.description).toBe('A nice product');
    });

    it('falls back to OpenGraph when JSON-LD missing', async () => {
      const html = `
        <html><head>
          <meta property="og:title" content="OG Product" />
          <meta property="og:image" content="https://img/og.jpg" />
          <meta property="product:price:amount" content="9.99" />
          <meta property="product:price:currency" content="USD" />
        </head><body></body></html>
      `;
      const spy = jest.spyOn(unfurlService, 'fetchHtml').mockResolvedValue(html);
      const url = 'https://shop.test/item2';
      const dto = await unfurlService.fromUrl(url);
      spy.mockRestore();

      expect(dto.finalUrl).toBe(url);
      expect(dto.title).toBe('OG Product');
      expect(dto.images).toEqual(['https://img/og.jpg']);
      expect(dto.price).toBe(9.99);
      expect(dto.currency).toBe('USD');
    });
  });
});
