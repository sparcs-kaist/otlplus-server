import assert from 'node:assert/strict'
import { ESLint } from 'eslint'

const eslint = new ESLint()
for (const filePath of [
  'apps/server/src/app.service.ts',
  'apps/server/src/app.controller.spec.ts',
  'apps/server/test/type-safety.spec.ts',
  'apps/server/docs/docs-generator.ts',
  'libs/common/src/utils/util.ts',
]) {
  const [result] = await eslint.lintText('export type Forbidden = any\n', { filePath })
  assert(result.messages.some((message) => message.ruleId === '@typescript-eslint/no-explicit-any'), filePath)
}
console.log('any guard covers production, libraries, tests, and tooling')
