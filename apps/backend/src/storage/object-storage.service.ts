import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ObjectStorageError, StorageNotConfiguredError } from './storage.errors';

const IMMUTABLE_CACHE_CONTROL = 'public, max-age=31536000, immutable';
const CHECKSUM_WHEN_REQUIRED = 'WHEN_REQUIRED';

export interface PutPublicObjectParams {
  key: string;
  body: Buffer;
  contentType: string;
}

@Injectable()
export class ObjectStorageService {
  private readonly logger = new Logger(ObjectStorageService.name);
  private readonly client: S3Client | null;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(configService: ConfigService) {
    const endpoint = configService.get<string>('storage.endpoint') ?? '';
    const region = configService.get<string>('storage.region') ?? '';
    const accessKeyId = configService.get<string>('storage.accessKeyId') ?? '';
    const secretAccessKey = configService.get<string>('storage.secretAccessKey') ?? '';
    this.bucket = configService.get<string>('storage.mediaBucket') ?? '';
    this.publicUrl = (configService.get<string>('storage.mediaPublicUrl') ?? '').replace(
      /\/+$/,
      '',
    );

    const hasEverySetting = [
      endpoint,
      accessKeyId,
      secretAccessKey,
      this.bucket,
      this.publicUrl,
    ].every(Boolean);
    this.client = hasEverySetting
      ? new S3Client({
          endpoint,
          region,
          credentials: { accessKeyId, secretAccessKey },
          requestChecksumCalculation: CHECKSUM_WHEN_REQUIRED,
          responseChecksumValidation: CHECKSUM_WHEN_REQUIRED,
        })
      : null;

    if (!this.client) {
      this.logger.warn('R2 media storage is not configured — uploads will be refused');
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async putPublicObject({ key, body, contentType }: PutPublicObjectParams): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: IMMUTABLE_CACHE_CONTROL,
    });
    const client = this.requireClient();
    try {
      await client.send(command);
    } catch (error) {
      throw new ObjectStorageError('upload', key, error);
    }
    return `${this.publicUrl}/${key}`;
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({ Bucket: this.bucket, Key: key });
    const client = this.requireClient();
    try {
      await client.send(command);
    } catch (error) {
      throw new ObjectStorageError('delete', key, error);
    }
  }

  keyFromPublicUrl(url: string): string | null {
    const prefix = `${this.publicUrl}/`;
    return this.publicUrl && url.startsWith(prefix) ? url.slice(prefix.length) : null;
  }

  private requireClient(): S3Client {
    if (!this.client) {
      throw new StorageNotConfiguredError();
    }
    return this.client;
  }
}
