import { Module } from '@nestjs/common';
import { PsychologyService } from './psychology.service.js';

@Module({
  providers: [PsychologyService],
  exports: [PsychologyService],
})
export class PsychologyModule {}
