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
for (const filePath of [
  'apps/scholar-sync/src/modules/sync/sync.service.ts',
  'apps/server/src/modules/sync/syncScholarDB.service.ts',
]) {
  const [result] = await eslint.lintText('export type Deferred = any\n', { filePath })
  assert(!result.messages.some((message) => message.ruleId === '@typescript-eslint/no-explicit-any'), filePath)
  assert(!result.fatalErrorCount, filePath)
}
for (const filePath of ['apps/scholar-sync/src/new-sync.ts', 'apps/server/src/modules/sync/new-sync.ts']) {
  const config = await eslint.calculateConfigForFile(filePath)
  assert.equal(config.rules['@typescript-eslint/no-explicit-any'][0], 2, filePath)
}
console.log('any guard covers non-deferred files, including new sync files')
