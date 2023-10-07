import { Injectable } from '@nestjs/common';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class SeedService {
  constructor(private readonly _productsService: ProductService) {}
  async runSeed() {
    await this._insertAllNewProducts();

    return 'Seed executed';
  }

  private async _insertAllNewProducts() {
    await this._productsService._deleteAllProducts();

    return true;
  }
}
