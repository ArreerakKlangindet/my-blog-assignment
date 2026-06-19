import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentStatusDto } from './dto/update-comment-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // URL: POST /blogs/:blogId/comments
  @Post('blogs/:blogId/comments')
  create(
    @Param('blogId') blogId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || '';
    return this.commentsService.create(blogId, createCommentDto, ipAddress);
  }

  // URL: GET /blogs/:blogId/comments
  @Get('blogs/:blogId/comments')
  findAllByBlog(@Param('blogId') blogId: string) {
    return this.commentsService.findAllApprovedByBlog(blogId);
  }

  // URL: GET /admin/comments
  @Get('admin/comments')
  @UseGuards(JwtAuthGuard)
  adminGetComments(@Req() req: RequestWithUser) {
    return this.commentsService.adminFindAll(req.user.role);
  }

  // URL: PATCH /admin/comments/:id/status
  @Patch('admin/comments/:id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateCommentStatusDto,
    @Req() req: RequestWithUser,
  ) {
    return this.commentsService.updateStatus(
      id,
      updateStatusDto.status,
      req.user.role,
    );
  }
}
