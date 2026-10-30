import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ProductosModule } from '../productos/productos.module';
import { CarritoModule } from '../carrito/carrito.module';
import { PedidosModule } from '../pedidos/pedidos.module';
import { ImpresionesModule } from '../impresiones/impresiones.module';
import { InflacionModule } from '../inflacion/inflacion.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProductosModule,
    CarritoModule,
    PedidosModule,
    ImpresionesModule,
    InflacionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
