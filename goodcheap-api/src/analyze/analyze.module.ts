import { Module } from '@nestjs/common';
import { AnalyzeController } from './analyze.controller';
import { AnalyzeService } from './analyze.service';
import { ResponseMapper } from './response.mapper';
import { PsychologyService } from '../psychology/psychology.service';
import { GeminiService } from '../ai/gemini.service';
import { UnfurlModule } from '../unfurl/unfurl.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { EvidenceValidator } from './evidence.validator';
import { EvidenceAggregator } from './evidence.aggregator';
import { EVIDENCE_AGGREGATOR_TOKEN } from '../common/interfaces/evidence-aggregator.interface';

@Module({
  imports: [UnfurlModule, ReviewsModule],
  providers: [
    AnalyzeService, 
    PsychologyService,
    {
      provide: 'EvidenceValidator',
      useClass: EvidenceValidator,
    },
    {
      provide: EVIDENCE_AGGREGATOR_TOKEN,
      useClass: EvidenceAggregator
    },
    {
      provide: 'ResponseMapper',
      useClass: ResponseMapper
    },
    {
      provide: 'GeminiService',
      useClass: GeminiService
    }
  ],
  controllers: [AnalyzeController],
  exports: [AnalyzeService],
})
export class AnalyzeModule {}
