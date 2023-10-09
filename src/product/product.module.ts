import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/auth/auth.module';

import { ProductService } from './product.service';
import { ProductController } from './product.controller';

import { Product, ProductImage } from './entities';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [TypeOrmModule.forFeature([Product, ProductImage]), AuthModule],
  exports: [ProductService, TypeOrmModule],
})
export class ProductModule {}
