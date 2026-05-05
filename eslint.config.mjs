import stylistic from '@stylistic/eslint-plugin';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import perfectionist from 'eslint-plugin-perfectionist';
import preferArrow from 'eslint-plugin-prefer-arrow';
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  stylistic.configs['recommended'],
  {
    plugins: {
      'no-relative-import-paths': noRelativeImportPaths,
      perfectionist,
      'prefer-arrow': preferArrow,
    },
    rules: {
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/jsx-quotes': ['error', 'prefer-double'],
      '@stylistic/semi': ['error', 'always'],
      'no-relative-import-paths/no-relative-import-paths': ['error', { allowSameFolder: true }],
      'perfectionist/sort-imports': ['error', {
        type: 'alphabetical',
        order: 'asc',
        newlinesBetween: 0,
        internalPattern: ['^@/.+'],
        groups: [
          ['value-builtin', 'value-external', 'type-external'],
          { group: 'components', commentAbove: 'Components' },
          { group: 'hooks', commentAbove: 'Hooks' },
          { group: 'types', commentAbove: 'Types' },
          { group: 'lib', commentAbove: 'Lib' },
          { group: 'app', commentAbove: 'App' },
          { group: 'utils', commentAbove: 'Utils' },
          'value-internal',
          ['value-parent', 'value-sibling', 'value-index'],
          'unknown',
        ],
        customGroups: [
          { groupName: 'components', anyOf: [{ elementNamePattern: '^@/components' }, { elementNamePattern: '^\\.\/components' }] },
          { groupName: 'hooks', elementNamePattern: '^@/hooks' },
          { groupName: 'types', elementNamePattern: '^@/types' },
          { groupName: 'lib', elementNamePattern: '^@/lib' },
          { groupName: 'app', elementNamePattern: '^@/app' },
          { groupName: 'utils', elementNamePattern: '^@/utils' },
        ],
      }],
      'prefer-arrow/prefer-arrow-functions': ['error', {
        disallowPrototype: true,
        singleReturnOnly: false,
        classPropertiesAllowed: false,
      }],
    },
  },
]);

export default eslintConfig;
