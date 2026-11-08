import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as pg from 'pg';

export function createDatabaseOptions(configService: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    driver: pg,
    host: configService.get<string>('database.host'),
    port: configService.get<number>('database.port'),
    username: configService.get<string>('database.username'),
    password: configService.get<string>('database.password'),
    database: configService.get<string>('database.database'),
    autoLoadEntities: true,
    migrationsTableName: 'migrations',
    synchronize: false,
    ssl: configService.get<boolean>('database.tls') ? { rejectUnauthorized: false } : false,
  };
}
