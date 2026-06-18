import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { Blog } from './entities/blogs.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogImage } from './entities/blogs-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Blog, BlogImage])],
  controllers: [BlogsController],
  providers: [BlogsService],
})
export class BlogsModule {}
