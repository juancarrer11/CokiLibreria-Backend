import { Injectable } from '@nestjs/common';
import { CreateImpresionDto } from './dto/create-impresion.dto';
import { UpdateImpresionDto } from './dto/update-impresion.dto';

@Injectable()
export class ImpresionesService {
  create(createImpresionDto: CreateImpresionDto) {
    return 'This action adds a new impresion';
  }

  findAll() {
    return `This action returns all impresiones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} impresion`;
  }

  update(id: number, updateImpresionDto: UpdateImpresionDto) {
    return `This action updates a #${id} impresion`;
  }

  remove(id: number) {
    return `This action removes a #${id} impresion`;
  }
}
