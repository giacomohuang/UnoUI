#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { stdin, stdout } from 'node:process'
import { createInterface } from 'node:readline/promises'

const repositoryRoot = resolve(import.meta.dirname, '..')
const packageDirectory = resolve(repositoryRoot, 'packages/vue')
const packageManifestPath = resolve(packageDirectory, 'package.json')
const registry = 'https://registry.npmjs.org/'
const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)

const run = (command, args, cwd = repositoryRoot) => {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} 执行失败`)
}

const parseVersion = (version) => {
  const match = semverPattern.exec(version)
  if (!match) return undefined
  return {
    core: [Number(match[1]), Number(match[2]), Number(match[3])],
    prerelease: match[4]?.split('.') ?? []
  }
}

const compareIdentifiers = (left, right) => {
  const leftNumber = /^\d+$/.test(left) ? Number(left) : undefined
  const rightNumber = /^\d+$/.test(right) ? Number(right) : undefined
  if (leftNumber !== undefined && rightNumber !== undefined) return leftNumber - rightNumber
  if (leftNumber !== undefined) return -1
  if (rightNumber !== undefined) return 1
  return left.localeCompare(right)
}

const compareVersions = (leftVersion, rightVersion) => {
  const left = parseVersion(leftVersion)
  const right = parseVersion(rightVersion)
  if (!left || !right) throw new Error('版本号不是有效的 Semantic Version')

  for (let index = 0; index < left.core.length; index += 1) {
    if (left.core[index] !== right.core[index]) return left.core[index] - right.core[index]
  }

  if (left.prerelease.length === 0 && right.prerelease.length > 0) return 1
  if (left.prerelease.length > 0 && right.prerelease.length === 0) return -1

  const length = Math.max(left.prerelease.length, right.prerelease.length)
  for (let index = 0; index < length; index += 1) {
    if (left.prerelease[index] === undefined) return -1
    if (right.prerelease[index] === undefined) return 1
    const result = compareIdentifiers(left.prerelease[index], right.prerelease[index])
    if (result !== 0) return result
  }
  return 0
}

const packageManifestPaths = () => {
  const packagesDirectory = resolve(repositoryRoot, 'packages')
  const workspaceManifests = readdirSync(packagesDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => resolve(packagesDirectory, entry.name, 'package.json'))
    .filter((path) => {
      try {
        readFileSync(path)
        return true
      } catch {
        return false
      }
    })
  return [resolve(repositoryRoot, 'package.json'), ...workspaceManifests]
}

const assertVersionIsUnpublished = (name, version) => {
  const result = spawnSync('npm', ['view', `${name}@${version}`, 'version', '--registry', registry], {
    cwd: repositoryRoot,
    encoding: 'utf8'
  })
  if (result.error) throw result.error
  if (result.status === 0) throw new Error(`${name}@${version} 已经发布到 npm`)

  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`
  if (!output.includes('E404')) throw new Error(`无法确认 npm 版本状态：${output.trim()}`)
}

const arguments_ = process.argv.slice(2)
const dryRun = arguments_.includes('--dry-run')
const versionArguments = arguments_.filter((argument) => argument !== '--dry-run')
if (versionArguments.length > 1) {
  console.error('用法: pnpm release [版本号] [--dry-run]')
  process.exit(1)
}

const packageManifest = readJson(packageManifestPath)
const currentVersion = packageManifest.version
console.log(`当前版本号: ${currentVersion}`)

let nextVersion = versionArguments[0]
if (!nextVersion) {
  if (!stdin.isTTY) {
    console.error('当前环境无法交互输入，请通过参数传入版本号')
    process.exit(1)
  }
  const readline = createInterface({ input: stdin, output: stdout })
  try {
    nextVersion = (await readline.question('请输入准备发布的版本号: ')).trim()
  } finally {
    readline.close()
  }
}

if (!parseVersion(nextVersion)) {
  console.error(`无效版本号: ${nextVersion}`)
  process.exit(1)
}
if (compareVersions(nextVersion, currentVersion) <= 0) {
  console.error(`准备发布的版本号必须高于当前版本 ${currentVersion}`)
  process.exit(1)
}

const manifestPaths = packageManifestPaths()
const originalManifests = new Map(manifestPaths.map((path) => [path, readFileSync(path, 'utf8')]))
let published = false

try {
  if (!dryRun) {
    console.log('\n检查 npm 登录状态...')
    run('npm', ['whoami', '--registry', registry])
    assertVersionIsUnpublished(packageManifest.name, nextVersion)
  }

  console.log(`\n同步 workspace 版本号到 ${nextVersion}...`)
  for (const path of manifestPaths) {
    const manifest = readJson(path)
    manifest.version = nextVersion
    writeJson(path, manifest)
  }

  console.log('\n运行单元测试...')
  run('pnpm', ['--filter', '@mcistudio/unoui-vue', 'test:unit', '--run'])

  console.log('\n构建 npm library...')
  run('pnpm', ['build'])

  console.log('\n检查 npm 包内容...')
  run('npm', ['pack', '--dry-run'], packageDirectory)

  if (dryRun) {
    console.log(`\nDry run 完成：@mcistudio/unoui-vue@${nextVersion} 未发布，版本文件已恢复`)
  } else {
    console.log(`\n发布 @mcistudio/unoui-vue@${nextVersion}...`)
    run('npm', ['publish', '--access', 'public', '--registry', registry], packageDirectory)
    published = true
    console.log(`\n发布完成: @mcistudio/unoui-vue@${nextVersion}`)
  }
} catch (error) {
  console.error(`\n发布失败: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
} finally {
  if (!published) {
    for (const [path, content] of originalManifests) writeFileSync(path, content)
  }
}
