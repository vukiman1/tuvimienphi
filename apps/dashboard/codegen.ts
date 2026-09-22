import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../backend/src/api/admin/schema.gql',
  documents: ['src/**/*.ts', 'src/**/*.tsx', '!src/gql/**'],
  ignoreNoDocuments: true,
  generates: {
    'src/gql/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        documentMode: 'string',
      },
    },
  },
};

export default config;
