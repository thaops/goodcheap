import { Body, Controller, Post } from '@nestjs/common';
import { UnfurlService } from './unfurl.service';
import { ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('unfurl')
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
      },
      required: ['url'],
    },
  })
  @Post()
  async unfurlUrl(@Body('url') url: string) {
    return this.unfurl.fromUrl(url);
  }
}
