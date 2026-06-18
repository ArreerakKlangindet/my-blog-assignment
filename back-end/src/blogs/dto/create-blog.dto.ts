import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ArrayMaxSize,
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
  @Matches(/^[a-zA-Z0-9ก-๙_-]+$/, {
    message:
      'Slug must contain only alphanumeric characters, underscores or hyphens',
  })
  slug!: string;

  @IsOptional()
  @IsString({ message: 'Cover image URL must be a string' })
  coverImageUrl?: string;

  @IsOptional()
  @IsArray({ message: 'Additional images must be an array of strings' })
  @IsString({
    each: true,
    message: 'Each additional image URL must be a string',
  })
  @ArrayMaxSize(6, { message: 'You can add at most 6 additional images' })
  additionalImages?: string[];
}
