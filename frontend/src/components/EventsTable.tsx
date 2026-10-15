import { useState } from 'react'
import type { AnalysisResponse, HeatwaveEvent } from '../types/analysis'
import { formatMetric } from './metric-format'
import { eventPage } from './event-pages'

export function EventRow({ event }: { event: HeatwaveEvent }) {
  const truncated = event.truncated_start || event.truncated_end
  const label = !event.qualification_confirmed ? 'Uncertain candidate — not a confirmed heatwave'
    : truncated ? 'Confirmed qualifying run — truncated boundaries' : 'Confirmed event'
  return <tr><td><strong>{label}</strong><p>{event.eligible_for_complete_metrics ? 'Eligible for complete metrics' : 'Excluded from complete metrics'}</p>
    {event.truncated_start && <p>Start boundary unresolved</p>}{event.truncated_end && <p>End boundary unresolved</p>}</td>
    <td>{event.started_in_selection === null ? 'Start inside selection unknown' : event.started_in_selection ? 'Started inside selection' : 'Started outside selection; overlaps selected years'}</td>
    <td>{event.start_date ?? 'Unknown'} → {event.end_date ?? 'Unknown'}<br />Full duration: {formatMetric(event.duration_days)}{event.duration_days !== null ? ' days' : ''}</td>
    <td>Full peak: {formatMetric(event.peak_temperature_celsius)}{event.peak_temperature_celsius !== null ? ' °C' : ''}<br />Full mean exceedance: {formatMetric(event.mean_exceedance_celsius)}{event.mean_exceedance_celsius !== null ? ' °C' : ''}</td>
    <td>{event.observed_start_date} → {event.observed_end_date}<br />Observed duration: {formatMetric(event.observed_duration_days)} days</td>
    <td>Observed peak: {formatMetric(event.observed_peak_temperature_celsius)} °C<br />Observed mean exceedance: {formatMetric(event.observed_mean_exceedance_celsius)} °C</td>
  </tr>
}

export default function EventsTable({ analysis }: { analysis: AnalysisResponse }) {
  const [requestedPage, setPage] = useState(0)
  const { page, pages, rows } = eventPage(analysis.events, requestedPage)
  return <section className="panel annual-panel" aria-labelledby="events-title"><h3 id="events-title">Events & observed candidates</h3>
    <p className="muted" id="events-help">{analysis.region.name} · {analysis.period.start_year}–{analysis.period.end_year}. Full-event values and observed segments are separate. Unknown boundaries are not inferred. Records intersecting the selection may start outside it.</p>
    {analysis.events.length === 0 ? <p>No event or candidate records intersect this selection. Check coverage and quality warnings before interpreting this as an absence of heatwaves.</p> : <>
      <p className="muted">{analysis.events.length} returned records, including any uncertain or truncated observations. Record count is not the summary event-start count.</p>
      <div className="table-scroll" role="region" tabIndex={0} aria-label="Event records, horizontally scrollable" aria-describedby="events-help"><table>
        <caption>Returned event records · {analysis.region.name}, {analysis.period.start_year}–{analysis.period.end_year}</caption>
        <thead><tr>{['Qualification / completeness', 'Selection relationship', 'Full dates / duration', 'Full temperature metrics', 'Observed dates / duration', 'Observed temperature metrics'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{rows.map((event, index) => <EventRow key={`${event.observed_start_date}-${index}`} event={event} />)}</tbody>
      </table></div>
      <nav className="pagination" aria-label="Event pages"><button type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
        <span role="status" aria-live="polite">Page {page + 1} of {pages}</span>
        <button type="button" disabled={page === pages - 1} onClick={() => setPage(page + 1)}>Next</button></nav>
    </>}
  </section>
}
