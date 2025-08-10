import { Module } from '@nestjs/common';
import { AnalyzeController } from './analyze.controller';
import { AnalyzeService } from './analyze.service';
import { UnfurlModule } from '../unfurl/unfurl.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [UnfurlModule, ReviewsModule],
  providers: [AnalyzeService],
  controllers: [AnalyzeController],
})
export class AnalyzeModule {}
