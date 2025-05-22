// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // any 타입 사용 허용
      '@typescript-eslint/no-floating-promises': 'warn', // 처리되지 않은 Promise 경고
      '@typescript-eslint/no-unsafe-argument': 'warn', // 안전하지 않은 파라미터 사용 경고
      '@typescript-eslint/no-empty-object-type': 'off', // 빈 객체 타입 허용
      'prettier/prettier': ['error', { printWidth: 120 }], // 한 줄 최대 길이 120자
      'linebreak-style': 'off', // 줄바꿈 스타일 검사 비활성화(CRLF & LF)
    },
  },
);
