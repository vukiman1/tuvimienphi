import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import type { Request, Response } from 'express';
import { existsSync } from 'fs';
import { join } from 'path';
import { formatGraphqlError } from './format-graphql-error';
import { limitQueryShape } from './limit-query-shape';

const GRAPHQL_PATH = '/api/admin/graphql';
const MAX_ROOT_FIELDS = 5;
const MAX_DEPTH = 8;
const MAX_TOTAL_FIELDS = 500;

const isProduction = process.env.NODE_ENV === 'production';

function resolveSchemaFile(): string {
  const candidates = [
    join(process.cwd(), 'apps/backend/src/api/admin'),
    join(process.cwd(), 'src/api/admin'),
  ];
  const directory = candidates.find((candidate) => existsSync(candidate)) ?? candidates[0];
  return join(directory, 'schema.gql');
}

export const adminGraphqlOptions: ApolloDriverConfig = {
  driver: ApolloDriver,
  path: GRAPHQL_PATH,
  autoSchemaFile: isProduction ? true : resolveSchemaFile(),
  sortSchema: true,
  playground: false,
  introspection: !isProduction,
  validationRules: [
    limitQueryShape({
      maxRootFields: MAX_ROOT_FIELDS,
      maxDepth: MAX_DEPTH,
      maxTotalFields: MAX_TOTAL_FIELDS,
    }),
  ],
  plugins: isProduction
    ? []
    : [
        ApolloServerPluginLandingPageLocalDefault({
          embed: { runTelemetry: false },
          includeCookies: true,
        }),
      ],
  context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
  formatError: formatGraphqlError,
};
