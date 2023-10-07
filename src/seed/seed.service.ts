import { Injectable } from '@nestjs/common';
import { ProductService } from 'src/product/product.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly _productsService: ProductService) {}
  async runSeed() {
    await this._insertAllNewProducts();

    return 'Seed executed';
  }

  private async _insertAllNewProducts() {
    await this._productsService._deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach((product) => {
      insertPromises.push(this._productsService.create(product));
    });

    await Promise.all(insertPromises);

    return true;
  }
}
