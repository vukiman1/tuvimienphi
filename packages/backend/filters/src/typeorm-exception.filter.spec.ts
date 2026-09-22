import {
  ConflictException,
  InternalServerErrorException,
  type ArgumentsHost,
} from '@nestjs/common';
import { TypeORMError } from 'typeorm';
import { TypeormExceptionFilter } from './typeorm-exception.filter';

const CHI_TIET_RO_RI = 'Key (email)=(someone@example.com) already exists.';

function loiTrungKhoa(): TypeORMError {
  const error = new TypeORMError(
    'duplicate key value violates unique constraint "users_email_key"',
  );
  Object.assign(error, { code: '23505', detail: CHI_TIET_RO_RI });
  return error;
}

function hostHttp() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    getType: () => 'http',
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;
  return { host, json };
}

function hostGraphql(): ArgumentsHost {
  return {
    getType: () => 'graphql',
    switchToHttp: () => ({ getResponse: () => undefined }),
  } as unknown as ArgumentsHost;
}

describe('TypeormExceptionFilter', () => {
  it('nhánh HTTP vẫn rò chi tiết Postgres — nợ kỹ thuật, xem roadmap 08', () => {
    const { host, json } = hostHttp();

    new TypeormExceptionFilter().catch(loiTrungKhoa(), host);

    expect(json).toHaveBeenCalledWith({
      statusCode: 409,
      success: false,
      errors: { code: '23505', message: CHI_TIET_RO_RI },
    });
  });

  it('không đẩy chi tiết của Postgres sang transport khác', () => {
    let nemRa: unknown;

    try {
      new TypeormExceptionFilter().catch(loiTrungKhoa(), hostGraphql());
    } catch (error) {
      nemRa = error;
    }

    expect(nemRa).toBeInstanceOf(ConflictException);
    expect((nemRa as Error).message).toBe('Resource already exists');
  });

  it('giấu luôn thông báo của mọi lỗi cơ sở dữ liệu khác', () => {
    const error = new TypeORMError('relation "users" does not exist');
    let nemRa: unknown;

    try {
      new TypeormExceptionFilter().catch(error, hostGraphql());
    } catch (caught) {
      nemRa = caught;
    }

    expect(nemRa).toBeInstanceOf(InternalServerErrorException);
    expect((nemRa as Error).message).toBe('Internal Server Error');
  });
});
