import {
  IsNotEmpty,
  IsString,
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
  Length,
  Matches,
  IsOptional,
} from 'class-validator';

export class UpdateBlogDto {
  @IsOptional() // แอดมินไม่แก้ไขหัวข้อก็ได้ แต่ถ้าส่งมาห้ามเป็นค่าว่าง
  @IsNotEmpty({ message: 'Title cannot be empty if provided' })
  @IsString({ message: 'Title must be a string' })
  @Length(3, 255, { message: 'Title must be between 3 and 255 characters' })
  title?: string;

  @IsOptional() // แอดมินไม่แก้ไขเนื้อหาก็ได้ แต่ถ้าส่งมาห้ามเป็นค่าว่าง
  @IsNotEmpty({ message: 'Content cannot be empty if provided' })
  @IsString({ message: 'Content must be a string' })
  content?: string;

  @IsOptional() // แอดมินไม่แก้ไข URL Slug ก็ได้ แต่ถ้าส่งมาห้ามเป็นค่าว่างและต้องผ่าน Regex
  @IsNotEmpty({ message: 'Slug cannot be empty if provided' })
  @IsString({ message: 'Slug must be a string' })
  @Length(3, 255, { message: 'Slug must be between 3 and 255 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Slug must contain only alphanumeric characters, underscores or hyphens',
  })
  slug?: string;

  @IsOptional() // แอดมินไม่เปลี่ยนรูปปกก็ได้ แต่ถ้าส่งมาห้ามเป็นค่าว่าง
  @IsNotEmpty({ message: 'Cover image URL cannot be empty if provided' })
  @IsString({ message: 'Cover image URL must be a string' })
  coverImageUrl?: string;

  @IsOptional() // ถ้าหน้าบ้านไม่ได้เพิ่มรูปย่อย จะส่งเป็น Array ว่าง [] หรือไม่ส่งมาเลยก็เซฟผ่าน
  @IsArray({ message: 'Additional images must be an array' })
  @IsString({ each: true, message: 'Each image URL must be a string' })
  @ArrayMinSize(1, {
    message: 'Must provide at least 1 additional image if updating images',
  })
  @ArrayMaxSize(6, { message: 'Cannot exceed 6 additional images' })
  additionalImages?: string[];
}
