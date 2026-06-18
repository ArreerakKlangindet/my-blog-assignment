import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { BlogImage } from './blogs-image.entity';
import { BlogStatus } from '../../common/enums/blogs-status.enum';

@Entity('blogs')
export class Blog extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
  })
  title!: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  slug!: string;

  @Column({
    type: 'text',
  })
  content!: string;

  @Column({
    type: 'text',
    name: 'cover_image_url',
    nullable: true,
  })
  coverImageUrl?: string | null;

  @Column({
    type: 'enum',
    enum: BlogStatus,
    default: BlogStatus.DRAFT,
  })
  status!: BlogStatus;

  @Column({
    type: 'int',
    name: 'view_count',
    default: 0,
  })
  viewCount!: number;

  @Column({
    type: 'uuid',
    name: 'author_id',
  })
  authorId!: string;

  @ManyToOne(() => User, (user) => user.blogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'author_id',
  })
  author!: User;

  @OneToMany(() => BlogImage, (blogImage) => blogImage.blog, {
    cascade: true,
  })
  images!: BlogImage[];

  @OneToMany(() => Comment, (comment) => comment.blog)
  comments!: Comment[];
}
