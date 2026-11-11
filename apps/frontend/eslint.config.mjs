import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';
import noAdHocStyle from './eslint-rules/no-ad-hoc-style.mjs';

const MIGRATED_FILES = ['src/components/layout/**', 'src/components/ui/**'];
const DESIGN_SYSTEM_FILES = ['src/design-system/**'];

const adHocStyleGuard =
  MIGRATED_FILES.length === 0
    ? []
    : [
        {
          files: MIGRATED_FILES,
          ignores: DESIGN_SYSTEM_FILES,
          plugins: { local: { rules: { 'no-ad-hoc-style': noAdHocStyle } } },
          rules: { 'local/no-ad-hoc-style': 'error' },
        },
      ];

export default [
  ...nx.configs['flat/react'],
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
  ...adHocStyleGuard,
];
