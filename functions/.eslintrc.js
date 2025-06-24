module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2021, // Aligns with your tsconfig.json target
    sourceType: 'module',
    project: './tsconfig.json', // Explicitly point to tsconfig.json
  },
  env: {
    node: true,
    es6: true,
  },
  ignorePatterns: [
    'lib/**/*', // Ignore compiled JavaScript output
    '.eslintrc.js' // Ignore this config file itself from linting
  ],
};
