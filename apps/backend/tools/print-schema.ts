import 'reflect-metadata';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from '@nestjs/graphql';
import { printSchema } from 'graphql';
import { AdminOverviewResolver } from '../src/api/admin/resolvers/admin-overview.resolver';
import { AdminUsersResolver } from '../src/api/admin/resolvers/admin-users.resolver';
import { BlogResolver } from '../src/api/admin/resolvers/blog.resolver';
import { AdsResolver } from '../src/api/admin/resolvers/ads.resolver';
import { VanHanEntryResolver } from '../src/api/admin/resolvers/van-han-entry.resolver';

async function main() {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule, { logger: false });
  await app.init();
  const factory = app.get(GraphQLSchemaFactory);
  const schema = await factory.create([
    AdminOverviewResolver,
    AdminUsersResolver,
    BlogResolver,
    AdsResolver,
    VanHanEntryResolver,
  ]);
  writeFileSync(join(__dirname, '../src/schema.gql'), `${printSchema(schema)}\n`);
  await app.close();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
