import { Module } from '@nestjs/common';
import { ImpresionesController } from './impresiones.controller';
import { ImpresionesService } from './impresiones.service';

@Module({
  controllers: [ImpresionesController],
  providers: [ImpresionesService],
  exports: [ImpresionesService],
})
export class ImpresionesModule {}
