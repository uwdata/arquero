import js from '@eslint/js';
import globals from 'globals';

/** @type {import('@types/eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.mocha,
        ...globals.node,
        ...globals.es6,
        globalThis: false
      }
    },
    rules: {
      'comma-dangle': ['error', 'never'],
      'no-console': 'error',
      'no-cond-assign': 'off',
      'no-fallthrough': ['error', { commentPattern: 'break omitted' }],
      'semi': 'error',
      'quotes': ['error', 'single', { avoidEscape: true }],
      'prefer-const': 'error',
      'sort-imports': ['error', {
        ignoreCase: false,
        ignoreDeclarationSort: true
      }]
    }
  }
];
