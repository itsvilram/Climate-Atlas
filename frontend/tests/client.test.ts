import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { ApiError, createApiClient, parseRetryAfter, ANALYSIS_TIMEOUT_MS, REGIONS_TIMEOUT_MS } from '../src/api/client.ts'
import { validateAnalysisResponse } from '../src/api/generated/validators.js'

const fixture = JSON.parse(readFileSync(new URL('../../backend/fixtures/delhi-1990-2020.json', import.meta.url), 'utf8'))
const baseUrl = 'http://127.0.0.1:8000'
const json = (body: unknown, status = 200, headers: Record<string, string> = {}) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', ...headers },
})
function mockFetch(handler: (url: string, options: RequestInit) => Promise<Response> | Response): typeof fetch {
  return ((url: string | URL | Request, options: RequestInit) => handler(String(url), options)) as typeof fetch
}

test('real handoff response validates; nullable and uncertain fields remain intact', async () => {
  const seen: { url: string; options: RequestInit }[] = []
  const api = createApiClient({ baseUrl: baseUrl + '/', fetch: mockFetch((url, options) => {
    seen.push({ url, options }); return json(fixture)
  }) })
  const result = await api.analyze({})
  assert.deepEqual(result, fixture)
  assert.equal(seen.length, 1)
  assert.equal(seen[0].url, baseUrl + '/api/v1/analyses')
  assert.equal(seen[0].options.body, '{}')
  assert.equal(seen[0].options.credentials, 'omit')
  assert.equal(seen[0].options.redirect, 'error')
  const uncertain = structuredClone(fixture)
  Object.assign(uncertain.events[0], { start_date: null, end_date: null, duration_days: null,
    peak_temperature_celsius: null, mean_exceedance_celsius: null, truncated_start: true,
    qualification_confirmed: false, eligible_for_complete_metrics: false, started_in_selection: null })
  assert.equal(validateAnalysisResponse(uncertain), true)
})

test('invalid nested response types, dates, missing fields, extras, and nonfinite values fail validation', () => {
  const mutations = [
    (x: typeof fixture) => { x.events[0].duration_days = '3' },
    (x: typeof fixture) => { x.events[0].start_date = '2020-02-30' },
    (x: typeof fixture) => { delete x.data_quality.counting_metadata },
    (x: typeof fixture) => { x.summary.extra = 1 },
    (x: typeof fixture) => { x.methodology.threshold_celsius = Infinity },
    (x: typeof fixture) => { x.source.generated_at = 'yesterday' },
  ]
  for (const mutate of mutations) {
    const value = structuredClone(fixture); mutate(value)
    assert.equal(validateAnalysisResponse(value), false)
  }
})

test('regions route validates discovery and does not add body or credentials', async () => {
  const body = { regions: [fixture.region], supported_years: { min: 1990, max: 2025 },
    defaults: { region_id: 'delhi', start_year: 1990, end_year: 2020, hazard: 'heatwave' } }
  const api = createApiClient({ baseUrl, fetch: mockFetch((url, options) => {
    assert.equal(url, baseUrl + '/api/v1/regions')
    assert.equal(options.method, 'GET'); assert.equal(options.body, undefined)
    return json(body)
  }) })
  assert.deepEqual(await api.getRegions(), body)
})

test('safe backend error envelope retains code, details, status, and retry delay without retry', async () => {
  let calls = 0
  const details = [{ field: 'start_year', code: 'int_type', message: 'Enter an integer.' }]
  const api = createApiClient({ baseUrl, fetch: mockFetch(() => {
    calls++; return json({ error: { code: 'cold_rate_limited', message: 'Please wait.', details } }, 429, { 'Retry-After': '30' })
  }) })
  await assert.rejects(api.analyze({}), (e: ApiError) => {
    assert.equal(e.kind, 'http'); assert.equal(e.code, 'cold_rate_limited'); assert.equal(e.status, 429)
    assert.equal(e.retryAfterSeconds, 30); assert.deepEqual(e.details, details); return true
  })
  assert.equal(calls, 1)
})

test('malformed JSON, wrong schemas, non-JSON failures, and network errors return safe errors', async () => {
  const cases: [() => Response, string][] = [
    [() => new Response('{private garbage', { status: 200 }), 'invalid_response'],
    [() => json({ private: 'do not echo' }), 'invalid_response'],
    [() => new Response('<html>private diagnostics</html>', { status: 502 }), 'http'],
    [() => json({ error: { code: 1, message: 'private diagnostics' } }, 500), 'http'],
  ]
  for (const [response, kind] of cases) {
    const api = createApiClient({ baseUrl, fetch: mockFetch(response) })
    await assert.rejects(api.analyze({}), (e: ApiError) => {
      assert.equal(e.kind, kind); assert.doesNotMatch(e.message, /private/); return true
    })
  }
  const api = createApiClient({ baseUrl, fetch: mockFetch(() => { throw new Error('private transport details') }) })
  await assert.rejects(api.getRegions(), (e: ApiError) => e.kind === 'network' && !e.message.includes('private'))
})

test('abort and timeout have distinct outcomes; timeout covers response body reads', async () => {
  const waiting = mockFetch((_url, options) => new Promise((_resolve, reject) => {
    options.signal!.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
  }))
  const api = createApiClient({ baseUrl, fetch: waiting, analysisTimeoutMs: 10 })
  await assert.rejects(api.analyze({}), (e: ApiError) => e.kind === 'timeout')
  const controller = new AbortController()
  const active = api.analyze({}, controller.signal)
  controller.abort()
  await assert.rejects(active, (e: ApiError) => e.kind === 'aborted')
  let calls = 0
  const before = createApiClient({ baseUrl, fetch: mockFetch(() => { calls++; return json(fixture) }) })
  await assert.rejects(before.analyze({}, controller.signal), (e: ApiError) => e.kind === 'aborted')
  assert.equal(calls, 0)
  const slowBody = createApiClient({ baseUrl, analysisTimeoutMs: 10, fetch: mockFetch((_url, options) => {
    return { ok: true, status: 200, json: () => new Promise((_resolve, reject) => {
      options.signal!.addEventListener('abort', () => reject(new Error('body aborted')), { once: true })
    }) } as Response
  }) })
  await assert.rejects(slowBody.analyze({}), (e: ApiError) => e.kind === 'timeout')
})

test('Retry-After handles seconds/date/past date and rejects malformed or unsafe values', () => {
  const now = Date.UTC(2026, 9, 15, 12)
  assert.equal(parseRetryAfter('30', now), 30)
  assert.equal(parseRetryAfter('Thu, 15 Oct 2026 12:00:30 GMT', now), 30)
  assert.equal(parseRetryAfter('Thu, 15 Oct 2026 11:00:00 GMT', now), 0)
  for (const value of [null, '', '-1', '1.2', '1e3', '9999999999999999999', 'tomorrow']) {
    assert.equal(parseRetryAfter(value, now), undefined)
  }
})

test('configuration and invalid selections are rejected before network access', async () => {
  for (const url of ['', '/relative', 'ftp://example.com', 'https://user:pass@example.com', baseUrl + '?x=1', baseUrl + '#x']) {
    assert.throws(() => createApiClient({ baseUrl: url }))
  }
  assert.equal(ANALYSIS_TIMEOUT_MS, 270_000); assert.equal(REGIONS_TIMEOUT_MS, 15_000)
  let calls = 0
  const api = createApiClient({ baseUrl, fetch: mockFetch(() => { calls++; return json(fixture) }) })
  for (const selection of [{ start_year: 2020, end_year: 1990 }, { start_year: 1989 }, { start_year: 2000.5 }]) {
    await assert.rejects(api.analyze(selection), (e: ApiError) => e.kind === 'invalid_request')
  }
  assert.equal(calls, 0)
})
