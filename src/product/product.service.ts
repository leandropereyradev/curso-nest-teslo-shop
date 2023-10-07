import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import { ProductImage, Product } from './entities';

@Injectable()
export class ProductService {
  private readonly _logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly _productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly _productImageRepository: Repository<ProductImage>,

    private readonly _dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this._productRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this._productImageRepository.create({ url: image }),
        ),
      });
      await this._productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      this._handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this._productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });

    return products.map(({ images, ...rest }) => ({
      ...rest,
      images: images.map((img) => img.url),
    }));
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this._productRepository.findOneBy({ id: term });
    } else {
      // product = await this._productRepository.findOneBy({ slug: term });
      const queryBuilder = this._productRepository.createQueryBuilder('prod');

      product = await queryBuilder
        .where('LOWER(title) =LOWER(:title) or LOWER(slug) =LOWER(:slug)', {
          title: term,
          slug: term,
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product)
      throw new NotFoundException(`Product with "${term}" not found`);

    return product;
  }

  async findOneAndPlainImages(term: string) {
    const { images = [], ...rest } = await this.findOne(term);

    return {
      ...rest,
      images: images.map((img) => img.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...restToUpdate } = updateProductDto;

    const product = await this._productRepository.preload({
      id,
      ...restToUpdate,
    });

    if (!product)
      throw new NotFoundException(`Product with id: "${id}" not found`);

    // Query runner
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, {
          product: {
            id,
          },
        });

        product.images = images.map((img) =>
          this._productImageRepository.create({ url: img }),
        );
      }

      await queryRunner.manager.save(product);

      // await this._productRepository.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOneAndPlainImages(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this._handleDBExceptions(error);
    }
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

  async _deleteAllProducts() {
    const query = this._productRepository.createQueryBuilder('product');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this._handleDBExceptions(error);
    }
  }
}
