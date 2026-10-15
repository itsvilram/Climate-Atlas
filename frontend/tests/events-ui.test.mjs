import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const fixture = JSON.parse(readFileSync(new URL('../../backend/fixtures/delhi-1990-2020.json', import.meta.url), 'utf8'))
test('real insights/trends and events retain backend values and bounded pagination', async () => {
  const server = await createServer({ cacheDir: `node_modules/.vite-tests/events-${process.pid}`, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { default: Insights } = await server.ssrLoadModule('/src/components/InsightsPanel.tsx')
    const { default: Events, EventRow } = await server.ssrLoadModule('/src/components/EventsTable.tsx')
    const { eventPage } = await server.ssrLoadModule('/src/components/event-pages.ts')
    const { formatMetric } = await server.ssrLoadModule('/src/components/metric-format.ts')
    const insights = renderToStaticMarkup(createElement(Insights, { analysis: fixture }))
    const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#x27;')
    for (const statement of fixture.insights) assert.ok(insights.includes(escape(statement)))
    assert.ok(insights.includes(`${formatMetric(fixture.trend.regression.slope_events_per_decade)} events per decade`))
    assert.ok(insights.includes(`Eligible fit years: ${fixture.trend.regression.fit_year_count}`))
    const table = renderToStaticMarkup(createElement(Events, { analysis: fixture }))
    assert.equal((table.match(/<tbody>/g) ?? []).length, 1)
    assert.equal((table.match(/Full duration:/g) ?? []).length, 10)
    assert.match(table, /Page 1 of 8/)
    const all = []
    for (let page = 0; page < 8; page++) all.push(...eventPage(fixture.events, page).rows)
    assert.deepEqual(all, fixture.events)
    assert.equal(eventPage(fixture.events, -5).page, 0)
    assert.equal(eventPage(fixture.events, 999).page, 7)
    const uncertain = { ...fixture.events[0], qualification_confirmed: false, eligible_for_complete_metrics: false,
      truncated_start: true, started_in_selection: null, start_date: null, end_date: null,
      duration_days: null, peak_temperature_celsius: null, mean_exceedance_celsius: null }
    const row = renderToStaticMarkup(createElement(EventRow, { event: uncertain }))
    assert.match(row, /Uncertain candidate — not a confirmed heatwave/)
    assert.match(row, /Start inside selection unknown/)
    assert.match(row, /Full duration: Not available/)
    assert.match(row, /Observed duration:/)
    const truncated = renderToStaticMarkup(createElement(EventRow, { event: { ...uncertain, qualification_confirmed: true, started_in_selection: false } }))
    assert.match(truncated, /Confirmed qualifying run — truncated boundaries/)
    assert.match(truncated, /Started outside selection/)
    const missing = structuredClone(fixture)
    Object.assign(missing.trend.regression, { slope_events_per_decade: null, fit_year_count: 0, fit_years: [], reason: 'Too few eligible years' })
    Object.assign(missing.trend.comparison, { percent_change: null, reason: 'Incomplete windows', percentage_unavailable_reason: 'Starting frequency is zero' })
    missing.insights = ['<script>literal text</script>']
    const unavailable = renderToStaticMarkup(createElement(Insights, { analysis: missing }))
    for (const text of ['Trend unavailable', 'Too few eligible years', 'Incomplete windows', 'Starting frequency is zero']) assert.ok(unavailable.includes(text))
    assert.doesNotMatch(unavailable, /<script>/)
    const empty = renderToStaticMarkup(createElement(Events, { analysis: { ...fixture, events: [] } }))
    assert.match(empty, /No event or candidate records/)
    assert.doesNotMatch(empty, /Page 1/)
  } finally { await server.close() }
})
