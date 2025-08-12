import { defineConfig, globalIgnores } from '@eslint/config-helpers'
import linterConfig from 'linter-config/eslint'

export default defineConfig([
  globalIgnores(['flow-typed/', 'node_modules/', '**/public/']),
  { extends: [linterConfig] }
])
