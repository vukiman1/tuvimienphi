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

/**
 * Mô hình từ chối, hết ngân sách thời gian, hoặc ba lượt sinh lại đều không qua bộ kiểm. Người dùng
 * chỉ cần biết là thử lại sau; chi tiết vi phạm nằm ở log.
 */
export class ChapterGenerationFailedException extends HttpException {
  constructor() {
    super('Hệ thống đang bận, mời bạn thử lại sau ít phút.', HttpStatus.SERVICE_UNAVAILABLE);
  }
}
