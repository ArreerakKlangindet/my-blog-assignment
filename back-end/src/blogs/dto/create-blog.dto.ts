import {
  IsNotEmpty,
  IsString,
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
  Length,
  Matches,
} from 'class-validator';

export class CreateBlogDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @Length(3, 255, { message: 'Title must be between 3 and 255 characters' })
  title!: string;

  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  content!: string;

  @IsNotEmpty({ message: 'Slug is required' })
  @IsString({ message: 'Slug must be a string' })
  @Length(3, 255, { message: 'Slug must be between 3 and 255 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Slug must contain only alphanumeric characters, underscores or hyphens',
  })
  slug!: string;

  @IsNotEmpty({
    message: 'กรุณาอัปโหลดรูปภาพปกบทความ (Cover image is required)',
  })
  @IsString({ message: 'Cover image URL must be a string' })
  coverImageUrl!: string;

  @IsNotEmpty({
    message: 'กรุณาอัปโหลดรูปภาพประกอบเพิ่มเติมอย่างน้อย 1 รูป',
  })
  @IsArray({ message: 'Additional images must be an array of strings' })
  @IsString({
    each: true,
    message: 'Each additional image URL must be a string',
  })
  @ArrayMinSize(1, {
    message: 'ต้องมีรูปภาพประกอบเพิ่มเติมอย่างน้อย 1 รูป',
  })
  @ArrayMaxSize(6, { message: 'Maximum 6 additional images allowed' })
  additionalImages!: string[];
}
