import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const fixture = JSON.parse(readFileSync(new URL('../../backend/fixtures/delhi-1990-2020.json', import.meta.url), 'utf8'))
test('methodology and provenance match real metadata and expose controlled stale/incomplete conditions', async () => {
  const server = await createServer({ cacheDir: `node_modules/.vite-tests/methodology-${process.pid}`, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { default: Method } = await server.ssrLoadModule('/src/components/MethodologyPanel.tsx')
    const { default: Quality } = await server.ssrLoadModule('/src/components/DataQualityPanel.tsx')
    const method = renderToStaticMarkup(createElement(Method, { analysis: fixture }))
    for (const text of ['1990–2020', '41.5', '95th percentile', 'linear interpolation', '3 consecutive calendar days',
      'Equality does not qualify', 'No interpolation', 'Not applied', fixture.methodology.method_version]) assert.ok(method.includes(text), text)
    const quality = renderToStaticMarkup(createElement(Quality, { analysis: fixture }))
    for (const text of [String(fixture.methodology.baseline_quality.valid_days), fixture.source.generated_at,
      fixture.source.weather_years[0].fetched_at, fixture.source.weather_years[0].revision, 'not a city-wide average',
      'not remove the methodology', 'https://creativecommons.org/licenses/by/4.0/', 'https://open-meteo.com/']) assert.ok(quality.includes(text), text)
    assert.match(quality, /<summary>Baseline annual coverage/)
    const partial = structuredClone(fixture)
    partial.data_quality.warnings = ['<script>stale data</script>']
    partial.data_quality.incomplete_years = [2000]
    partial.data_quality.excluded_boundary_events = [fixture.events[0]]
    partial.source.weather_years[0].cache_status = 'stale'
    const warning = renderToStaticMarkup(createElement(Quality, { analysis: partial }))
    assert.match(warning, /STALE — cached fallback/)
    assert.match(warning, /2000/)
    assert.match(warning, /1 returned records excluded/)
    assert.match(warning, /href="#events-title"/)
    assert.doesNotMatch(warning, /<script>/)
  } finally { await server.close() }
})
