import { Injectable } from '@nestjs/common';
import { ProductService } from 'src/product/product.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    private readonly _productsService: ProductService,

    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
  ) {}
  async runSeed() {
    await this._deleteTables();

    const adminUser = await this._insertUsers();
    await this._insertAllNewProducts(adminUser);

    return 'Seed executed';
  }

  private async _deleteTables() {
    await this._productsService._deleteAllProducts();

    const queryBuilder = this._userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async _insertUsers() {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach((user) => {
      users.push(this._userRepository.create(user));
    });

    const dbUsers = await this._userRepository.save(seedUsers);

    return dbUsers[0];
  }

  private async _insertAllNewProducts(user: User) {
    await this._productsService._deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach((product) => {
      insertPromises.push(this._productsService.create(product, user));
    });

    await Promise.all(insertPromises);

    return true;
  }
}
