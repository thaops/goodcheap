import { Module } from '@nestjs/common';
import { UnfurlService } from './unfurl.service';
import { UnfurlController } from './unfurl.controller';

@Module({
  providers: [
    // Class provider for UnfurlController constructor(private readonly unfurl: UnfurlService)
    UnfurlService,
    // String token alias for other modules using @Inject('UnfurlService')
    {
      provide: 'UnfurlService',
      useExisting: UnfurlService,
    },
    // Interface-like token for Clean Architecture DI
    {
      provide: 'UnfurlInterface',
      useExisting: UnfurlService,
    },
  ],
  controllers: [UnfurlController],
  exports: [UnfurlService, 'UnfurlService', 'UnfurlInterface'],
})
export class UnfurlModule {}
