import { Body, Controller, Post } from '@nestjs/common';
import { UnfurlService } from './unfurl.service';

@Controller('unfurl')
export class UnfurlController {
  constructor(private readonly unfurl: UnfurlService) {}

  @Post()
  async unfurlUrl(@Body('url') url: string) {
    return this.unfurl.fromUrl(url);
  }
}
