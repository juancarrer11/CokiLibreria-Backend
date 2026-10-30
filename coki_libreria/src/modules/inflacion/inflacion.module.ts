import { Module } from '@nestjs/common';
import { InflacionController } from './inflacion.controller';
import { InflacionService } from './inflacion.service';

@Module({
  controllers: [InflacionController],
  providers: [InflacionService],
  exports: [InflacionService],
})
export class InflacionModule {}
