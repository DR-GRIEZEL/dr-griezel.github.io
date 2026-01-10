/* global require module */
const js = require('@eslint/js');
const globals = require('globals');
const prettier = require('eslint-config-prettier');

module.exports = [
  js.configs.recommended,

  {
    files: ['assets/js/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  prettier,
];
