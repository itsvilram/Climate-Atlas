import type { AnalysisResponse } from '../types/analysis'
import { formatCoverage } from './metric-format'

export default function DataQualityPanel({ analysis }: { analysis: AnalysisResponse }) {
  const { methodology: { baseline_quality: baseline }, data_quality: quality, source, region } = analysis
  const incompleteBaseline = baseline.years.filter(year => year.coverage < analysis.methodology.minimum_coverage)
  return <section className="panel annual-panel" aria-labelledby="quality-title"><h2 id="quality-title">Data quality & source</h2>
    <p className="muted">{region.name} · {analysis.period.start_year}–{analysis.period.end_year}. Quality flags belong to this displayed response.</p>
    {quality.warnings.length ? <ul className="quality-notice">{quality.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul> : <p>No quality warnings were returned. This does not remove the methodology or spatial limitations.</p>}
    <dl className="metadata-grid"><div><dt>Baseline coverage</dt><dd>{formatCoverage(baseline.coverage)} · {baseline.valid_days} / {baseline.expected_days} valid days.</dd></div>
      <div><dt>Incomplete selected years</dt><dd>{quality.incomplete_years.length ? quality.incomplete_years.join(', ') : 'None reported'}. Incomplete years are excluded from eligible rolling averages, regression, and comparisons.</dd></div>
      <div><dt>Boundary exclusions</dt><dd>{quality.excluded_boundary_events.length} returned records excluded from complete metrics. Truncated runs and uncertain candidates remain visible in the <a href="#events-title">event table</a> with observed values separated from unknown full-event values.</dd></div>
      <div><dt>Representative city coordinate</dt><dd>{region.latitude}, {region.longitude} · {region.timezone}. Results describe a nearby weather grid point, not a city-wide average or local station observation.</dd></div>
      <div><dt>Provider / dataset</dt><dd><a href="https://open-meteo.com/">{source.provider}</a> · {source.dataset} · Model: {source.model}. Reanalysis is a modeled historical estimate informed by observations.</dd></div>
      <div><dt>Units and variable</dt><dd>{analysis.methodology.temperature_variable} · {analysis.methodology.temperature_unit}</dd></div>
      <div><dt>Analysis generation / cache</dt><dd><time dateTime={source.generated_at}>{source.generated_at}</time> · {source.analysis_cache_status}. Generation time differs from weather retrieval time.</dd></div>
      <div><dt>Attribution and changes</dt><dd>Weather data by <a href="https://open-meteo.com/">Open-Meteo</a>, {source.dataset}, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. {source.changes} <a href="https://open-meteo.com/en/docs/historical-weather-api">Provider documentation</a>.</dd></div>
    </dl>
    <details><summary>Baseline annual coverage ({baseline.years.length} years)</summary>
      {incompleteBaseline.length > 0 && <p>Below baseline coverage requirement: {incompleteBaseline.map(year => year.year).join(', ')}</p>}
      <div className="table-scroll" role="region" tabIndex={0} aria-label="Baseline annual coverage"><table><caption>Reference-period coverage</caption><thead><tr><th scope="col">Year</th><th scope="col">Valid / expected days</th><th scope="col">Coverage</th></tr></thead><tbody>{baseline.years.map(year => <tr key={year.year}><th scope="row">{year.year}</th><td>{year.valid_days} / {year.expected_days}</td><td>{formatCoverage(year.coverage)}</td></tr>)}</tbody></table></div>
    </details>
    <details><summary>Weather retrieval, cache, and returned grid points ({source.weather_years.length} years)</summary>
      <p className="muted">Each source year has its own retrieval time and freshness status. Stale means cached weather was used after refresh failed; it does not mean the analysis is current.</p>
      <div className="table-scroll" role="region" tabIndex={0} aria-label="Weather source records"><table><caption>Source-year provenance · Coordinate version {source.coordinate_version}, weather schema {source.weather_schema_version}</caption>
        <thead><tr>{['Year', 'Retrieved (UTC/offset)', 'Cache status', 'Coverage', 'Returned grid coordinate / timezone', 'Revision'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{source.weather_years.map(year => <tr key={year.year}><th scope="row">{year.year}</th><td><time dateTime={year.fetched_at}>{year.fetched_at}</time></td><td>{year.cache_status === 'stale' ? 'STALE — cached fallback' : year.cache_status}</td><td>{formatCoverage(year.coverage)}</td><td>{year.grid_coordinates.latitude}, {year.grid_coordinates.longitude} · {year.timezone}</td><td className="revision-cell">{year.revision}</td></tr>)}</tbody>
      </table></div>
    </details>
  </section>
}
