import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';
import { Blog } from '../../blogs/entities/blogs.entity';
import { CommentStatus } from '../../common/enums/comment-status.enum';

@Entity('comments')
export class Comment extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 100,
    name: 'author_name',
  })
  authorName!: string;

  @Column({
    type: 'text',
  })
  content!: string;

  @Column({
    type: 'enum',
    enum: CommentStatus,
    default: CommentStatus.PENDING,
  })
  status!: CommentStatus;

  @Column({
    type: 'uuid',
    name: 'blog_id',
  })
  blogId!: string;

  @Column({
    type: 'varchar',
    length: 45,
    name: 'ip_address',
    nullable: true,
  })
  ipAddress?: string | null;

  @ManyToOne(() => Blog, (blog) => blog.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'blog_id',
  })
  blog!: Blog;
}
