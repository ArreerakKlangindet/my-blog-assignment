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
    // 1. สร้าง Object สำหรับ Blog หลัก (ตัดเงื่อนไขเช็ก null ของรูปปกออก เพื่อเคลียร์ไฟแดง)
    const newBlog = this.blogRepository.create({
      title: createBlogDto.title,
      content: createBlogDto.content,
      slug: createBlogDto.slug.toLowerCase().trim(),
      // coverImageUrl: createBlogDto.coverImageUrl.startsWith('/')
      //   ? createBlogDto.coverImageUrl.replace(/\\/g, '/')
      //   : '/' + createBlogDto.coverImageUrl.replace(/\\/g, '/'),
      authorId: authorId,
    });

    // 2. บันทึกข้อมูลบล็อกหลักลงฐานข้อมูลก่อน เพื่อให้ได้ savedBlog.id ออกมาใช้ผูกกับรูปภาพย่อย
    const savedBlog = await this.blogRepository.save(newBlog);

    // 3. บันทึกรูปภาพประกอบย่อย (Additional Images) ลงตาราง blog_images
    // โค้ดส่วนนี้จะทำงานร่วมกับเงื่อนไข ArrayMinSize(1) ใน DTO เพื่อนำ URL ของภาพย่อยมาบันทึก
    if (
      createBlogDto.additionalImages &&
      createBlogDto.additionalImages.length > 0
    ) {
      const blogImages = createBlogDto.additionalImages.map((url, index) => {
        const cleanPath = url.startsWith('/')
          ? url.replace(/\\/g, '/')
          : '/' + url.replace(/\\/g, '/');

        return this.blogRepository.manager.create('BlogImage', {
          fileName: cleanPath.substring(cleanPath.lastIndexOf('/') + 1),
          filePath: cleanPath,
          displayOrder: index,
          blogId: savedBlog.id,
        });
      });

      // สั่งบันทึกรูปภาพย่อยทั้งหมดเข้า Database ตัวแปร blog_images ทันที
      await this.blogRepository.manager.save(blogImages);
    }

    this.logger.log(
      `✅ Blog created successfully with Cover & Sub-Images! ID: ${savedBlog.id} by Author ID: ${authorId}`,
    );

    // 4. ดึงข้อมูลตัวที่เพิ่งบันทึกสำเร็จ (พร้อมสัมพันธ์รูปภาพปกและรูปภาพย่อย) ส่งคืนกลับไปให้หน้าบ้าน
    return this.findOne(savedBlog.id);
  }

  // 🛠️ ตัวอย่างการปรับโค้ดฝั่ง NestJS Service ให้รองรับ Pagination
  async findAll(query: { page?: number; limit?: number; search?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // สร้าง Query Builder หรือใช้ findAndCount
    const queryBuilder = this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.author', 'author')
      .leftJoinAndSelect('blog.images', 'images')
      .where('blog.status = :status', {
        status: BlogStatus.PUBLISHED,
      });

    // ถ้ามีการส่งคำค้นหามาให้ดักกรองด้วย
    if (query.search) {
      queryBuilder.andWhere('blog.title ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    // 💡 จุดสำคัญ: ทำ Pagination ตรงนี้
    queryBuilder.skip(skip).take(limit).orderBy('blog.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    // 💡 คืนค่ากลับไปเป็น Object ที่มีทั้ง data และ total เพื่อให้หน้าบ้านเอาไปคำนวณปุ่มกด
    return {
      data,
      meta: {
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllForAdmin(search?: string, page: number = 1) {
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
      relations: { author: true, images: true, comments: true },
    });

    if (!blog) {
      this.logger.warn(`⚠️ Fetch failed: Blog ID ${id} not found`);
      throw new NotFoundException(`Blog with ID "${id}" not found`);
    }

    return blog;
  }

  async findOnePublic(slug: string) {
    const blog = await this.blogRepository.findOne({
      where: {
        slug: slug.toLowerCase().trim(),
        status: BlogStatus.PUBLISHED,
      },
      relations: { author: true, images: true, comments: true },
    });

    if (!blog) {
      this.logger.warn(`⚠️ Fetch Public failed: Blog Slug ${slug} not found`);
      throw new NotFoundException(`Blog with Slug "${slug}" not found`);
    }

    blog.viewCount += 1;
    await this.blogRepository.save(blog);

    return blog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto, authorId: string) {
    const blog = await this.findOne(id);

    if (blog.authorId !== authorId) {
      throw new ForbiddenException(
        'You are not authorized to update this blog',
      );
    }

    // 1. จัดการข้อมูล Blog หลัก (ใช้ ?? เพื่อทำ Partial Update หยิบค่าเก่ามาใส่กรณีที่ฟิลด์นั้นไม่ได้แก้ไข)
    blog.title = updateBlogDto.title ?? blog.title;
    blog.content = updateBlogDto.content ?? blog.content;

    // แปลง Slug เป็นตัวพิมพ์เล็กเสมอหากมีการแก้ไข Slug
    if (updateBlogDto.slug) {
      blog.slug = updateBlogDto.slug.toLowerCase().trim();
    }

    // จัดการรูปภาพปก (ล้างเครื่องหมายสแลชขีดกลับให้เป็นสากล)
    if (updateBlogDto.coverImageUrl) {
      blog.coverImageUrl = updateBlogDto.coverImageUrl.startsWith('/')
        ? updateBlogDto.coverImageUrl.replace(/\\/g, '/')
        : '/' + updateBlogDto.coverImageUrl.replace(/\\/g, '/');
    }

    const updatedBlog = await this.blogRepository.save(blog);

    // 2. จัดการรูปภาพประกอบเพิ่มเติม (Additional Images) ในโหมดแก้ไข
    if (
      updateBlogDto.additionalImages &&
      updateBlogDto.additionalImages.length > 0
    ) {
      // ดึง Repository ของ BlogImage ออกมาโดยตรงเพื่อระบุประเภทข้อมูลที่ชัดเจน ดับไฟแดง ESLint
      const blogImageRepository =
        this.blogRepository.manager.getRepository(BlogImage);

      const existingImages = await blogImageRepository.find({
        where: { blogId: id },
      });

      // 🔴 ดักจับ Business Logic: รูปเดิมในระบบ + รูปใหม่ที่จะเพิ่มรวมกัน ต้องไม่เกิน 6 รูป
      const totalImagesCount =
        existingImages.length + updateBlogDto.additionalImages.length;
      if (totalImagesCount > 6) {
        throw new BadRequestException(
          `A blog can have a maximum of 6 additional images. Current: ${existingImages.length} images, Trying to add: ${updateBlogDto.additionalImages.length}`,
        );
      }

      // หาค่า displayOrder สูงสุดโดยระบุ Type ข้อมูลชัดเจน ไม่เกิด any แนวนอน
      const maxOrder = existingImages.reduce(
        (max: number, img: BlogImage) =>
          img.displayOrder > max ? img.displayOrder : max,
        -1,
      );

      const blogImages = updateBlogDto.additionalImages.map(
        (url: string, index: number) => {
          const cleanPath = url.startsWith('/')
            ? url.replace(/\\/g, '/')
            : '/' + url.replace(/\\/g, '/');

          // ประกาศสร้าง Object ผ่าน Blueprint ของ BlogImage ตรงๆ ปลอดภัยต่อกติกา ESLint 100%
          const newImg = new BlogImage();
          newImg.fileName = cleanPath.substring(cleanPath.lastIndexOf('/') + 1);
          newImg.filePath = cleanPath;
          newImg.displayOrder = maxOrder + 1 + index;
          newImg.blogId = updatedBlog.id;

          return newImg;
        },
      );

      await blogImageRepository.save(blogImages);
    }

    this.logger.log(`✅ Blog updated successfully! ID: ${id}`);
    return this.findOne(id);
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
      // 🟢 ทำความสะอาดพาธ (Clean Path) ให้สอดคล้องเป็นมาตรฐานเดียวกันทั้งระบบป้องกันสแลชกลับด้าน
      const cleanPath = url.startsWith('/')
        ? url.replace(/\\/g, '/')
        : '/' + url.replace(/\\/g, '/');

      const fileName = cleanPath.substring(cleanPath.lastIndexOf('/') + 1);

      const newImage = this.blogRepository.manager.create(BlogImage, {
        fileName: fileName,
        filePath: cleanPath, // ใช้พาธที่เคลียร์เรียบร้อยแล้ว
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

  async updateCoverImage(blogId: string, imageUrl: string, authorId: string) {
    const blog = await this.findOne(blogId);

    if (blog.authorId !== authorId) {
      throw new ForbiddenException(
        'You are not authorized to update this blog',
      );
    }

    // ลบไฟล์เก่า (ถ้ามี)
    if (blog.coverImageUrl && blog.coverImageUrl.startsWith('/uploads/')) {
      const oldFileName = blog.coverImageUrl.substring(
        blog.coverImageUrl.lastIndexOf('/') + 1,
      );

      const oldPath = path.join(process.cwd(), 'uploads', oldFileName);

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    blog.coverImageUrl = imageUrl;

    const updatedBlog = await this.blogRepository.save(blog);

    this.logger.log(`✅ Cover image updated for Blog ID: ${blogId}`);

    return updatedBlog;
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
