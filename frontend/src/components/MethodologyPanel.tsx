import type { AnalysisResponse } from '../types/analysis'
import { formatCoverage, formatMetric } from './metric-format'

export default function MethodologyPanel({ analysis }: { analysis: AnalysisResponse }) {
  const method = analysis.methodology
  const counting = analysis.data_quality.counting_metadata
  return <section id="methodology" className="panel annual-panel methodology-panel" aria-labelledby="method-title">
    <p className="eyebrow">UNDERSTANDING THE ANALYSIS</p><h2 id="method-title">The method matters.</h2>
    <p>{analysis.region.name} · {analysis.period.start_year}–{analysis.period.end_year}. A historical analysis tool, not an official heat alert.</p>
    <dl className="metadata-grid"><div><dt>Fixed reference period</dt><dd>{method.baseline_start_year}–{method.baseline_end_year}, independent of selected years.</dd></div>
      <div><dt>Annual threshold</dt><dd>{formatMetric(method.threshold_celsius)} {method.temperature_unit} · {method.percentile}th percentile, {method.percentile_method} interpolation. Display rounded; calculations use the unrounded threshold.</dd></div>
      <div><dt>Qualifying run</dt><dd>Daily maximum temperature strictly above the threshold ({method.comparison}), for at least {method.minimum_run_days} consecutive calendar days. Equality does not qualify.</dd></div>
      <div><dt>Baseline quality requirement</dt><dd>At least {formatCoverage(method.minimum_coverage)} valid days overall and in each baseline year.</dd></div>
      <div><dt>Missing days</dt><dd>Missing or invalid observations break a run. No interpolation creates hot days. Leap days remain ordinary calendar days.</dd></div>
      <div><dt>Seasonal adjustment</dt><dd>{method.seasonal_adjustment ? 'Applied' : 'Not applied; one annual threshold is used.'}</dd></div>
    </dl><p className="quality-notice">{method.limitation}</p>
    <details><summary>Counting rules and method versions</summary><dl className="metadata-grid">
      {[['Event count', counting.event_count], ['Duration', counting.duration], ['Heatwave days', counting.heatwave_days], ['Intensity', counting.intensity], ['Peak', counting.peak], ['Boundary policy', counting.boundary_policy]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      <div><dt>Method versions</dt><dd>{method.method_version} · Threshold: {method.threshold_method_version}</dd></div>
    </dl></details>
  </section>
}
