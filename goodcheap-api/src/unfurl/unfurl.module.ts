import { Module } from '@nestjs/common';
import { UnfurlService } from './unfurl.service';
import { UnfurlController } from './unfurl.controller';

@Module({
  providers: [UnfurlService],
  controllers: [UnfurlController],
  exports: [UnfurlService],
})
export class UnfurlModule {}
