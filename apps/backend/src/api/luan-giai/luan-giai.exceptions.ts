import { HttpException, HttpStatus } from '@nestjs/common';
import { DAILY_CHAPTER_QUOTA } from './luan-giai.constants';

export class ChapterQuotaExceededException extends HttpException {
  constructor() {
    super(
      `Bạn đã dùng hết ${DAILY_CHAPTER_QUOTA} lượt luận giải hôm nay. Mời bạn quay lại vào ngày mai.`,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
