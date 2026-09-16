import { OkResponse } from '@org/backend-base';
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, getSchemaPath } from '@nestjs/swagger';
import { UserType } from './interfaces/auth.interface';
import { UserEntity } from '../user/entities/user.entity';

const loginResponse = () => ({
  properties: {
    result: {
      type: 'array',
      items: {
        properties: {
          user: {
            $ref: getSchemaPath(UserEntity),
          },
          accessToken: { example: 'string' },
        },
      },
    },
  },
});
export function ApiLogin(userType: UserType) {
  return applyDecorators(
    ApiOperation({ summary: 'Login for ' + userType }),
    OkResponse(null, false, loginResponse()),
  );
}

export function ApiRefreshToken(userType: UserType) {
  return applyDecorators(
    ApiOperation({ summary: 'Refresh token for ' + userType }),
    OkResponse(null, false, loginResponse()),
  );
}

export function ApiLogoutAll(userType: UserType) {
  return applyDecorators(
    ApiOperation({ summary: 'Logout from all devices for ' + userType }),
    OkResponse(null),
  );
}

export function ApiChangePassword(userType: UserType) {
  return applyDecorators(
    ApiOperation({ summary: 'Change password for ' + userType }),
    OkResponse(UserEntity),
  );
}
