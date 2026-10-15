import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const fixture = JSON.parse(readFileSync(new URL('../../backend/fixtures/delhi-1990-2020.json', import.meta.url), 'utf8'))

test('summary and annual table display real backend metrics and selection without recomputation', async () => {
  const server = await createServer({ cacheDir: `node_modules/.vite-tests/metrics-${process.pid}`, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { default: Summary } = await server.ssrLoadModule('/src/components/SummaryCards.tsx')
    const { default: Table } = await server.ssrLoadModule('/src/components/AnnualMetricsTable.tsx')
    const { formatMetric, formatCoverage } = await server.ssrLoadModule('/src/components/metric-format.ts')
    const cards = renderToStaticMarkup(createElement(Summary, { analysis: fixture }))
    for (const key of ['event_count', 'heatwave_days', 'mean_duration_days', 'peak_temperature_celsius']) {
      assert.ok(cards.includes(formatMetric(fixture.summary[key])))
    }
    const table = renderToStaticMarkup(createElement(Table, { analysis: fixture }))
    assert.match(table, /Delhi · 1990–2020/)
    assert.match(table, /scope="col"/); assert.match(table, /tabindex="0"/)
    assert.equal((table.match(/scope="row"/g) ?? []).length, fixture.annual_metrics.length)
    for (const row of fixture.annual_metrics) {
      const html = table.split(`<th scope="row">${row.year}</th>`)[1].split('</tr>')[0]
      for (const key of ['event_count', 'heatwave_days', 'mean_duration_days', 'max_duration_days',
        'mean_exceedance_celsius', 'peak_temperature_celsius', 'rolling_average_event_count']) {
        assert.ok(html.includes(`<td>${formatMetric(row[key])}</td>`), `${row.year} ${key}`)
      }
      assert.ok(html.includes(formatCoverage(row.coverage)))
    }
  } finally { await server.close() }
})

test('zero versus null and partial status remain explicit in cards, table, and tooltip', async () => {
  const server = await createServer({ cacheDir: `node_modules/.vite-tests/metrics-${process.pid}`, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { default: Summary } = await server.ssrLoadModule('/src/components/SummaryCards.tsx')
    const { default: Table } = await server.ssrLoadModule('/src/components/AnnualMetricsTable.tsx')
    const { AnnualTooltip, default: Charts } = await server.ssrLoadModule('/src/components/AnnualCharts.tsx')
    const data = structuredClone(fixture)
    Object.assign(data.summary, { event_count: 0, heatwave_days: 0, mean_duration_days: null, peak_temperature_celsius: null, partial: true })
    Object.assign(data.annual_metrics[0], { event_count: 0, heatwave_days: 0, mean_duration_days: null,
      max_duration_days: null, mean_exceedance_celsius: null, peak_temperature_celsius: null,
      rolling_average_event_count: null, complete: false, partial: true, incomplete_reasons: ['Unresolved boundary'] })
    data.annual_metrics = [data.annual_metrics[0]]
    const cards = renderToStaticMarkup(createElement(Summary, { analysis: data }))
    assert.match(cards, /Partial results/); assert.match(cards, />0<span/)
    assert.equal((cards.match(/Not available/g) ?? []).length, 2)
    assert.match(renderToStaticMarkup(createElement(Summary)), /Not analyzed/)
    const table = renderToStaticMarkup(createElement(Table, { analysis: data }))
    assert.match(table, /<td>0<\/td><td>0<\/td>/)
    assert.match(table, /Incomplete \/ partial/); assert.match(table, /Unresolved boundary/)
    const tooltip = renderToStaticMarkup(createElement(AnnualTooltip, { row: data.annual_metrics[0],
      series: [{ key: 'mean_duration_days', label: 'Mean duration', unit: 'days' }, { key: 'event_count', label: 'Event starts', unit: 'events' }] }))
    assert.match(tooltip, /Mean duration: Not available/); assert.match(tooltip, /Event starts: 0 events/)
    assert.match(tooltip, /Incomplete \/ partial/)
    const charts = renderToStaticMarkup(createElement(Charts, { analysis: data }))
    for (const title of ['Annual frequency', 'Heatwave days', 'Event duration', 'Heat intensity']) assert.ok(charts.includes(title))
    assert.match(charts, /Incomplete \/ partial years: 1990/)
    assert.match(charts, /Null values remain gaps/)
  } finally { await server.close() }
})
