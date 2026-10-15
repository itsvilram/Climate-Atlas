import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { ApiError } from '../src/api/client.ts'
import { createAnalysisStore, validateFilters } from '../src/state/analysis.ts'
import type { AnalysisApi } from '../src/state/analysis.ts'
import type { AnalysisResponse, RegionsResponse, Selection } from '../src/types/analysis.ts'

const result: AnalysisResponse = JSON.parse(readFileSync(new URL('../../backend/fixtures/delhi-1990-2020.json', import.meta.url), 'utf8'))
// Controlled discovery response deliberately uses different defaults/bounds.
const discovery: RegionsResponse = { regions: [result.region], supported_years: { min: 1995, max: 2024 },
  defaults: { region_id: 'delhi', start_year: 2000, end_year: 2010, hazard: 'heatwave' } }
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: unknown) => void
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
function matching(selection: Selection): AnalysisResponse {
  return { ...result, period: { ...result.period, start_year: selection.start_year!, end_year: selection.end_year! } }
}
function harness() {
  const calls: { selection: Selection; signal?: AbortSignal; pending: ReturnType<typeof deferred<AnalysisResponse>> }[] = []
  const api: AnalysisApi = { getRegions: async () => discovery, analyze: (selection, signal) => {
    const pending = deferred<AnalysisResponse>(); calls.push({ selection, signal, pending }); return pending.promise
  } }
  return { store: createAnalysisStore(api), calls }
}

test('discovery supplies options/defaults/bounds; invalid ranges and missing years do not submit', async () => {
  const { store, calls } = harness()
  await store.submit(); assert.equal(calls.length, 0)
  await store.loadRegions()
  assert.deepEqual(store.getSnapshot().filters, { region_id: 'delhi', start_year: '2000', end_year: '2010' })
  const valid = store.getSnapshot().filters
  for (const patch of [{ start_year: '' }, { start_year: '2000.5' }, { start_year: '1994' },
    { end_year: '2025' }, { start_year: '2011' }, { region_id: 'unknown' }]) {
    assert.equal(typeof validateFilters({ ...valid, ...patch }, discovery), 'string')
    store.setFilters({ ...valid, ...patch }); await store.submit()
    assert.ok(store.getSnapshot().validation)
  }
  assert.equal(calls.length, 0)
})

test('duplicate submits coalesce at UI ownership and retain prior result during new work', async () => {
  const { store, calls } = harness(); await store.loadRegions()
  const first = store.submit(); await store.submit(); assert.equal(calls.length, 1)
  calls[0].pending.resolve(matching(calls[0].selection)); await first
  const previous = store.getSnapshot().result
  store.setFilters({ start_year: '2001' })
  const next = store.submit()
  assert.equal(store.getSnapshot().result, previous)
  assert.equal(store.getSnapshot().result!.period.start_year, 2000)
  assert.equal(store.getSnapshot().requested!.start_year, 2001)
  calls[1].pending.resolve(matching(calls[1].selection)); await next
  assert.equal(store.getSnapshot().result!.period.start_year, 2001)
})

test('late old successes and errors cannot replace the newer successful request', async () => {
  for (const lateError of [false, true]) {
    const { store, calls } = harness(); await store.loadRegions()
    const old = store.submit()
    store.setFilters({ start_year: '2001' }); assert.equal(calls[0].signal!.aborted, true)
    const latest = store.submit()
    calls[1].pending.resolve(matching(calls[1].selection)); await latest
    if (lateError) calls[0].pending.reject(new ApiError('http', 'Old failure', { status: 502 }))
    else calls[0].pending.resolve(matching(calls[0].selection))
    await old
    assert.equal(store.getSnapshot().result!.period.start_year, 2001)
    assert.equal(store.getSnapshot().error, undefined)
  }
})

test('cancel and dispose abort requests and reject late commits even when transport ignores abort', async () => {
  for (const dispose of [false, true]) {
    const { store, calls } = harness(); await store.loadRegions()
    const active = store.submit()
    if (dispose) store.dispose(); else store.cancel()
    assert.equal(calls[0].signal!.aborted, true)
    calls[0].pending.resolve(matching(calls[0].selection)); await active
    assert.equal(store.getSnapshot().loading, false)
    assert.equal(store.getSnapshot().result, undefined)
    assert.equal(store.getSnapshot().error, undefined)
  }
})

test('every failure retains previous results and retry metadata without automatic retry', async () => {
  const errors = [
    new ApiError('http', 'Rate limited', { code: 'rate_limited', status: 429, retryAfterSeconds: 30 }),
    new ApiError('http', 'Busy', { code: 'analysis_busy', status: 503 }),
    new ApiError('http', 'Database unavailable', { code: 'database_unavailable', status: 503 }),
    new ApiError('http', 'Provider failure', { code: 'provider_unavailable', status: 502 }),
    new ApiError('http', 'Insufficient data', { code: 'insufficient_baseline_data', status: 422 }),
    new ApiError('timeout', 'Timeout'), new ApiError('network', 'Network failed'),
    new ApiError('invalid_response', 'Invalid shape'),
  ]
  for (const error of errors) {
    const { store, calls } = harness(); await store.loadRegions()
    const first = store.submit(); calls[0].pending.resolve(matching(calls[0].selection)); await first
    const previous = store.getSnapshot().result
    const second = store.submit(); calls[1].pending.reject(error); await second
    assert.equal(store.getSnapshot().error, error)
    assert.equal(store.getSnapshot().result, previous)
    assert.equal(store.getSnapshot().loading, false)
    await Promise.resolve(); assert.equal(calls.length, 2)
  }
})

test('discovery failures retry deliberately; stale/disposed discovery cannot overwrite current state', async () => {
  const pending: ReturnType<typeof deferred<RegionsResponse>>[] = []
  const store = createAnalysisStore({ getRegions: () => { const next = deferred<RegionsResponse>(); pending.push(next); return next.promise },
    analyze: async () => result })
  const first = store.loadRegions(); pending[0].reject(new ApiError('network', 'Offline')); await first
  assert.equal(store.getSnapshot().regionsError!.kind, 'network')
  const old = store.loadRegions(); store.dispose()
  const newer = store.loadRegions(); pending[2].resolve(discovery); await newer
  pending[1].reject(new Error('Old response')); await old
  assert.equal(store.getSnapshot().regionsError, undefined)
  assert.deepEqual(store.getSnapshot().regions, discovery)
})

test('response selection mismatch is rejected; zero-event response remains success', async () => {
  const { store, calls } = harness(); await store.loadRegions()
  const first = store.submit(); calls[0].pending.resolve(result); await first
  assert.equal(store.getSnapshot().error!.kind, 'invalid_response')
  const second = store.submit()
  const zero = matching(calls[1].selection)
  calls[1].pending.resolve({ ...zero, summary: { ...zero.summary, event_count: 0 } }); await second
  assert.equal(store.getSnapshot().result!.summary.event_count, 0)
  assert.equal(store.getSnapshot().error, undefined)
})
