import { HttpException, HttpStatus } from '@nestjs/common';

export class ChapterQuotaExceededException extends HttpException {
  constructor() {
    super('Bạn đã dùng hết lượt miễn phí hôm nay.', HttpStatus.PAYMENT_REQUIRED);
  }
}

export class ChapterGenerationFailedException extends HttpException {
  constructor() {
    super('Hệ thống đang bận, mời bạn thử lại sau ít phút.', HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class ViewYearRequiredException extends HttpException {
  constructor(order: string) {
    super(`Chương ${order} cần chọn năm xem.`, HttpStatus.BAD_REQUEST);
  }
}

export class InvalidViewYearException extends HttpException {
  constructor(viewYear: number) {
    super(`Năm xem ${viewYear} nằm ngoài khoảng tra được.`, HttpStatus.BAD_REQUEST);
  }
}
