import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentStatus } from '../common/enums/comment-status.enum';
import { Blog } from '../blogs/entities/blogs.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  async create(
    blogId: string,
    createCommentDto: CreateCommentDto,
    ipAddress: string,
  ) {
    const blogExists = await this.blogRepository.findOne({
      where: { id: blogId },
    });
    if (!blogExists) {
      throw new NotFoundException(
        'ไม่พบข้อมูล Blog ที่คุณต้องการแสดงความคิดเห็น',
      );
    }

    const comment = this.commentRepository.create({
      authorName: createCommentDto.authorName,
      content: createCommentDto.content,
      blogId: blogId,
      ipAddress: ipAddress,
      status: CommentStatus.PENDING,
    });
    return await this.commentRepository.save(comment);
  }

  async findAllApprovedByBlog(blogId: string) {
    return await this.commentRepository.find({
      where: {
        blogId,
        status: CommentStatus.APPROVED,
      },
      order: { createdAt: 'ASC' },
    });
  }

  async adminFindAll(userRole: string) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'สิทธิ์ของแอดมินเท่านั้นในการเข้าดูหน้าควบคุมนี้',
      );
    }

    return await this.commentRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: CommentStatus, userRole: string) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'สิทธิ์ของแอดมินเท่านั้นในการจัดการสถานะคอมเมนต์',
      );
    }

    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('ไม่พบความคิดเห็นที่ระบุในระบบ');
    }

    comment.status = status;
    return await this.commentRepository.save(comment);
  }
}
