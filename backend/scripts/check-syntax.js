import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { extname, join } from 'node:path'

const sourceDirectories = ['src', 'test', 'scripts']

const findJavaScriptFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)

    if (entry.isDirectory()) return findJavaScriptFiles(path)
    return extname(entry.name) === '.js' ? [path] : []
  })

let failed = false

for (const file of sourceDirectories.flatMap(findJavaScriptFiles)) {
  const result = spawnSync(process.execPath, ['--check', file], {
    stdio: 'inherit',
  })

  if (result.status !== 0) failed = true
}

if (failed) process.exitCode = 1
