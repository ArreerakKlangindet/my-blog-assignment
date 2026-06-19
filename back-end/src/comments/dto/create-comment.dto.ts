import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({ message: 'โปรดระบุชื่อผู้ส่ง (authorName)' })
  @IsString({ message: 'ชื่อผู้ส่งต้องเป็นข้อความเท่านั้น' })
  @Length(2, 50, { message: 'ชื่อผู้ส่งต้องมีความยาว 2 ถึง 50 ตัวอักษร' })
  authorName!: string;

  @IsNotEmpty({ message: 'โปรดกรอกข้อความแสดงความคิดเห็น (content)' })
  @IsString({ message: 'ข้อความคอมเมนต์ต้องเป็นตัวอักษรเท่านั้น' })
  // 🇹🇭 Validate content to accept ONLY Thai letters, numbers (Thai/Arabic), and whitespace
  @Matches(/^[ก-๙๐-๙\s0-9]+$/, {
    message:
      'ข้อความ Comment ต้องเป็นภาษาไทย และ/หรือ ตัวเลขเท่านั้น (ห้ามใช้ภาษาอังกฤษหรืออักขระพิเศษ)',
  })
  content!: string;
}
