export const formatMetric = (value: number | null): string => value === null
  ? 'Not available' : new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value)

export const formatCoverage = (value: number): string => new Intl.NumberFormat('en-IN', {
  style: 'percent', maximumFractionDigits: 2,
}).format(value)
