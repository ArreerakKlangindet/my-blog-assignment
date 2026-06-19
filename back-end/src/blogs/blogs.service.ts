import * as fs from 'fs';
import * as path from 'path';
import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Blog } from './entities/blogs.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogStatus } from '../common/enums/blogs-status.enum';
import { BlogImage } from './entities/blogs-image.entity';

@Injectable()
export class BlogsService {
  private readonly logger = new Logger(BlogsService.name);

  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  async create(createBlogDto: CreateBlogDto, authorId: string) {
    const newBlog = this.blogRepository.create({
      title: createBlogDto.title,
      content: createBlogDto.content,
      slug: createBlogDto.slug.toLowerCase().trim(),
      coverImageUrl: createBlogDto.coverImageUrl || null,
      authorId: authorId,
    });

    const savedBlog = await this.blogRepository.save(newBlog);

    if (
      createBlogDto.additionalImages &&
      createBlogDto.additionalImages.length > 0
    ) {
      savedBlog.images = createBlogDto.additionalImages.map((url, index) => {
        return {
          filePath: url,
          fileName: `image-${index + 1}`,
          displayOrder: index + 1,
          blogId: savedBlog.id,
        } as unknown as Blog['images'][number];
      });

      await this.blogRepository.save(savedBlog);
    }

    this.logger.log(
      `✅ Blog created successfully with Custom Slug! ID: ${savedBlog.id} by Author ID: ${authorId}`,
    );
    return this.findOne(savedBlog.id);
  }

  async findAll(search?: string, page: number = 1) {
    const limit = 10;
    const skip = (page - 1) * limit;

    const whereCondition: FindOptionsWhere<Blog> = {};

    if (search) {
      whereCondition.title = ILike(`%${search}%`);
    }

    const [data, total] = await this.blogRepository.findAndCount({
      where: whereCondition,
      relations: { author: true, images: true },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
    });

    return {
      data,
      meta: {
        totalItems: total,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: { author: true, images: true },
    });

    if (!blog) {
      this.logger.warn(`⚠️ Fetch failed: Blog ID ${id} not found`);
      throw new NotFoundException(`Blog with ID "${id}" not found`);
    }

    return blog;
  }

  async findOnePublic(id: string) {
    const blog = await this.findOne(id);

    blog.viewCount += 1;

    await this.blogRepository.save(blog);

    return blog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto, authorId: string) {
    const blog = await this.findOne(id);

    if (blog.authorId !== authorId) {
      this.logger.warn(
        `🔒 Unauthorized update attempt on Blog ID ${id} by User ID ${authorId}`,
      );
      throw new ForbiddenException(
        'You are not authorized to update this blog',
      );
    }

    if (updateBlogDto.slug) {
      updateBlogDto.slug = updateBlogDto.slug.toLowerCase().trim();
    }

    Object.assign(blog, updateBlogDto);
    const updatedBlog = await this.blogRepository.save(blog);
    this.logger.log(
      `✅ Blog ID ${id} updated successfully by User ID ${authorId}`,
    );
    return updatedBlog;
  }

  async remove(id: string, authorId: string) {
    const blog = await this.findOne(id);

    if (blog.authorId !== authorId) {
      this.logger.warn(
        `🔒 Unauthorized delete attempt on Blog ID ${id} by User ID ${authorId}`,
      );
      throw new ForbiddenException(
        'You are not authorized to delete this blog',
      );
    }

    await this.blogRepository.remove(blog);
    this.logger.log(
      `Blog ID ${id} deleted successfully by User ID ${authorId}`,
    );

    return { message: 'Blog deleted successfully' };
  }

  async togglePublish(id: string, authorId: string) {
    const blog = await this.findOne(id);

    if (blog.authorId !== authorId) {
      throw new ForbiddenException(
        'You are not authorized to change status of this blog',
      );
    }

    blog.status =
      blog.status === BlogStatus.PUBLISHED
        ? BlogStatus.UNPUBLISHED
        : BlogStatus.PUBLISHED;

    const updatedBlog = await this.blogRepository.save(blog);
    this.logger.log(
      `📢 Blog ID ${id} status changed to: ${updatedBlog.status}`,
    );
    return updatedBlog;
  }

  async addBlogImages(
    blogId: string,
    imageUrls: string[],
    authorId: string,
  ): Promise<BlogImage[]> {
    const blog = await this.findOne(blogId);

    if (blog.authorId !== authorId) {
      throw new ForbiddenException(
        'You are not authorized to add images to this blog',
      );
    }

    const currentCount = blog.images ? blog.images.length : 0;
    if (currentCount + imageUrls.length > 6) {
      throw new BadRequestException(
        `A blog can have a maximum of 6 additional images. Current: ${currentCount} images, Trying to add: ${imageUrls.length}`,
      );
    }

    const savedImages: BlogImage[] = [];
    let order = currentCount;

    for (const url of imageUrls) {
      const fileName = url.substring(url.lastIndexOf('/') + 1);

      const newImage = this.blogRepository.manager.create(BlogImage, {
        fileName: fileName,
        filePath: url,
        displayOrder: order + 1,
        blogId: blogId,
      });

      const savedImg = await this.blogRepository.manager.save(
        BlogImage,
        newImage,
      );
      savedImages.push(savedImg);
      order++;
    }

    this.logger.log(
      `✅ Successfully uploaded ${imageUrls.length} images for Blog ID: ${blogId}`,
    );
    return savedImages;
  }

  async removeBlogImage(imageId: string, authorId: string) {
    const blogImage = await this.blogRepository.manager.findOne(BlogImage, {
      where: { id: imageId },
    });

    if (!blogImage) {
      throw new NotFoundException(`Image with ID "${imageId}" not found`);
    }

    const blog = await this.findOne(blogImage.blogId);
    if (blog.authorId !== authorId) {
      throw new ForbiddenException(
        'You are not authorized to delete this image',
      );
    }

    if (blogImage.fileName) {
      const filePath = path.join(process.cwd(), 'uploads', blogImage.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await this.blogRepository.manager.remove(BlogImage, blogImage);

    this.logger.log(
      `❌ Successfully deleted sub-image ID: ${imageId} from Blog ID: ${blogImage.blogId}`,
    );
    return { message: 'Image deleted successfully' };
  }
}
