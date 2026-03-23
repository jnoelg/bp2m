import js from '@eslint/js';

export default [
  {
    files: ['**/*'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        Storage: 'readonly',
        Event: 'readonly',
      },
    },
    rules: {
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'comma-dangle': ['error', { 'objects': 'never' }],
    },
  },
  {
    files: ['src/js/bpm-app.js'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
];
