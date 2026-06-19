import { IsEnum, IsNotEmpty } from 'class-validator';
import { CommentStatus } from '../../common/enums/comment-status.enum';

export class UpdateCommentStatusDto {
  @IsNotEmpty({ message: 'โปรดระบุสถานะที่ต้องการอัปเดต' })
  @IsEnum(CommentStatus, {
    message: 'สถานะต้องเป็น APPROVED หรือ REJECTED เท่านั้น',
  })
  status!: CommentStatus;
}
