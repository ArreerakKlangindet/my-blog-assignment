import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  Logger,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('blogs')
export class BlogsController {
  private readonly logger = new Logger(BlogsController.name);

  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createBlogDto: CreateBlogDto, @Req() req: RequestWithUser) {
    const authorId = req.user.id;
    this.logger.log(
      `📝 User ${req.user.email} is attempting to create a new blog`,
    );
    return this.blogsService.create(createBlogDto, authorId);
  }

  @Get()
  findAll(@Query('search') search?: string, @Query('page') page?: string) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    this.logger.log(
      `🌐 Fetching blogs - Search Query: "${search || 'none'}", Page: ${pageNumber}`,
    );
    return this.blogsService.findAll(search, pageNumber);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log(`🌐 Fetching blog with ID: ${id}`);
    return this.blogsService.findOnePublic(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @Req() req: RequestWithUser,
  ) {
    const authorId = req.user.id;
    this.logger.log(
      `✏️ User ${req.user.email} is attempting to update blog ID: ${id}`,
    );
    return this.blogsService.update(id, updateBlogDto, authorId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const authorId = req.user.id;
    this.logger.log(
      `❌ User ${req.user.email} is attempting to delete blog ID: ${id}`,
    );
    return this.blogsService.remove(id, authorId);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  togglePublish(@Param('id') id: string, @Req() req: RequestWithUser) {
    const authorId = req.user.id;
    return this.blogsService.togglePublish(id, authorId);
  }
}
