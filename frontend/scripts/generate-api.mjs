// Generates browser-safe types and validators from the accepted backend handoff.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import openapiTS, { astToString } from 'openapi-typescript'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import standaloneCode from 'ajv/dist/standalone/index.js'

const source = new URL('../../backend/fixtures/openapi.json', import.meta.url)
const document = JSON.parse(await readFile(source, 'utf8'))
const types = astToString(await openapiTS(document, { defaultNonNullable: false }))
const ajv = new Ajv2020({ strict: false, strictNumbers: true, code: { source: true, esm: true, lines: true },
  coerceTypes: false, useDefaults: false, removeAdditional: false })
addFormats(ajv)
ajv.addSchema({ $id: 'handoff', components: document.components })
const validators = {}
for (const name of ['AnalysisResponse', 'RegionsResponse', 'Selection', 'ErrorResponse']) {
  const id = `validate${name}`
  ajv.addSchema({ $id: id, $ref: `handoff#/components/schemas/${name}` })
  validators[id] = id
}
// ajv-formats emits a CommonJS runtime reference even with esm enabled.
// Resolve that known reference as an ESM import for both Node and the browser.
const code = standaloneCode(ajv, validators).replaceAll('require("ajv-formats/dist/formats")', 'formatModule')
if (code.includes('require(')) throw new Error('Unexpected CommonJS runtime in generated validators')
const validation = '// Generated from backend/fixtures/openapi.json; do not edit.\n' +
  'import * as formatModule from "ajv-formats/dist/formats.js";\n' + code
for (const [filename, contents] of [['openapi.d.ts', types], ['validators.js', validation]]) {
  const destination = new URL(`../src/api/generated/${filename}`, import.meta.url)
  if (process.argv.includes('--check')) {
    if (await readFile(destination, 'utf8') !== contents) throw new Error(`Stale generated contract: ${filename}`)
  } else {
    await mkdir(fileURLToPath(new URL('.', destination)), { recursive: true })
    await writeFile(destination, contents)
  }
}
console.log(process.argv.includes('--check') ? 'API artifacts match backend OpenAPI.' : 'API types and validators generated.')
