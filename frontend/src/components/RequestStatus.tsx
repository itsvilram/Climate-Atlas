import type { ApiError } from '../api/client'
import type { AnalysisState } from '../state/analysis'

export function errorAdvice(error: ApiError): string {
  if (error.status === 429) return 'The service is rate limited. Retry only after the waiting period.'
  if (error.code.startsWith('insufficient_')) return 'Insufficient data is not a zero-event result. Choose another supported selection or try later.'
  if (error.code === 'analysis_output_limit' || error.code === 'weather_context_limit') return 'Try a smaller range or another selection.'
  if (error.kind === 'timeout' || error.status === 504) return 'The time budget was exceeded. Server work may continue; retry deliberately.'
  if (error.status === 503) return 'The service is busy or unavailable. Wait before retrying.'
  if (error.status === 502) return 'Weather data could not be retrieved. Try again later.'
  if (error.kind === 'invalid_response') return 'The response could not be used. No new results were accepted.'
  if (error.kind === 'aborted') return 'Cancelling the browser request may leave server work running.'
  return 'Check the connection or configuration and retry deliberately.'
}

export default function RequestStatus({ state, onReload }: { state: AnalysisState; onReload: () => void }) {
  const error = state.regionsError ?? state.error
  return <aside className={`request-status${error ? ' request-error' : ''}`} aria-label="Request status">
    <div role="status" aria-live="polite" aria-atomic="true">
      {state.regionsLoading ? <p>Loading supported cities and year limits…</p> : error ? <>
        <p><strong>{state.regionsError ? 'City options unavailable' : 'Analysis could not complete'}</strong> · {error.message}</p>
        <p>{errorAdvice(error)} {error.retryAfterSeconds !== undefined && `Wait at least ${error.retryAfterSeconds} seconds from this response before retrying.`}</p>
        {error.details?.length ? <ul>{error.details.map((detail, index) => <li key={index}>{detail.field}: {detail.message}</li>)}</ul> : null}
      </> : state.loading ? <>
        <p><strong>{state.result ? 'Updating analysis' : 'Analyzing historical weather'}</strong> · {state.requested?.region_id}, {state.requested?.start_year}–{state.requested?.end_year}.</p>
        <p>This can take several minutes. {state.result ? 'Previous results remain labeled below.' : 'No results are available yet.'}</p>
      </> : state.cancelled ? <p>Request cancelled. Server work may continue. {state.result ? 'Previous results remain below.' : 'No new results were accepted.'}</p>
        : state.result ? <p><strong>Analysis received</strong> · {state.result.region.name}, {state.result.period.start_year}–{state.result.period.end_year}.
          {state.result.summary.event_count === 0 ? ' No qualifying event starts; this is distinct from unavailable data.' : ' Results are shown below.'}
          {state.result.summary.partial ? ' Results contain partial data; review quality warnings.' : ''}</p>
          : state.regions ? <p>Choose a city and years, then select Analyze. Results will describe historical heatwave patterns for that selection.</p>
            : <p>Connect to the backend to load supported selections.</p>}
    </div>
    {state.regionsError && <button className="secondary-button" type="button" onClick={onReload}>Retry loading cities</button>}
  </aside>
}
