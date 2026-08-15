import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const projectRoot = process.cwd()

describe('client environment boundary', () => {
  it('marks the private environment module as server-only', () => {
    const source = readFileSync(
      join(projectRoot, 'config', 'server-env.ts'),
      'utf8',
    )

    expect(source).toMatch(/^import ['"]server-only['"]/)
  })

  it('does not read environment variables or import server config in Client Components', () => {
    const sourceFiles = [
      ...findFiles(join(projectRoot, 'app')),
      ...findFiles(join(projectRoot, 'components')),
    ]
    const clientSources = sourceFiles
      .map((file) => ({ file, source: readFileSync(file, 'utf8') }))
      .filter(({ source }) => /^['"]use client['"]/m.test(source))

    expect(clientSources.length).toBeGreaterThan(0)
    for (const { source } of clientSources) {
      expect(source).not.toContain('LEAD_WEBHOOK_URL')
      expect(source).not.toContain('config/server-env')
      expect(source).not.toContain('process.env')
    }
  })
})

function findFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return findFiles(path)
    return entry.isFile() && /\.tsx?$/.test(entry.name) ? [path] : []
  })
}
