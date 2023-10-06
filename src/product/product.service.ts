import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  private readonly _logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly _productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this._productRepository.create(createProductDto);
      await this._productRepository.save(product);

      return product;
    } catch (error) {
      this._handleDBExceptions(error);
    }
  }

  findAll() {
    return `This action returns all product`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  private _handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this._logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error. Check Server logs',
    );
  }
}
