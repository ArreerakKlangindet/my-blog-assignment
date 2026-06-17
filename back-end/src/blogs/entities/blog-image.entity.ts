import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';
import { Blog } from './blog.entity';

@Entity('blog_images')
export class BlogImage extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
    name: 'file_name',
  })
  fileName!: string;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'file_path',
  })
  filePath!: string;

  @Column({
    type: 'int',
    name: 'display_order',
    default: 0,
  })
  displayOrder!: number;

  @Column({
    type: 'uuid',
    name: 'blog_id',
  })
  blogId!: string;

  @ManyToOne(() => Blog, (blog) => blog.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'blog_id',
  })
  blog!: Blog;
}
