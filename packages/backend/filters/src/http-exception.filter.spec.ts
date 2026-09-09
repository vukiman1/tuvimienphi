import { HttpException, HttpStatus, type ArgumentsHost } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

function dungHost() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe('HttpExceptionFilter', () => {
  it('giữ được thông báo khi ngoại lệ dựng tay từ một chuỗi', () => {
    const { host, json } = dungHost();

    new HttpExceptionFilter().catch(
      new HttpException('Hệ thống đang bận, mời bạn thử lại sau.', HttpStatus.SERVICE_UNAVAILABLE),
      host,
    );

    expect(json).toHaveBeenCalledWith({
      statusCode: 503,
      success: false,
      errors: { message: 'Hệ thống đang bận, mời bạn thử lại sau.' },
    });
  });

  it('giữ được thông báo khi ngoại lệ mang object như các lớp sẵn của Nest', () => {
    const { host, json } = dungHost();

    new HttpExceptionFilter().catch(
      new HttpException({ statusCode: 429, message: 'Hết lượt hôm nay.' }, 429),
      host,
    );

    expect(json).toHaveBeenCalledWith({
      statusCode: 429,
      success: false,
      errors: { message: 'Hết lượt hôm nay.' },
    });
  });
});
