import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Blog } from './entities/blogs.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogStatus } from '../common/enums/blogs-status.enum';

@Injectable()
export class BlogsService {
  private readonly logger = new Logger(BlogsService.name);

  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  /**
   * 📝 4. [Admin] Create a new blog with a cover image and up to 6 additional sub-images
   */
  async create(createBlogDto: CreateBlogDto, authorId: string) {
    const newBlog = this.blogRepository.create({
      title: createBlogDto.title,
      content: createBlogDto.content,
      slug: createBlogDto.slug.toLowerCase().trim(),
      coverImageUrl: createBlogDto.coverImageUrl || null,
      authorId: authorId,
    });

    const savedBlog = await this.blogRepository.save(newBlog);

    // 🛠️ Fixed ESLint @typescript-eslint/no-unsafe-assignment by mapping explicitly without 'any'
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
        } as unknown as Blog['images'][number]; // Cast safely using the entity's relation property type
      });

      await this.blogRepository.save(savedBlog);
    }

    this.logger.log(
      `✅ Blog created successfully with Custom Slug! ID: ${savedBlog.id} by Author ID: ${authorId}`,
    );
    return this.findOne(savedBlog.id);
  }

  /**
   * 🌐 1. Public Blog List (Supports searching by title & pagination limiting 10 items per page)
   */
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

  /**
   * 🔍 2. Public Blog Detail (Fetches all sub-images and increments viewCount by 1 automatically)
   */
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

  /**
   * ✏️ 4. [Admin] Update blog content or customize URL Slug
   */
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

  /**
   * ❌ 4. [Admin] Delete a blog from the database
   */
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

  /**
   * 📢 4. [Admin] Toggle status between PUBLISHED and UNPUBLISHED
   */
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
}
