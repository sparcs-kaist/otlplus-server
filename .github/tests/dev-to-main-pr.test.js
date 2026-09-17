const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const { mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs')
const { tmpdir } = require('node:os')
const { join } = require('node:path')
const { test } = require('node:test')
const yaml = require('js-yaml')

const workflow = yaml.load(readFileSync(join(__dirname, '../workflows/dev-to-main-pr.yml'), 'utf8'))
const step = workflow.jobs['open-pr'].steps[0]

test('runs on dev pushes with serialized PR creation and minimal permissions', () => {
  assert.deepEqual(workflow.on.push.branches, ['dev'])
  assert.deepEqual(workflow.permissions, { contents: 'read', 'pull-requests': 'write' })
  assert.deepEqual(workflow.concurrency, { group: 'dev-to-main-pr', 'cancel-in-progress': false })
  assert.equal(step.env.GH_REPO, '${{ github.repository }}')
  assert.equal(step.env.GH_TOKEN, '${{ github.token }}')
})

for (const [name, existing, ahead, failure, expectedCalls] of [
  ['creates a PR for new commits', '', '1', '', ['pr list', 'api', 'pr create']],
  ['keeps an existing PR', '42', '1', '', ['pr list']],
  ['skips a synchronized branch', '', '0', '', ['pr list', 'api']],
  ['fails on PR lookup errors', '', '1', 'pr list', ['pr list']],
  ['fails on comparison errors', '', '1', 'api', ['pr list', 'api']],
  ['reports PR creation errors', '', '1', 'pr create', ['pr list', 'api', 'pr create']],
]) {
  test(name, (t) => {
    const directory = mkdtempSync(join(tmpdir(), 'otl-dev-to-main-'))
    t.after(() => rmSync(directory, { recursive: true, force: true }))
    const log = join(directory, 'calls')
    writeFileSync(
      join(directory, 'gh'),
      `#!/usr/bin/env node
const fs = require('node:fs')
const args = process.argv.slice(2)
const command = args[0] === 'api' ? 'api' : args.slice(0, 2).join(' ')
fs.appendFileSync(process.env.CALL_LOG, JSON.stringify(args) + '\\n')
if (command === process.env.FAIL_COMMAND) process.exit(1)
if (command === 'pr list') process.stdout.write(process.env.EXISTING_PR)
else if (command === 'api') process.stdout.write(process.env.AHEAD_BY)
else if (command !== 'pr create') process.exit(2)
`,
      { mode: 0o755 },
    )
    const result = spawnSync('bash', ['--noprofile', '--norc', '-c', step.run], {
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${directory}:${process.env.PATH}`,
        GH_TOKEN: 'test',
        GH_REPO: 'example/otl',
        CALL_LOG: log,
        EXISTING_PR: existing,
        AHEAD_BY: ahead,
        FAIL_COMMAND: failure,
      },
    })
    assert.equal(result.status, failure ? 1 : 0, result.stderr)
    const calls = readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse)
    assert.deepEqual(
      calls.map((args) => (args[0] === 'api' ? 'api' : args.slice(0, 2).join(' '))),
      expectedCalls,
    )
    assert.deepEqual(calls[0], [
      'pr',
      'list',
      '--base',
      'main',
      '--head',
      'dev',
      '--state',
      'open',
      '--json',
      'number',
      '--jq',
      '.[0].number // empty',
    ])
    const create = calls.find((args) => args[1] === 'create')
    if (create) assert.deepEqual(create.slice(2, 6), ['--base', 'main', '--head', 'dev'])
    const compare = calls.find((args) => args[0] === 'api')
    if (compare) assert.equal(compare[1], 'repos/example/otl/compare/main...dev')
  })
}
