import { HttpException, HttpStatus } from '@nestjs/common';
import { DAILY_CHAPTER_QUOTA } from '../credits/credits.constants';

export class ChapterQuotaExceededException extends HttpException {
  constructor() {
    super(
      `Bạn đã dùng hết ${DAILY_CHAPTER_QUOTA} lượt miễn phí hôm nay.`,
      HttpStatus.PAYMENT_REQUIRED,
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
