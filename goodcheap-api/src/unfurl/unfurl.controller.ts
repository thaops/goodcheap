import { Body, Controller, Post } from '@nestjs/common';
import { UnfurlService } from './unfurl.service';
import { ApiTags, ApiBody, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { ZodValidationPipe } from '../common/pipes/zod.pipe';
import { UnfurlRequestSchema } from './unfurl.schema';
import type { UnfurlRequest } from './unfurl.schema';
import { ProductResponseModel, ReviewItemModel, ShippingModel, DebugModel } from './unfurl.models';

@ApiTags('unfurl')
@ApiExtraModels(ProductResponseModel, ReviewItemModel, ShippingModel, DebugModel)
@Controller('unfurl')
export class UnfurlController {
  constructor(private readonly unfurl: UnfurlService) {}

  @ApiBody({
    description: 'URL của trang sản phẩm cần unfurl',
    required: true,
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', format: 'uri', example: 'https://www.tiktok.com/...' },
        debug: {
          type: 'object',
          properties: {
            includeRawHtml: {
              type: 'boolean',
              description:
                'Nếu true và GC_DEBUG_RAW=1, API sẽ trả thêm _debug.rawHtml (có thể được cắt bớt bởi GC_DEBUG_RAW_LIMIT).',
              example: false,
            },
          },
        },
      },
      required: ['url'],
    },
  })
  @Post()
  @ApiResponse({ status: 201, description: 'Unfurl thành công', type: ProductResponseModel })
  @ApiResponse({ status: 400, description: 'Invalid URL' })
  async unfurlUrl(@Body(new ZodValidationPipe(UnfurlRequestSchema)) body: UnfurlRequest) {
    const url: string = body?.url;
    const debug = body?.debug || {};

    const dto = await this.unfurl.fromUrl(url);

    if (debug?.includeRawHtml && process.env.GC_DEBUG_RAW === '1') {
      try {
        const finalUrl = dto?.finalUrl || url;
        const raw = await this.unfurl.fetchHtml(finalUrl);
        const limit = Number(process.env.GC_DEBUG_RAW_LIMIT || 500000);
        const truncated = raw.length > limit;
        const rawHtml = truncated ? raw.slice(0, limit) : raw;
        return { ...dto, _debug: { rawHtml, truncated } } as any;
      } catch (e: any) {
        return { ...dto, _debug: { rawHtml: null, error: 'fetch_html_failed', message: String(e?.message || e) } } as any;
      }
    }

    return dto;
  }
}
