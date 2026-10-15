import type { AnalysisResponse } from '../types/analysis'
import { formatCoverage, formatMetric } from './metric-format'

export default function AnnualMetricsTable({ analysis }: { analysis: AnalysisResponse }) {
  return <section className="panel annual-panel" aria-labelledby="annual-title">
    <h3 id="annual-title">Annual metrics</h3>
    <p className="muted" id="annual-help">Events are counted by start year; days and intensity belong to the year each day occurs. Duration uses full events starting in that year. Not available means null, not zero. Scroll the table horizontally on narrow screens.</p>
    <div className="table-scroll" tabIndex={0} role="region" aria-label="Annual heatwave metrics, horizontally scrollable" aria-describedby="annual-help">
      <table><caption>{analysis.region.name} · {analysis.period.start_year}–{analysis.period.end_year} · Backend annual values (display rounded to two decimals)</caption>
        <thead><tr>{['Year', 'Event starts', 'Heatwave days', 'Mean duration (days)', 'Max duration (days)', 'Mean exceedance (°C)', 'Peak (°C)', '5-year mean (events/year)', 'Coverage', 'Quality'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{analysis.annual_metrics.map(row => <tr key={row.year}>
          <th scope="row">{row.year}</th><td>{formatMetric(row.event_count)}</td><td>{formatMetric(row.heatwave_days)}</td>
          <td>{formatMetric(row.mean_duration_days)}</td><td>{formatMetric(row.max_duration_days)}</td>
          <td>{formatMetric(row.mean_exceedance_celsius)}</td><td>{formatMetric(row.peak_temperature_celsius)}</td>
          <td>{formatMetric(row.rolling_average_event_count)}</td><td>{formatCoverage(row.coverage)}<br /><small>{row.valid_days} / {row.expected_days} days</small></td>
          <td>{row.complete && !row.partial ? 'Complete' : 'Incomplete / partial'}{row.incomplete_reasons.length > 0 && <ul>{row.incomplete_reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </section>
}
