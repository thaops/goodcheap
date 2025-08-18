import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Module({
  providers: [
    ReviewsService,
    {
      provide: 'ReviewsService',
      useExisting: ReviewsService,
    },
  ],
  exports: [ReviewsService, 'ReviewsService'],
})
export class ReviewsModule {}
