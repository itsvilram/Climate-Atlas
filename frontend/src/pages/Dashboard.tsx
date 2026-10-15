import { useEffect, useState, useSyncExternalStore } from 'react'
import { ApiError, configuredApiClient } from '../api/client'
import AnalysisFilters from '../components/AnalysisFilters'
import RequestStatus from '../components/RequestStatus'
import { createAnalysisStore } from '../state/analysis'

export default function Dashboard() {
  const [store] = useState(() => {
    try { return createAnalysisStore(configuredApiClient()) } catch {
      const error = new ApiError('invalid_request', 'Configure the public VITE_API_BASE_URL and restart Vite.')
      return createAnalysisStore({ getRegions: () => Promise.reject(error), analyze: () => Promise.reject(error) })
    }
  })
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot)
  useEffect(() => { void store.loadRegions(); return () => store.dispose() }, [store])
  return <><a className="skip-link" href="#main">Skip to dashboard</a>
    <header className="site-header"><div className="header-inner"><span className="brand">Climate Atlas</span></div></header>
    <main id="main" className="dashboard"><div className="page-intro"><div>
      <p className="eyebrow">CLIMATE / HEATWAVES</p><h1>A clearer view of extreme heat.</h1>
      <p className="intro-copy">Select a city and historical years for heatwave analysis.</p></div></div>
      <AnalysisFilters state={state} onChange={store.setFilters} onSubmit={() => void store.submit()} onCancel={() => store.cancel()} />
      <RequestStatus state={state} onReload={() => void store.loadRegions()} />
      {state.result && <section className="panel annual-panel"><h2>Saved analysis received</h2>
        <p>{state.result.region.name} · {state.result.period.start_year}–{state.result.period.end_year}</p>
        <p>Result presentation is introduced in frontend phase 2.</p></section>}
    </main></>
}
