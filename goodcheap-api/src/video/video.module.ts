import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { GeminiService } from '../ai/gemini.service';
import { UnfurlModule } from '../unfurl/unfurl.module';

@Module({
  imports: [UnfurlModule],
  controllers: [VideoController],
  providers: [
    {
      provide: 'GeminiService',
      useClass: GeminiService,
    },
  ],
})
export class VideoModule {}
