import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UnfurlModule } from './unfurl/unfurl.module';
import { AnalyzeModule } from './analyze/analyze.module';
import { PsychologyModule } from './psychology/psychology.module';
import { CacheModule } from './cache/cache.module';
import { QueueModule } from './queue/queue.module';
import { DatabaseModule } from './database/database.module';
import { VideoModule } from './video/video.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UnfurlModule,
    AnalyzeModule,
    PsychologyModule,
    CacheModule,
    QueueModule,
    DatabaseModule,
    VideoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
