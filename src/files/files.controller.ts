import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { fileFilter, fileNamer } from './helpers';
import { diskStorage } from 'multer';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly _filesService: FilesService,
    private readonly _configService: ConfigService,
  ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ) {
    const path = this._filesService.getStaticProductImage(imageName);

    res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      // limits: {fieldSize: 1000},
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Make sure that file is an image');

    const secureUrl = `${this._configService.get('HOST_API')}/files/product/${
      file.filename
    }`;

    return {
      secureUrl,
    };
  }
}
