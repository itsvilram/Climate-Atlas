import { ApiError } from '../api/client.ts'
import type { AnalysisResponse, RegionsResponse, Selection } from '../types/analysis.ts'

export type Filters = { region_id: string; start_year: string; end_year: string }
export type AnalysisState = {
  regions?: RegionsResponse; regionsLoading: boolean; regionsError?: ApiError
  filters: Filters; validation?: string; loading: boolean; requested?: Selection
  result?: AnalysisResponse; error?: ApiError; cancelled: boolean
}
export type AnalysisApi = {
  getRegions(signal?: AbortSignal): Promise<RegionsResponse>
  analyze(selection: Selection, signal?: AbortSignal): Promise<AnalysisResponse>
}

export function validateFilters(filters: Filters, regions: RegionsResponse): string | undefined {
  if (!regions.regions.some(region => region.id === filters.region_id)) return 'Choose a supported city.'
  const { min, max } = regions.supported_years ?? {}
  if (min === undefined || max === undefined) return 'Supported years are unavailable. Reload city options.'
  if (!/^\d{4}$/.test(filters.start_year) || !/^\d{4}$/.test(filters.end_year)) return 'Enter a four-digit whole year in both fields.'
  const start = Number(filters.start_year), end = Number(filters.end_year)
  if (start < min || start > max || end < min || end > max) return `Choose years from ${min} to ${max}.`
  if (start > end) return 'Start year must be on or before end year.'
}

function safeError(error: unknown): ApiError {
  return error instanceof ApiError ? error : new ApiError('network', 'Unable to reach the backend. Please try again.')
}

/** Request ownership is independent of fetch abort: late success/error cannot commit. */
export function createAnalysisStore(api: AnalysisApi) {
  let state: AnalysisState = { regionsLoading: false, filters: { region_id: '', start_year: '', end_year: '' }, loading: false, cancelled: false }
  const listeners = new Set<() => void>()
  let regionRequest = 0, analysisRequest = 0
  let regionAbort: AbortController | undefined, analysisAbort: AbortController | undefined
  const publish = (patch: Partial<AnalysisState>) => { state = { ...state, ...patch }; listeners.forEach(listener => listener()) }
  const cancel = (announce = true) => {
    ++analysisRequest; analysisAbort?.abort(); analysisAbort = undefined
    if (state.loading) publish({ loading: false, requested: undefined, cancelled: announce })
  }
  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } },
    async loadRegions() {
      const id = ++regionRequest
      regionAbort?.abort(); regionAbort = new AbortController()
      publish({ regionsLoading: true, regionsError: undefined })
      try {
        const regions = await api.getRegions(regionAbort.signal)
        if (id !== regionRequest) return
        const defaults = regions.defaults
        if (!defaults || defaults.region_id === undefined || defaults.start_year === undefined || defaults.end_year === undefined ||
            regions.regions.length === 0 || !regions.supported_years ||
            validateFilters({ region_id: defaults.region_id, start_year: String(defaults.start_year), end_year: String(defaults.end_year) }, regions)) {
          throw new ApiError('invalid_response', 'The backend did not provide usable city defaults and year limits.')
        }
        publish({ regions, regionsLoading: false, filters: { region_id: defaults.region_id,
          start_year: String(defaults.start_year), end_year: String(defaults.end_year) } })
      } catch (error) {
        if (id === regionRequest) publish({ regionsLoading: false, regionsError: safeError(error) })
      }
    },
    setFilters(patch: Partial<Filters>) {
      cancel()
      publish({ filters: { ...state.filters, ...patch }, validation: undefined, error: undefined })
    },
    cancel,
    async submit() {
      if (state.loading || !state.regions || state.regionsLoading || state.regionsError) return
      const validation = validateFilters(state.filters, state.regions)
      if (validation) { publish({ validation }); return }
      const region = state.regions.regions.find(item => item.id === state.filters.region_id)!
      const selection: Selection = { region_id: region.id, start_year: Number(state.filters.start_year),
        end_year: Number(state.filters.end_year), hazard: 'heatwave' }
      const id = ++analysisRequest
      analysisAbort = new AbortController()
      publish({ loading: true, requested: selection, validation: undefined, error: undefined, cancelled: false })
      try {
        const result = await api.analyze(selection, analysisAbort.signal)
        if (id !== analysisRequest) return
        if (result.region.id !== selection.region_id || result.period.start_year !== selection.start_year ||
            result.period.end_year !== selection.end_year || result.period.hazard !== selection.hazard) {
          throw new ApiError('invalid_response', 'The response does not match the requested selection.')
        }
        publish({ result, loading: false, requested: undefined })
      } catch (error) {
        if (id !== analysisRequest) return
        publish({ loading: false, requested: undefined, error: safeError(error) })
      } finally { if (id === analysisRequest) analysisAbort = undefined }
    },
    dispose() { ++regionRequest; regionAbort?.abort(); cancel(false) },
  }
}
