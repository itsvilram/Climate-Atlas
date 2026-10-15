import type { AnalysisState, Filters } from '../state/analysis'

export default function AnalysisFilters({ state, onChange, onSubmit, onCancel }: {
  state: AnalysisState; onChange: (patch: Partial<Filters>) => void; onSubmit: () => void; onCancel: () => void
}) {
  const ready = !!state.regions && !state.regionsLoading && !state.regionsError
  const years = state.regions?.supported_years
  return <section className="panel filters" aria-labelledby="selection-title">
    <div className="panel-heading"><h2 id="selection-title">Define your analysis</h2><span className="step-label">01 / SELECTION</span></div>
    <p id="filter-help" className="muted">{years ? `Complete calendar years ${years.min}–${years.max}. Initial historical fetches can take several minutes.` : 'City options and year limits load from the backend.'}</p>
    <form noValidate onSubmit={event => { event.preventDefault(); onSubmit() }}>
      <fieldset disabled={!ready} aria-describedby={`filter-help${state.validation ? ' filter-error' : ''}`}>
        <legend className="visually-hidden">Analysis selection</legend>
        <label>City<select value={state.filters.region_id} onChange={event => onChange({ region_id: event.target.value })}>
          {!state.regions && <option value="">Loading city options</option>}
          {state.regions?.regions.map(region => <option key={region.id} value={region.id}>{region.name}</option>)}
        </select></label>
        <label>Hazard<select value="heatwave" disabled><option value="heatwave">Heatwave</option></select></label>
        <label>Start year<input inputMode="numeric" type="number" step="1" min={years?.min} max={years?.max}
          value={state.filters.start_year} aria-invalid={!!state.validation} aria-describedby={state.validation ? 'filter-error' : undefined}
          onChange={event => onChange({ start_year: event.target.value })} /></label>
        <label>End year<input inputMode="numeric" type="number" step="1" min={years?.min} max={years?.max}
          value={state.filters.end_year} aria-invalid={!!state.validation} aria-describedby={state.validation ? 'filter-error' : undefined}
          onChange={event => onChange({ end_year: event.target.value })} /></label>
        <button type="submit" disabled={state.loading}>{state.loading ? 'Analyzing…' : state.error ? 'Retry analysis' : 'Analyze'} <span aria-hidden="true">→</span></button>
      </fieldset>
      {state.validation && <p id="filter-error" className="inline-error" role="alert">{state.validation}</p>}
      {state.loading && <button className="secondary-button" type="button" onClick={onCancel}>Cancel request</button>}
    </form>
  </section>
}
