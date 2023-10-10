import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SeedService } from './seed.service';
// import { Auth } from 'src/auth/decorators/auth.decorator';
// import { ValidRoles } from 'src/auth/interfaces/valid-roles.enum';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  // @Auth(ValidRoles.admin)
  excecuteSeed() {
    return this.seedService.runSeed();
  }
}
