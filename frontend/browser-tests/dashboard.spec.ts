import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const fixture = JSON.parse(readFileSync(new URL('../../backend/fixtures/delhi-1990-2020.json', import.meta.url), 'utf8'))
const api = 'http://127.0.0.1:8001'
const artifactDir = join(tmpdir(), 'climate-hazard-verification', 'screenshots')
const discovery = { regions: [fixture.region, { ...fixture.region, id: 'mumbai', name: 'Mumbai' }],
  supported_years: { min: 1990, max: 2025 }, defaults: { region_id: 'delhi', start_year: 1990, end_year: 2020, hazard: 'heatwave' } }
async function controlled(page: Page, response = fixture) {
  await page.route(`${api}/api/v1/regions`, route => route.fulfill({ json: discovery }))
  await page.route(`${api}/api/v1/analyses`, route => route.fulfill({ json: response }))
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Analyze', exact: false })).toBeEnabled()
}
async function analyze(page: Page) {
  await page.getByRole('button', { name: /^Analyze/ }).click()
  await expect(page.getByText('Saved analysis received', { exact: true })).toBeVisible()
  await expect(page.locator('.annual-chart svg').first()).toBeVisible()
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy()
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 375, height: 812 }, { width: 320, height: 812 }]) {
  test(`controlled layout and accessibility ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await controlled(page)
    await noOverflow(page)
    await analyze(page)
    await noOverflow(page)
    expect(await page.locator('.annual-chart svg.recharts-surface').count()).toBe(4)
    const chart = page.locator('.annual-chart').first()
    const bounds = await chart.boundingBox()
    await chart.hover({ position: { x: Math.floor(bounds!.width / 2), y: 120 } })
    await expect(chart.locator('.chart-tooltip')).toBeVisible()
    await expect(chart.locator('.chart-tooltip')).toContainText('Event starts:')
    await expect(chart.locator('.chart-tooltip')).toContainText('events')
    await page.getByText('Baseline annual coverage (31 years)', { exact: true }).click()
    await page.getByText(/Weather retrieval, cache, and returned grid points/).click()
    await noOverflow(page)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([])
    await mkdir(artifactDir, { recursive: true })
    await page.screenshot({ path: join(artifactDir, `controlled-${viewport.width}.png`), fullPage: true })
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: join(artifactDir, `controlled-${viewport.width}-top.png`) })
    await page.locator('.chart-grid').screenshot({ path: join(artifactDir, `controlled-${viewport.width}-charts.png`) })
  })
}

test('keyboard selection, validation, pagination, disclosures, and reflow at 200% equivalent', async ({ page }) => {
  await controlled(page)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to dashboard' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('main')).toBeFocused()
  await page.getByLabel('Start year', { exact: true }).focus()
  expect(await page.getByLabel('Start year', { exact: true }).evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none')
  await page.keyboard.press('ControlOrMeta+A'); await page.keyboard.type('2021')
  await page.getByLabel('End year', { exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('alert')).toContainText('Start year must be on or before')
  await page.getByLabel('Start year', { exact: true }).fill('1990')
  await page.getByRole('button', { name: /^Analyze/ }).focus(); await page.keyboard.press('Enter')
  await expect(page.locator('.result-receipt')).toContainText('Delhi')
  await page.getByRole('button', { name: 'Next', exact: true }).focus(); await page.keyboard.press('Enter')
  await expect(page.getByRole('navigation', { name: 'Event pages' })).toContainText('Page 2 of 8')
  await page.getByText('Counting rules and method versions', { exact: true }).focus(); await page.keyboard.press('Enter')
  await expect(page.getByText('Counting rules and method versions').locator('..')).toHaveAttribute('open', '')
  // Browser zoom 200% at 1440px produces a 720 CSS-pixel layout viewport.
  // Check equivalent reflow and separately double the root font size for text resize.
  await page.setViewportSize({ width: 720, height: 450 })
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
  await noOverflow(page)
  await expect(page.getByRole('button', { name: /^Analyze/ })).toBeVisible()
  await page.screenshot({ path: join(artifactDir, 'text-resize-200.png'), fullPage: true })
})

test('controlled partial/null/uncertain state and retry failures remain explicit', async ({ page }) => {
  const partial = structuredClone(fixture)
  Object.assign(partial.summary, { event_count: 0, heatwave_days: 0, mean_duration_days: null, peak_temperature_celsius: null, partial: true })
  Object.assign(partial.events[0], { qualification_confirmed: false, eligible_for_complete_metrics: false, truncated_start: true,
    start_date: null, end_date: null, duration_days: null, peak_temperature_celsius: null, mean_exceedance_celsius: null, started_in_selection: null })
  Object.assign(partial.annual_metrics[0], { complete: false, partial: true, incomplete_reasons: ['Controlled boundary gap'], mean_duration_days: null })
  partial.data_quality.warnings = ['Controlled stale-data warning']
  partial.source.weather_years[0].cache_status = 'stale'
  await controlled(page, partial); await analyze(page)
  await expect(page.getByText('Uncertain candidate — not a confirmed heatwave', { exact: true })).toBeVisible()
  await expect(page.locator('.metric-grid')).toContainText('Not available')
  await expect(page.locator('.chart-quality').first()).toContainText('1990')
  await page.route(`${api}/api/v1/analyses`, route => route.fulfill({ status: 429, headers: { 'Retry-After': '30', 'Access-Control-Expose-Headers': 'Retry-After' }, json: { error: { code: 'rate_limited', message: 'Please wait.' } } }))
  await page.getByRole('button', { name: /^Analyze/ }).click()
  await expect(page.getByRole('complementary', { name: 'Request status' })).toContainText('Wait at least 30 seconds')
  await expect(page.locator('.result-receipt')).toContainText('previous successful result')
  await noOverflow(page)
  await page.route(`${api}/api/v1/analyses`, route => route.fulfill({ status: 200, body: 'broken JSON' }))
  await page.getByRole('button', { name: /Retry analysis/ }).click()
  await expect(page.getByRole('complementary', { name: 'Request status' })).toContainText('unreadable response')
  await noOverflow(page)
})

test('controlled rapid changes and cancellation cannot overwrite new results', async ({ page }) => {
  await controlled(page)
  let count = 0
  let release!: () => void
  const waiting = new Promise<void>(resolve => { release = resolve })
  await page.route(`${api}/api/v1/analyses`, async route => {
    const selection = route.request().postDataJSON()
    if (++count === 1) await waiting
    const body = structuredClone(fixture)
    body.period.start_year = selection.start_year
    try { await route.fulfill({ json: body }) } catch { /* Browser may already have aborted. */ }
  })
  await page.getByRole('button', { name: /^Analyze/ }).click()
  await expect(page.getByRole('button', { name: /Analyzing/ })).toBeDisabled()
  await page.getByLabel('Start year', { exact: true }).fill('2000')
  await page.getByRole('button', { name: /^Analyze/ }).click()
  await expect(page.locator('.result-receipt')).toContainText('2000–2020')
  release()
  await expect(page.locator('.result-receipt')).not.toContainText('1990–2020')
  await page.getByRole('button', { name: /^Analyze/ }).click()
  // Store-level tests separately cover cancellation/unmount even when transport ignores abort.
})

test('controlled empty results, discovery recovery, and safe failure classes', async ({ page }) => {
  await page.route(`${api}/api/v1/regions`, route => route.abort('connectionrefused'))
  await page.goto('/')
  await expect(page.getByRole('complementary', { name: 'Request status' })).toContainText('City options unavailable')
  await page.route(`${api}/api/v1/regions`, route => route.fulfill({ json: discovery }))
  await page.getByRole('button', { name: 'Retry loading cities' }).click()
  await expect(page.getByRole('button', { name: /^Analyze/ })).toBeEnabled()
  const empty = structuredClone(fixture)
  empty.events = []; empty.insights = []; empty.summary.event_count = 0
  empty.summary.heatwave_days = 0; empty.summary.mean_duration_days = null; empty.summary.peak_temperature_celsius = null
  empty.annual_metrics.forEach((row: Record<string, unknown>) => Object.assign(row, { event_count: 0, heatwave_days: 0,
    mean_duration_days: null, max_duration_days: null, mean_exceedance_celsius: null, peak_temperature_celsius: null, rolling_average_event_count: null }))
  await page.route(`${api}/api/v1/analyses`, route => route.fulfill({ json: empty }))
  await analyze(page)
  await expect(page.getByText(/No event or candidate records intersect/)).toBeVisible()
  for (const [status, code] of [[422, 'insufficient_baseline_data'], [503, 'analysis_busy'], [503, 'database_unavailable'],
    [502, 'provider_unavailable'], [504, 'operation_timeout']] as const) {
    await page.route(`${api}/api/v1/analyses`, route => route.fulfill({ status, json: { error: { code, message: `Controlled ${code}` } } }))
    await page.getByRole('button', { name: /^(Analyze|Retry analysis)/ }).click()
    await expect(page.getByRole('complementary', { name: 'Request status' })).toContainText(`Controlled ${code}`)
    await expect(page.locator('.result-receipt')).toContainText('previous successful result')
  }
  await page.route(`${api}/api/v1/analyses`, route => route.fulfill({ json: fixture }))
  await page.getByRole('button', { name: /Retry analysis/ }).click()
  await expect(page.getByRole('complementary', { name: 'Request status' })).toContainText('Analysis received')
})

test('real local API, CORS, persisted default/repeat and alternate short range', async ({ page, request }) => {
  test.setTimeout(300_000)
  await page.goto('/')
  await expect(page.getByRole('combobox', { name: 'City', exact: true })).toHaveValue('delhi')
  expect(await page.getByRole('combobox', { name: 'City', exact: true }).locator('option').count()).toBe(5)
  const original = page.waitForResponse(r => r.url() === `${api}/api/v1/analyses` && r.status() === 200, { timeout: 270_000 })
  await page.getByRole('button', { name: /^Analyze/ }).click()
  const first = await (await original).json()
  await expect(page.locator('.metric-grid')).toContainText(String(first.summary.event_count))
  await expect(page.getByRole('heading', { name: 'Data quality & source' })).toBeVisible()
  const repeated = page.waitForResponse(r => r.url() === `${api}/api/v1/analyses` && r.status() === 200, { timeout: 270_000 })
  await page.getByRole('button', { name: /^Analyze/ }).click()
  const repeat = await (await repeated).json()
  expect(repeat.source.analysis_cache_status).toBe('hit')
  expect(repeat.source.generated_at).toBe(first.source.generated_at)
  await page.getByRole('combobox', { name: 'City', exact: true }).selectOption('mumbai')
  await page.getByLabel('Start year', { exact: true }).fill('2020')
  await page.getByLabel('End year', { exact: true }).fill('2020')
  const alternate = page.waitForResponse(r => r.url() === `${api}/api/v1/analyses`, { timeout: 270_000 })
  await page.getByRole('button', { name: /^Analyze/ }).click()
  const alternateResponse = await alternate
  expect(alternateResponse.status()).toBe(200)
  const body = await alternateResponse.json()
  expect(body.region.id).toBe('mumbai'); expect(body.annual_metrics.length).toBe(1)
  await expect(page.locator('.result-receipt')).toContainText('Mumbai, 2020–2020')
  await expect(page.locator('.metric-grid')).toContainText(String(body.summary.event_count))
  const allowed = await request.get(`${api}/api/v1/regions`, { headers: { Origin: 'http://127.0.0.1:5180' } })
  expect(allowed.headers()['access-control-allow-origin']).toBe('http://127.0.0.1:5180')
  const denied = await request.get(`${api}/api/v1/regions`, { headers: { Origin: 'https://denied.example' } })
  expect(denied.status()).toBe(403)
  await mkdir(artifactDir, { recursive: true })
  await page.screenshot({ path: join(artifactDir, 'live-mumbai-2020.png'), fullPage: true })
  await test.info().attach('live-summary', { body: JSON.stringify({ default: { event_count: first.summary.event_count,
    generated_at: first.source.generated_at }, repeat_cache: repeat.source.analysis_cache_status,
    alternate: { region: body.region.id, period: body.period, event_count: body.summary.event_count },
    cors_allowed: allowed.status(), cors_denied: denied.status() }, null, 2), contentType: 'application/json' })
})
