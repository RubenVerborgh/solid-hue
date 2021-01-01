module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  plugins: [
    'tsdoc',
    'import',
    'unused-imports',
  ],
  extends: [
    'es/node',
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  rules: {
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/lines-between-class-members': ['error', { exceptAfterSingleLine: true }],
    '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
    '@typescript-eslint/space-before-function-paren': ['error', 'never'],
    'array-bracket-spacing': ['error', 'never'],
    'class-methods-use-this': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'no-duplicate-imports': 'off',
    'no-unused-vars': ['error', { args: 'none' }],
    'padding-line-between-statements': 'off',
    'quote-props': ['error', 'consistent-as-needed'],
    'sort-imports': 'off',
    'strict': 'off',
  },
  overrides: [
    {
      files: '*.js',
      parser: 'espree',
    },
  ],
};
