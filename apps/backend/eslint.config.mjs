import baseConfig from '../../eslint.config.mjs';

const AI_ADMIN_FILES = 'src/api/admin/ai/**/*.ts';

const AI_PORT_ONLY = {
  regex: '^(\\.\\./)+ai/(?!port/|ai\\.module$)',
  message: 'Feature modules talk to AI only through ai/port/* and AiModule.',
};

const AI_NO_ADAPTERS = {
  regex: '^(\\.\\./)+ai/providers/',
  message: 'Admin reaches AI vendors through AiHealthService, never ai/providers/*.',
};

export default [
  ...baseConfig,
  {
    files: [
      'libs/**/*.ts',
      'ormconfigs.ts',
      'src/api/**/*.ts',
      'src/app/app.module.ts',
      'src/app/app.provider.ts',
      'src/app/app.swagger.ts',
    ],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
    },
  },
  {
    files: ['src/api/**/*.ts'],
    ignores: [AI_ADMIN_FILES],
    rules: {
      'no-restricted-imports': ['error', { patterns: [AI_PORT_ONLY] }],
    },
  },
  {
    files: [AI_ADMIN_FILES],
    rules: {
      'no-restricted-imports': ['error', { patterns: [AI_NO_ADAPTERS] }],
    },
  },
];
