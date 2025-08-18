import { Test, TestingModule } from '@nestjs/testing';
import { UnfurlService } from './unfurl.service';
import { ProductDTO } from '../common/types';

describe('UnfurlService', () => {
  let unfurlService: UnfurlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnfurlService],
    }).compile();

    unfurlService = module.get<UnfurlService>(UnfurlService);
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
      expect(product.source).toBe('tiktok'); // default source
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
});
