import js from '@eslint/js';
import * as tseslint from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactNative from 'eslint-plugin-react-native';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        ecmaVersion: 2023,
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
      'react-native': reactNative,
      prettier: prettierPlugin,
      'unused-imports': unusedImports
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@next/next/no-img-element': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      'react/jsx-key': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'comma-dangle': 'off',
      'eol-last': ['warn', 'always'],
      'quote-props': ['error', 'as-needed'],
      quotes: 'off',
      'no-trailing-spaces': 'warn',
      'no-var': 'error',
      'operator-linebreak': 'off',
      'multiline-ternary': 'off',
      '@typescript-eslint/type-annotation-spacing': 'off',
      '@typescript-eslint/object-curly-spacing': 'off',
      '@typescript-eslint/brace-style': 'off',
      'react/jsx-wrap-multilines': 'off',
      'react/jsx-curly-spacing': 'off',
      'react/jsx-parens': 'off',
      indent: ['warn', 2, { SwitchCase: 1 }],
      'arrow-body-style': ['warn', 'as-needed'],
      'react/jsx-tag-spacing': ['warn', { beforeSelfClosing: 'always', beforeClosing: 'never' }],
      'no-multiple-empty-lines': 'off',
      'jsx-quotes': ['warn', 'prefer-double'],
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': 'error',
      'no-useless-catch': 'off',
      'prettier/prettier': [
        'error',
        {
          printWidth: 200,
          singleQuote: false,
          trailingComma: 'none',
          bracketSpacing: true,
          arrowParens: 'avoid',
          endOfLine: 'auto',
          functionCallArguments: 'single-line',
          parenSpacing: false,
          jsxParens: 'avoid'
        }
      ]
    }
  }
];
