import { existsSync, lstatSync, readlinkSync, symlinkSync, unlinkSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'

// Pairs of [source (relative to monorepo root), target (relative to app dir)]
// passed as CLI args: bun setup-env.ts .env.web:.env
const appDir = process.cwd()
const monorepoRoot = resolve(appDir, '../..')

type EnvLink = {
  source: string
  target: string
}

const fail = (message: string): never => {
  console.error(message)
  process.exit(1)
}

const isErrno = (error: unknown, code: 'ENOENT' | 'EEXIST'): error is NodeJS.ErrnoException =>
  error instanceof Error && 'code' in error && error.code === code

const parseEnvLink = (arg: string): EnvLink => {
  const separatorIndex = arg.indexOf(':')

  if (separatorIndex === -1) {
    fail(`setup-env: invalid argument "${arg}" — expected <source>:<target>`)
  }

  const source = arg.slice(0, separatorIndex)
  const target = arg.slice(separatorIndex + 1)

  if (!source || !target) {
    fail(`setup-env: invalid argument "${arg}" — source and target must be non-empty`)
  }

  return { source, target }
}

const pointsToSource = (absTarget: string, absSource: string): boolean => {
  const target = lstatSync(absTarget, { throwIfNoEntry: false })
  return target?.isSymbolicLink() ? resolve(dirname(absTarget), readlinkSync(absTarget)) === absSource : false
}

const ensureSymlink = (link: EnvLink): void => {
  const absSource = resolve(monorepoRoot, link.source)
  const absTarget = resolve(appDir, link.target)
  const relSource = relative(appDir, absSource)

  if (!existsSync(absSource)) {
    fail(
      `setup-env: source file "${link.source}" not found at ${absSource}\n` +
        `  Copy the example and fill in values: cp ${link.source}.example ${link.source}`,
    )
  }

  if (pointsToSource(absTarget, absSource)) {
    return
  }

  if (lstatSync(absTarget, { throwIfNoEntry: false })) {
    try {
      unlinkSync(absTarget)
    } catch (error) {
      if (!isErrno(error, 'ENOENT')) {
        throw error
      }
    }
  }

  try {
    symlinkSync(relSource, absTarget, 'file')
  } catch (error) {
    if (!isErrno(error, 'EEXIST') || !pointsToSource(absTarget, absSource)) {
      throw error
    }
  }
}

const args = process.argv.slice(2)
if (args.length === 0) {
  fail('setup-env: no arguments provided. Usage: bun setup-env.ts <source>:<target>')
}

for (const arg of args) {
  ensureSymlink(parseEnvLink(arg))
}
