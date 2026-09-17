import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import type { DynamicModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';

export function graphqlRootImport(): DynamicModule {
  return GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    autoSchemaFile: join(process.cwd(), 'apps/backend/src/schema.gql'),
    sortSchema: true,
    path: '/graphql',
    useGlobalPrefix: true,
    introspection: true,
    context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),
  });
}
