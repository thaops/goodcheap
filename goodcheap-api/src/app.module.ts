import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UnfurlModule } from './unfurl/unfurl.module';
import { AnalyzeModule } from './analyze/analyze.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UnfurlModule,
    AnalyzeModule,
  ],
})
export class AppModule {}
