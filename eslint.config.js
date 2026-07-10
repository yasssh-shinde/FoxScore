import js from '@eslint/js'
import ts from 'typescript-eslint'
import nextPlugin from '@next/eslint-plugin-next'

export default [
  js.configs.recommended,
  ...ts.configs.strict,
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      '@next/next/no-html-link-for-pages': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]
