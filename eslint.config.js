// Mainly a safety net for the refactor: an identifier that lost its import is an error, not a runtime surprise.
import globals from 'globals';

export default [
  { ignores: ['src/sw.template.js'] },
  {
    files: ['src/**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: globals.browser },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
      'no-redeclare': 'error',
      'no-dupe-keys': 'error',
      'no-const-assign': 'error'
    }
  }
];
