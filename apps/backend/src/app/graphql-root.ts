import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import type { DynamicModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

export function graphqlRootImport(): DynamicModule {
  return GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    autoSchemaFile: true,
    sortSchema: true,
    path: '/graphql',
    useGlobalPrefix: true,
    introspection: true,
    context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),
  });
}
