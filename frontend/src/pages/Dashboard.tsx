import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from 'react'
import { ApiError, configuredApiClient } from '../api/client'
import AnalysisFilters from '../components/AnalysisFilters'
import RequestStatus from '../components/RequestStatus'
import { createAnalysisStore } from '../state/analysis'
import SummaryCards from '../components/SummaryCards'
import AnnualMetricsTable from '../components/AnnualMetricsTable'
import InsightsPanel from '../components/InsightsPanel'
import EventsTable from '../components/EventsTable'
import MethodologyPanel from '../components/MethodologyPanel'
import DataQualityPanel from '../components/DataQualityPanel'
const AnnualCharts = lazy(() => import('../components/AnnualCharts'))

export default function Dashboard() {
  const [store] = useState(() => {
    try { return createAnalysisStore(configuredApiClient()) } catch {
      const error = new ApiError('invalid_request', 'Set the public VITE_API_BASE_URL in frontend/.env and restart the development server.')
      return createAnalysisStore({ getRegions: () => Promise.reject(error), analyze: () => Promise.reject(error) })
    }
  })
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot)
  useEffect(() => { void store.loadRegions(); return () => store.dispose() }, [store])
  const displayed = state.result
  return <>
    <a className="skip-link" href="#main">Skip to dashboard</a>
    <header className="site-header"><div className="header-inner">
      <a className="brand" href="#main"><span className="brand-mark" aria-hidden="true">CA</span>
        <span>Climate Atlas<span className="brand-caption">HISTORICAL HEATWAVE EXPLORER</span></span></a>
      <a className="text-link" href="#methodology">About the method <span aria-hidden="true">↗</span></a>
    </div></header>
    <main id="main" className="dashboard">
      <div className="page-intro"><div><p className="eyebrow">CLIMATE / HEATWAVES</p>
        <h1>A clearer view of extreme heat.</h1>
        <p className="intro-copy">Explore historical heatwave patterns across Indian cities, with the evidence and limitations in view.</p>
      </div><span className="hazard-badge"><span aria-hidden="true">☀</span> Heatwave analysis</span></div>

      <aside className="development-note" aria-label="Development status">
        <span className="status-dot" aria-hidden="true" /><p><strong>Historical heatwave analysis</strong> · Results, insights, and quality information use backend responses. No sample climate values are displayed.</p>
      </aside>

      <AnalysisFilters state={state} onChange={store.setFilters} onSubmit={() => void store.submit()} onCancel={() => store.cancel()} />
      <RequestStatus state={state} onReload={() => void store.loadRegions()} />

      <section className="results" aria-labelledby="results-title">
        <div className="section-heading"><div><p className="eyebrow">02 / RESULTS</p><h2 id="results-title">Your heatwave overview</h2></div><span className="muted">{displayed ? `${displayed.region.name} · ${displayed.period.start_year}–${displayed.period.end_year} · Heatwave` : 'No selection analyzed'}</span></div>
        {displayed && <div className="result-receipt"><p><strong>Saved analysis received</strong> · {displayed.region.name}, {displayed.period.start_year}–{displayed.period.end_year}. {state.loading || state.error || state.cancelled ? 'This is the previous successful result.' : 'These are the parameters of the received result.'}</p>
          <p className="muted">Source: {displayed.source.provider} / {displayed.source.model.toUpperCase()} · Analysis cache: {displayed.source.analysis_cache_status} · Generated: {displayed.source.generated_at}</p>
          {displayed.data_quality.warnings.length > 0 && <p>Quality warnings: {displayed.data_quality.warnings.join(' ')}</p>}
        </div>}
        <SummaryCards analysis={displayed} />
        {displayed ? <><Suspense fallback={<p role="status">Loading chart display… Annual values are available in the table below.</p>}><AnnualCharts analysis={displayed} /></Suspense><AnnualMetricsTable analysis={displayed} /></>
          : <div className="panel empty-chart"><p>Run an analysis to view annual charts and the metrics table.</p><small>No analysis values are displayed before a successful response.</small></div>}
        {displayed && <><InsightsPanel analysis={displayed} /><EventsTable key={`${displayed.region.id}-${displayed.period.start_year}-${displayed.period.end_year}-${displayed.source.generated_at}`} analysis={displayed} /></>}
      </section>

      {displayed ? <><MethodologyPanel analysis={displayed} /><DataQualityPanel analysis={displayed} /></> : <section id="methodology" className="methodology" aria-labelledby="method-title"><div>
        <p className="eyebrow">UNDERSTANDING THE ANALYSIS</p><h2 id="method-title">The method matters.</h2>
        <p>A historical analysis tool, not an official heat alert. Results will describe a representative weather grid point near each city.</p>
      </div><div className="method-note"><h3>Methodology & data quality</h3><p>Threshold, baseline, coverage, event definitions, and source attribution will be shown alongside the connected analysis.</p><span className="tag">Available with results</span></div></section>}
    </main>
    <footer className="site-footer"><span>Climate Atlas</span><span>Historical patterns. Clear context.</span></footer>
  </>
}
