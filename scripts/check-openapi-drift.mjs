import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import process from 'node:process'

const root = process.cwd()
const temporary = mkdtempSync(join(tmpdir(), 'admin9-openapi-check-'))
const generated = join(temporary, 'service')

function files(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name)
    return statSync(path).isDirectory() ? files(path) : [path]
  })
}

try {
  execFileSync('pnpm', ['openapi'], {
    cwd: root,
    env: { ...process.env, OPENAPI_OUTPUT_PATH: generated },
    stdio: 'ignore',
  })
  const expected = files(join(root, 'src/service')).map(path => relative(join(root, 'src/service'), path)).sort()
  const actual = files(generated).map(path => relative(generated, path)).sort()
  if (JSON.stringify(expected) !== JSON.stringify(actual)
    || expected.some(file => readFileSync(join(root, 'src/service', file), 'utf8') !== readFileSync(join(generated, file), 'utf8'))) {
    console.error('Generated OpenAPI service is out of date. Run pnpm openapi.')
    process.exitCode = 1
  }
  else {
    console.log('Generated OpenAPI service matches the authoritative schema.')
  }
}
finally {
  rmSync(temporary, { recursive: true, force: true })
}
