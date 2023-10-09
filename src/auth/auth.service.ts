import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,

    private readonly _jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this._userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this._userRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: this._getJwtToken({ email: user.email }),
      };
    } catch (error) {
      this._handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const { password, email } = loginUserDto;

      const user = await this._userRepository.findOne({
        where: { email },
        select: { email: true, password: true },
      });

      if (!user) throw new UnauthorizedException('Not valid credentials');

      if (!bcrypt.compareSync(password, user.password))
        throw new UnauthorizedException('Not valid credentials');

      return {
        ...user,
        token: this._getJwtToken({ email: user.email }),
      };
    } catch (error) {
      this._handleDBErrors(error);
    }
  }

  private _getJwtToken(payload: JwtPayload) {
    const token = this._jwtService.sign(payload);

    return token;
  }

  private _handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);

    throw new InternalServerErrorException('Please ckeck server logs');
  }
}
