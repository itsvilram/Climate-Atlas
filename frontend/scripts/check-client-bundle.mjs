// F02 is deliberately not imported by the shell yet; check its browser bundle separately.
import { build } from 'vite'

const result = await build({ configFile: false, logLevel: 'warn', build: {
  write: false, lib: { entry: 'src/api/client.ts', formats: ['es'], fileName: 'client' },
} })
const outputs = Array.isArray(result) ? result : [result]
const chunks = outputs.flatMap(output => output.output).filter(item => item.type === 'chunk')
if (chunks.some(item => /require\(|node:/.test(item.code))) throw new Error('Non-browser runtime found')
console.log(`Client browser bundle passed: ${chunks.length} chunk(s).`)
