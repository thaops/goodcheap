import { Body, Controller, Inject, Post } from '@nestjs/common';
import { z } from 'zod';
import { ProductDTO } from '../common/types';
import { GeminiService } from '../ai/gemini.service';
import type { UnfurlInterface } from '../common/interfaces/unfurl.interface';
import { ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('video')
@Controller('video')
export class VideoController {
  constructor(
    @Inject('GeminiService') private readonly ai: GeminiService,
    @Inject('UnfurlService') private readonly unfurl: UnfurlInterface,
  ) {}

  /**
   * POST /video/search
   * Body: { title?: string, finalUrl?: string, max?: number }
   * Trả về danh sách link video liên quan (YouTube, TikTok)
   */
  @ApiBody({
    description: 'Tìm video review liên quan theo title hoặc finalUrl (có thể set max 1..10)',
    required: true,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Apple AirPods Pro 2' },
        finalUrl: { type: 'string', format: 'uri', example: 'https://www.apple.com/airpods-pro/' },
        max: { type: 'integer', minimum: 1, maximum: 10, example: 5 },
      },
    },
  })
  @Post('search')
  async search(@Body() body: any) {
    const schema = z.object({
      title: z.string().min(1).optional(),
      finalUrl: z.string().url().optional(),
      max: z.number().int().min(1).max(10).optional(),
    });
    const input = schema.parse(body);

    // Base product từ input
    let product: ProductDTO = {
      finalUrl: input.finalUrl ?? '',
      source: 'other',
      title: input.title,
      images: [],
    };

    // Nếu chỉ gửi URL (finalUrl) mà thiếu title => tự unfurl để lấy page title/images
    if (!product.title && product.finalUrl) {
      try {
        const enriched = await this.unfurl.fromUrl(product.finalUrl);
        product = {
          ...product,
          ...enriched,
          title: product.title || enriched.title,
          images: (product.images && product.images.length ? product.images : (enriched.images || [])),
        } as ProductDTO;
      } catch {}
    }

    const [ytItems, ttItems] = await Promise.all([
      this.ai.searchYouTubeReviews(product).catch(() => []),
      this.ai.searchTikTokReviews(product).catch(() => []),
    ]);

    const max = input.max ?? undefined;
    const toLinks = (items: any[]) => (items || [])
      .map((it: any) => it?.url)
      .filter((u: any) => typeof u === 'string' && u.length > 0);

    const youtube = toLinks(ytItems).slice(0, max ?? ytItems.length);
    const tiktok = toLinks(ttItems).slice(0, max ?? ttItems.length);
    const all = Array.from(new Set([...youtube, ...tiktok]));

    return { youtube, tiktok, all };
  }
}
