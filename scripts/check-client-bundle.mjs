import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

const chunksRoot = join(process.cwd(), '.next', 'static', 'chunks')
const maximumChunkBytes = 350 * 1024
const maximumTotalBytes = 2 * 1024 * 1024
const privateMarkers = [
  'LEAD_WEBHOOK_URL',
  'JWT_ACCESS_SECRET',
  'DATABASE_URL',
  'postgresql://',
]

const files = await javascriptFiles(chunksRoot)
if (files.length === 0)
  throw new Error('No client chunks found. Run npm run build first.')

let totalBytes = 0
let largest = { file: '', bytes: 0 }
for (const file of files) {
  const details = await stat(file)
  const source = await readFile(file, 'utf8')
  totalBytes += details.size
  if (details.size > largest.bytes) largest = { file, bytes: details.size }
  const marker = privateMarkers.find((candidate) => source.includes(candidate))
  if (marker)
    throw new Error(`Private marker ${marker} found in client chunk ${file}.`)
}

if (largest.bytes > maximumChunkBytes) {
  throw new Error(
    `Largest client chunk is ${largest.bytes} bytes; budget is ${maximumChunkBytes}.`,
  )
}
if (totalBytes > maximumTotalBytes) {
  throw new Error(
    `Client chunks total ${totalBytes} bytes; budget is ${maximumTotalBytes}.`,
  )
}

console.log(
  `Client bundle within budget: ${files.length} chunks, ${totalBytes} bytes total, ${largest.bytes} bytes largest.`,
)

async function javascriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) return javascriptFiles(path)
      return entry.isFile() && entry.name.endsWith('.js') ? [path] : []
    }),
  )
  return nested.flat()
}
