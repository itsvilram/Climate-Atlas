import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

test('filter and status markup supports validation, deliberate retry, safe errors, and request states', async () => {
  const server = await createServer({ cacheDir: `node_modules/.vite-tests/request-${process.pid}`, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { default: Filters } = await server.ssrLoadModule('/src/components/AnalysisFilters.tsx')
    const { default: Status } = await server.ssrLoadModule('/src/components/RequestStatus.tsx')
    const { ApiError } = await server.ssrLoadModule('/src/api/client.ts')
    const state = { regionsLoading: false, loading: false, cancelled: false,
      filters: { region_id: 'delhi', start_year: '2000', end_year: '2010' },
      regions: { regions: [{ id: 'delhi', name: 'Delhi' }], supported_years: { min: 1995, max: 2024 } } }
    const filters = renderToStaticMarkup(createElement(Filters, { state: { ...state, validation: 'Invalid range' },
      onSubmit() {}, onChange() {}, onCancel() {} }))
    assert.match(filters, /<form/); assert.match(filters, /<label>City/)
    assert.match(filters, /min="1995" max="2024"/)
    assert.match(filters, /aria-describedby="filter-error"/)
    assert.match(filters, /role="alert">Invalid range/)
    const active = renderToStaticMarkup(createElement(Filters, { state: { ...state, loading: true },
      onSubmit() {}, onChange() {}, onCancel() {} }))
    assert.match(active, /type="submit" disabled=""/)
    assert.match(active, /Cancel request/)
    const renderStatus = patch => renderToStaticMarkup(createElement(Status, { state: { ...state, ...patch }, onReload() {} }))
    assert.match(renderStatus({ regionsLoading: true }), /Loading supported cities/)
    assert.match(renderStatus({}), /select Analyze/)
    assert.match(renderStatus({ cancelled: true }), /Server work may continue/)
    const limited = renderStatus({ error: new ApiError('http', '<script>not markup</script>', { status: 429, retryAfterSeconds: 30 }) })
    assert.match(limited, /Wait at least 30 seconds/); assert.doesNotMatch(limited, /<script>/)
    assert.match(limited, /role="status" aria-live="polite"/)
    assert.match(renderStatus({ regionsError: new ApiError('network', 'Offline') }), /Retry loading cities/)
    assert.match(renderStatus({ error: new ApiError('http', 'Data missing', { code: 'insufficient_baseline_data', status: 422 }) }), /not a zero-event result/)
  } finally { await server.close() }
})
