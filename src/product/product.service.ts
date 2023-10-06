import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

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

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this._productRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const product = await this._productRepository.findOneBy({ id });

    if (!product)
      throw new NotFoundException(`Product with id: "${id}" not found`);

    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    await this._productRepository.remove(product);
  }

  private _handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this._logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error. Check Server logs',
    );
  }
}
