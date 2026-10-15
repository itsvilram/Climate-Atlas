import type { AnalysisResponse } from '../types/analysis'
import { formatMetric } from './metric-format'

export default function InsightsPanel({ analysis }: { analysis: AnalysisResponse }) {
  const { regression, comparison } = analysis.trend
  return <section className="panel annual-panel" aria-labelledby="insights-title">
    <h3 id="insights-title">Insights & descriptive trends</h3>
    <p className="muted">{analysis.region.name} · {analysis.period.start_year}–{analysis.period.end_year}. Statements and trend values are supplied by the backend.</p>
    {analysis.summary.partial && <p className="quality-notice">Partial observations: interpret totals and trends with the returned quality flags.</p>}
    {analysis.insights.length ? <ul className="insight-list">{analysis.insights.map((insight, index) => <li key={index}>{insight}</li>)}</ul> : <p>No summary insights are available for this selection.</p>}
    <div className="trend-grid"><div><h4>Event frequency trend</h4>
      <p>{regression.slope_events_per_decade === null ? 'Trend unavailable' : `${formatMetric(regression.slope_events_per_decade)} events per decade`}</p>
      <p className="muted">Eligible fit years: {regression.fit_year_count}{regression.fit_years.length > 0 ? ` (${regression.fit_years.join(', ')})` : ''}.</p>
      {regression.reason && <p>{regression.reason}</p>}<p className="muted">{regression.interpretation}</p>
    </div><div><h4>First / last five-year windows</h4>
      {comparison.first_window && <p>First: {comparison.first_window.start_year}–{comparison.first_window.end_year} · {formatMetric(comparison.first_window.mean_event_count)} events/year.</p>}
      {comparison.last_window && <p>Last: {comparison.last_window.start_year}–{comparison.last_window.end_year} · {formatMetric(comparison.last_window.mean_event_count)} events/year.</p>}
      <p>Absolute change: {formatMetric(comparison.absolute_change_events_per_year)}{comparison.absolute_change_events_per_year !== null ? ' events/year' : ''}.</p>
      <p>Percentage change: {formatMetric(comparison.percent_change)}{comparison.percent_change !== null ? '%' : ''}.</p>
      {comparison.reason && <p>{comparison.reason}</p>}{comparison.percentage_unavailable_reason && <p>{comparison.percentage_unavailable_reason}</p>}
    </div></div>
  </section>
}
