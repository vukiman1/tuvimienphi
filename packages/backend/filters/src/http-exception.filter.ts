import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

/**
 * `getResponse()` trả về hai hình dạng khác nhau: các lớp có sẵn của Nest cho ra object
 * `{ statusCode, message, error }`, còn `new HttpException('chuỗi', status)` dựng tay thì cho ra
 * đúng chuỗi đó. Đọc thẳng `payload['message']` nên nuốt mất thông báo của dạng thứ hai — client
 * nhận `errors: {}` và không biết vì sao bị từ chối.
 */
function messageOf(payload: string | object): string | undefined {
  if (typeof payload === 'string') return payload;
  const message = (payload as { message?: unknown }).message;
  return typeof message === 'string' ? message : undefined;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode = exception.getStatus();
    const payload = exception.getResponse();

    if (exception.name === 'BadRequestException') {
      return response.status(400).json({ statusCode: 400, success: false, errors: payload });
    }

    return response
      .status(statusCode)
      .json({ statusCode, success: false, errors: { message: messageOf(payload) } });
  }
}
