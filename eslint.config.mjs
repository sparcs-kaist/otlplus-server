// @ts-check

import { FlatCompat } from '@eslint/eslintrc'; // 👴 airbnb를 위해 임시 사용
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

import eslintPluginStylistic from '@stylistic/eslint-plugin';
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintPluginJest from 'eslint-plugin-jest';

const compat = new FlatCompat({});

/** @type {import('eslint').Linter.FlatConfig[]} */
export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,

  // 👴 Airbnb 설정은 legacy라 compat로 감싸줌
  ...compat.extends('airbnb-base'),

  // 스타일은 stylistic으로 통합
  eslintPluginStylistic.configs['recommended-flat'],

  {
    ignores: [
      '**/dist/',
      '**/node_modules/',
      '**/*.js',
      'eslint.config.mjs',
      '**/*.spec.ts',
      '**/__tests__/**',
      '**/test/**',
      '**/*.test.ts',
    ],
  },
  {
    name: 'Global Settings',
    languageOptions: {
      ecmaVersion: 2021,
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        project: true,
      },
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ForInStatement',
          message: 'Avoid for..in; use Object.keys/values/entries instead.',
        },
        {
          selector: 'LabeledStatement',
          message: 'Avoid labels; they are like GOTO.',
        },
        {
          selector: 'WithStatement',
          message: '`with` is disallowed in strict mode.',
        },
      ],
      'no-await-in-loop': 'off',
      'no-continue': 'off',
      'no-console': 'off',
      'no-nested-ternary': 'off',
      'quote-props': 'off',
      semi: 'off',
      quotes: 'off',
      'arrow-parens': 'off',
      'no-return-await': 'off',
      indent: 'off',
      camelcase: 'off',
      'brace-style': 'off',
      'max-len': 'off',
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/indent': ['error', 2],
      radix: ['error', 'as-needed'],
      'import/extensions': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/no-unresolved': 'off',
      'import/prefer-default-export': 'off',
    },
  },
  {
    name: 'TypeScript Custom Rules',
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    name: 'Import Sorting Rules',
    files: ['**/*.ts', '**/*.tsx', '*.mjs'],
    plugins: { 'simple-import-sort': eslintPluginSimpleImportSort },
    rules: {
      'import/order': 'off',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../*'],
              message: '상위 디렉토리 import는 path alias로 대체하세요.',
            },
          ],
        },
      ],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^'], // 외부 패키지
            ['^@otl/common'],
            ['^@otl/prisma-client'],
            ['^\\.'], // 상대경로
          ],
        },
      ],
    },
  },
  {
    name: 'nestJS settings',
    files: ['**/*.ts'],
    plugins: { jest: eslintPluginJest },
    languageOptions: {
      globals: eslintPluginJest.environments.globals.globals,
    },
    rules: {
      'max-classes-per-file': 'off',
      'no-useless-constructor': 'off',
      'no-empty-function': 'off',
      'no-dupe-class-members': 'off',
      'class-methods-use-this': 'off',
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
  {
    name: 'Jest Settings',
    files: ['**/*.spec.ts', '**/*.test.ts'],
    plugins: { jest: eslintPluginJest },
    languageOptions: {
      globals: eslintPluginJest.environments.globals.globals,
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
);
