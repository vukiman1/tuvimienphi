import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { isHttpContext } from '@org/backend-helpers';
import { Response } from 'express';
import { TypeORMError } from 'typeorm';

const UNIQUE_VIOLATION = '23505';

@Catch(TypeORMError)
export class TypeormExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TypeormExceptionFilter.name);

  catch(exception: TypeORMError, host: ArgumentsHost) {
    const code = exception['code'];

    if (!isHttpContext(host)) {
      this.logger.error(`${code ?? 'no code'}: ${exception.message}`);
      throw code === UNIQUE_VIOLATION
        ? new ConflictException('Resource already exists')
        : new InternalServerErrorException();
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let statusCode = 500;
    const message = exception['message'];
    const errors = {
      code,
      message,
    };
    if (code === UNIQUE_VIOLATION) {
      errors['message'] = exception['detail'];
      statusCode = 409;
    }
    return response.status(statusCode).json({
      statusCode,
      success: false,
      errors,
    });
  }
}
