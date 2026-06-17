import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { BlogImage } from '../blogs/entities/blog-image.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([BlogImage])],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
