import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';

export class UnsupportedAvatarTypeException extends BadRequestException {
  constructor() {
    super('Avatar must be a JPEG, PNG or WebP image');
  }
}

export class AvatarUploadUnavailableException extends ServiceUnavailableException {
  constructor() {
    super('Avatar uploads are not available right now');
  }
}
