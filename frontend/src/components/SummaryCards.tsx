import type { AnalysisResponse } from '../types/analysis'
import { formatMetric } from './metric-format'

export default function SummaryCards({ analysis }: { analysis?: AnalysisResponse }) {
  const summary = analysis?.summary
  const cards = [
    { title: 'Event starts', value: summary?.event_count, unit: 'events', caption: 'Events beginning in the selected years' },
    { title: 'Heatwave days', value: summary?.heatwave_days, unit: 'days', caption: 'Qualifying days within the selected years' },
    { title: 'Mean duration', value: summary?.mean_duration_days, unit: 'days', caption: 'Full duration of events beginning in the selected years' },
    { title: 'Peak temperature', value: summary?.peak_temperature_celsius, unit: '°C', caption: 'Highest qualifying daily maximum within the selected years' },
  ]
  return <div>
    {summary?.partial && <p className="quality-notice">Partial results: some years or event boundaries are incomplete. Observed totals may undercount events; see annual quality flags.</p>}
    <div className="metric-grid">{cards.map(card => <section className="panel metric" key={card.title} aria-label={card.title}>
      <h3>{card.title}</h3><p className={`metric-value${card.value === undefined || card.value === null ? ' unavailable-value' : ''}`}>
        {card.value === undefined ? 'Not analyzed' : formatMetric(card.value)}
        {card.value !== undefined && card.value !== null && <span className="metric-unit"> {card.unit}</span>}
      </p><p className="metric-caption">{card.caption}</p>
    </section>)}</div>
  </div>
}
