import { Injectable, BadRequestException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { UA } from '../common/ua';
import { pickJsonLdProduct, pickOpenGraph } from '../common/html';
import { ProductDTO } from '../common/types';
import { UnfurlInterface } from '../common/interfaces/unfurl.interface';

@Injectable()
export class UnfurlService implements UnfurlInterface {
  private ensureValidUrl(url: string) {
    try {
      // Throws on invalid
      new URL(url);
    } catch {
      throw new BadRequestException('Invalid URL');
    }
  }

  async expandUrl(url: string): Promise<string> {
    this.ensureValidUrl(url);
    try {
      // Tránh network trong môi trường test để không phá unit/integration tests
      const env = (process.env.NODE_ENV ?? '').toLowerCase();
      if (env === 'test') return url;

      const { default: got } = await import('got');

      // 1) Thử HEAD để theo dõi redirect nhanh
      try {
        const headRes = await got.head(url, {
          headers: { 'user-agent': UA },
          followRedirect: true,
          maxRedirects: 10,
          timeout: { request: 8000 },
          throwHttpErrors: false,
        });
        if (headRes && typeof headRes.url === 'string' && headRes.url.length > 0) {
          return headRes.url;
        }
      } catch {}

      // 2) Fallback GET nhẹ để lấy final URL (got theo dõi redirect mặc định)
      const getRes = await got(url, {
        headers: { 'user-agent': UA },
        followRedirect: true,
        maxRedirects: 10,
        timeout: { request: 12000 },
      });
      if (getRes && typeof getRes.url === 'string' && getRes.url.length > 0) {
        return getRes.url;
      }

      // 3) Chót: nếu có header Location thì resolve thủ công; nếu không thì trả lại URL gốc
      const loc = (getRes as any)?.headers?.location;
      if (typeof loc === 'string' && loc.length > 0) {
        try {
          const base = new URL(url);
          const resolved = new URL(loc, base);
          return resolved.toString();
        } catch {}
      }
      return url;
    } catch (e: any) {
      const status = e?.response?.statusCode ?? 502;
      const msg = e?.message || 'Failed to expand URL';
      throw new HttpException(`Expand URL error: ${msg}`, status);
    }
  }

  private detectSource(finalUrl: string): ProductDTO['source'] {
    const u = (finalUrl || '').toLowerCase();
    if (u.includes('tiktok')) return 'tiktok';
    if (u.includes('shopee')) return 'shopee';
    if (u.includes('lazada')) return 'lazada';
    return 'other';
  }

  private parseTiktokOgInfo(finalUrl: string): { title?: string; image?: string } {
    try {
      const u = new URL(finalUrl);
      const raw = u.searchParams.get('og_info');
      if (!raw) return {};
      const data = JSON.parse(decodeURIComponent(raw));
      const title = typeof data?.title === 'string' ? data.title : undefined;
      const image = typeof data?.image === 'string' ? data.image : undefined;
      return { title, image };
    } catch {
      return {};
    }
  }

  async fetchHtml(url: string): Promise<string> {
    this.ensureValidUrl(url);
    try {
      const { default: got } = await import('got');
      return await got(url, {
        headers: { 'user-agent': UA },
        timeout: { request: 10000 },
      }).text();
    } catch (e: any) {
      const status = e?.response?.statusCode ?? 502;
      const msg = e?.message || 'Failed to fetch HTML';
      throw new HttpException(`Fetch HTML error: ${msg}`, status);
    }
  }

  async fromUrl(url: string): Promise<ProductDTO> {
    try {
      const finalUrl = await this.expandUrl(url);

      const dto: ProductDTO = {
        finalUrl,
        source: this.detectSource(finalUrl),
        images: [],
      };

      // TikTok fallback: lấy title/image từ tham số og_info nếu có
      if (dto.source === 'tiktok') {
        const og = this.parseTiktokOgInfo(finalUrl);
        if (og.title && !dto.title) dto.title = og.title;
        if (og.image) dto.images = [og.image];
      }

      // HTML có thể bị chặn => thử fetch, nhưng không làm fail toàn bộ nếu lỗi
      let html: string | null = null;
      try {
        html = await this.fetchHtml(finalUrl);
      } catch {
        html = null;
      }

      if (html) {
        // 1) Prefer JSON-LD Product (chỉ điền vào field còn thiếu)
        const ld = pickJsonLdProduct(html);
        if (ld) {
          if (!dto.title && ld.name) dto.title = ld.name;
          const imgs = ld.image || [];
          const parsedImgs = Array.isArray(imgs) ? imgs : [imgs].filter(Boolean);
          if (!dto.images?.length && parsedImgs.length) dto.images = parsedImgs;

          const offers = Array.isArray(ld.offers) ? ld.offers?.[0] : ld.offers || {};
          if (offers?.price) dto.price = Number(offers.price);
          if (offers?.priceCurrency) dto.currency = offers.priceCurrency;

          const agg = ld.aggregateRating || {};
          if (agg?.ratingValue) dto.ratingAvg = Number(agg.ratingValue);
          if (agg?.reviewCount) dto.reviewCount = Number(agg.reviewCount);

          if (!dto.description && ld.description) dto.description = String(ld.description);
        } else {
          // 2) Fallback OpenGraph
          const ogm = pickOpenGraph(html);
          if (!dto.title && ogm['og:title']) dto.title = ogm['og:title'];
          if (!dto.images.length && ogm['og:image']) dto.images = [ogm['og:image']];
          // Some sites use product:price:amount / product:price:currency
          if (ogm['product:price:amount']) dto.price = Number(ogm['product:price:amount']);
          if (ogm['product:price:currency']) dto.currency = ogm['product:price:currency'];
        }
      }

      return dto;
    } catch (e: any) {
      // If already an HttpException, bubble up
      if (e instanceof HttpException) throw e;
      throw new InternalServerErrorException(e?.message || 'Unfurl failed');
    }
  }
}
