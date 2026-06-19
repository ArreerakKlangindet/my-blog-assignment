import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { Blog } from '../blogs/entities/blogs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Blog])],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
