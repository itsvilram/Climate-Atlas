import { useId } from 'react'
import { Bar, CartesianGrid, Cell, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { AnalysisResponse } from '../types/analysis'
import { formatCoverage, formatMetric } from './metric-format'

type Row = AnalysisResponse['annual_metrics'][number]
type Field = 'event_count' | 'heatwave_days' | 'rolling_average_event_count' | 'mean_duration_days' | 'max_duration_days' | 'mean_exceedance_celsius'
type Series = { key: Field; label: string; unit: string; color: string; bar?: boolean; dashed?: boolean }
const configurations: { title: string; axis: string; definition: string; integer: boolean; series: Series[] }[] = [
  { title: 'Annual frequency', axis: 'Events / year', integer: true, definition: 'Events counted in their start year. The trailing five-year mean is supplied by the backend only for eligible windows.', series: [
    { key: 'event_count', label: 'Event starts', unit: 'events', color: '#17665c', bar: true },
    { key: 'rolling_average_event_count', label: '5-year mean', unit: 'events/year', color: '#875520', dashed: true },
  ] },
  { title: 'Heatwave days', axis: 'Days / year', integer: true, definition: 'Qualifying days allocated to their actual year, including events starting outside it.', series: [
    { key: 'heatwave_days', label: 'Heatwave days', unit: 'days', color: '#17665c', bar: true },
  ] },
  { title: 'Event duration', axis: 'Duration (days)', integer: false, definition: 'Full duration of events starting in each year, including days outside the selection.', series: [
    { key: 'mean_duration_days', label: 'Mean duration', unit: 'days', color: '#17665c' },
    { key: 'max_duration_days', label: 'Maximum duration', unit: 'days', color: '#875520', dashed: true },
  ] },
  { title: 'Heat intensity', axis: 'Exceedance (°C)', integer: false, definition: 'Mean daily exceedance above the fixed threshold across heatwave days occurring in each year.', series: [
    { key: 'mean_exceedance_celsius', label: 'Mean exceedance', unit: '°C', color: '#17665c' },
  ] },
]

export function AnnualTooltip({ row, series }: { row?: Row; series: Series[] }) {
  if (!row) return null
  return <div className="chart-tooltip"><strong>{row.year} · {row.complete && !row.partial ? 'Complete' : 'Incomplete / partial'}</strong>
    {series.map(item => <p key={item.key}>{item.label}: {formatMetric(row[item.key])}{row[item.key] !== null ? ` ${item.unit}` : ''}</p>)}
    <p>Coverage: {formatCoverage(row.coverage)}</p>
    {row.incomplete_reasons.map(reason => <p key={reason}>{reason}</p>)}
  </div>
}

function AnnualChart({ rows, config }: { rows: Row[]; config: typeof configurations[number] }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const incomplete = rows.filter(row => !row.complete || row.partial).map(row => row.year)
  return <section className="panel result-panel" aria-labelledby={`${id}-title`}>
    <h3 id={`${id}-title`}>{config.title}</h3><p className="chart-definition">{config.definition}</p>
    <div className="chart-legend">{config.series.map(series => <span key={series.key}><span aria-hidden="true" className={series.dashed ? 'legend-dashed' : 'legend-solid'} style={{ borderColor: series.color }} />{series.label} ({series.unit})</span>)}</div>
    <div className="annual-chart" role="img" aria-label={`${config.title}. ${config.axis}. Full values and quality flags in the annual metrics table.`}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <ComposedChart data={rows} margin={{ top: 18, right: 8, bottom: 22, left: 0 }} accessibilityLayer>
          <defs><pattern id={`${id}-partial`} width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#e9d4aa" /><path d="M0,6 L6,0" stroke="#815b17" strokeWidth="2" /></pattern></defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" minTickGap={16} tick={{ fontSize: 11 }} tickFormatter={year => `${year}${incomplete.includes(Number(year)) ? '*' : ''}`} label={{ value: 'Calendar year (* incomplete)', position: 'insideBottom', offset: -16, fontSize: 11 }} />
          <YAxis allowDecimals={!config.integer} width={42} tick={{ fontSize: 11 }} domain={[0, 'auto']} />
          <Tooltip content={({ active, label }) => active ? <AnnualTooltip row={rows.find(row => row.year === Number(label))} series={config.series} /> : null} />
          {config.series.map(series => series.bar ? <Bar dataKey={series.key} name={series.label} key={series.key} maxBarSize={26} fill={series.color} isAnimationActive={false}>
            {rows.map(row => <Cell key={row.year} fill={row.complete && !row.partial ? series.color : `url(#${id}-partial)`} />)}
          </Bar> : <Line key={series.key} dataKey={series.key} name={series.label} type="linear" stroke={series.color} strokeWidth={2} strokeDasharray={series.dashed ? '6 3' : undefined} connectNulls={false} isAnimationActive={false} dot={{ r: 2 }} />)}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
    <p className="muted">Vertical axis: {config.axis}. Null values remain gaps. <a href="#annual-title">View annual table</a>.</p>
    {incomplete.length > 0 && <p className="chart-quality">* Incomplete / partial years: {incomplete.join(', ')}. Hatched bars and starred year labels mark partial observations; see table for reasons.</p>}
  </section>
}

export default function AnnualCharts({ analysis }: { analysis: AnalysisResponse }) {
  return <div className="chart-grid">{configurations.map(config => <AnnualChart rows={analysis.annual_metrics} config={config} key={config.title} />)}</div>
}
