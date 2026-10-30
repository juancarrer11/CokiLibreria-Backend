import { Controller } from '@nestjs/common';
import { InflacionService } from './inflacion.service';

@Controller('inflacion')
export class InflacionController {
  constructor(private readonly inflacionService: InflacionService) {}
}
