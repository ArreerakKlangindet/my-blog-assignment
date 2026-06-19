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
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

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

  @Post(':id/upload-images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', 6, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(
            new BadRequestException(
              'Only image files (jpg, jpeg, png, webp) are allowed!',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadBlogImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: RequestWithUser,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const authorId = req.user.id;

    // 🛠️ ปรับลอจิกการเข้าถึงให้ปลอดภัยร้อยเปอร์เซ็นต์ตามกฎ ESLint
    const imageUrls = files.map(
      (file) => `http://localhost:3000/uploads/${file.filename}`,
    );

    const imagesResult = await this.blogsService.addBlogImages(
      id,
      imageUrls,
      authorId,
    );

    return {
      message: 'Additional images uploaded and saved successfully',
      count: imagesResult.length,
      images: imagesResult,
    };
  }

  @Delete('images/:imageId')
  @UseGuards(JwtAuthGuard)
  async deleteBlogImage(
    @Param('imageId') imageId: string,
    @Req() req: RequestWithUser,
  ) {
    const authorId = req.user.id;
    this.logger.log(
      `❌ User ${req.user.email} is attempting to delete sub-image ID: ${imageId}`,
    );
    return this.blogsService.removeBlogImage(imageId, authorId);
  }
}
