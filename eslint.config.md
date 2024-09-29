import { createFlatConfig } from 'eslint';

export default createFlatConfig({
files: ['src/**/*.ts'],
parser: '@typescript-eslint/parser',
plugins: ['@typescript-eslint', 'prettier'],
extends: [
'eslint:recommended',
'plugin:@typescript-eslint/recommended',
'plugin:prettier/recommended',
'plugin:node/recommended',
],
env: {
node: true,
es6: true,
},
parserOptions: {
ecmaVersion: 2021,
sourceType: 'module',
},
rules: {
// Add custom rules here
indent: ['error', 2],
'linebreak-style': ['error', 'unix'],
quotes: ['error', 'single'],
semi: ['error', 'always'],
'no-console': 'warn',
'@typescript-eslint/explicit-function-return-type': 'error',
'@typescript-eslint/no-unused-vars': 'error',
'prettier/prettier': 'error',

    // eslint-plugin-node rules
    'node/exports-style': ['error', 'module.exports'],
    'node/file-extension-in-import': ['error', 'always'],
    'node/prefer-global/buffer': ['error', 'always'],
    'node/prefer-global/console': ['error', 'always'],
    'node/prefer-global/process': ['error', 'always'],
    'node/prefer-global/url-search-params': ['error', 'always'],
    'node/prefer-global/url': ['error', 'always'],
    'node/prefer-promises/dns': 'error',
    'node/prefer-promises/fs': 'error',

},
ignores: ['node_modules', 'dist', 'build', 'pnpm-lock.yaml', 'bun.lockb'],
});
