import { validateAnalysisResponse, validateRegionsResponse, validateSelection, validateErrorResponse } from './generated/validators.js'
import type { AnalysisResponse, RegionsResponse, Selection, ValidationDetail } from '../types/analysis.ts'

export const ANALYSIS_TIMEOUT_MS = 270_000
export const REGIONS_TIMEOUT_MS = 15_000
export type ErrorKind = 'http' | 'network' | 'timeout' | 'aborted' | 'invalid_response' | 'invalid_request'

export class ApiError extends Error {
  readonly kind: ErrorKind
  readonly code: string
  readonly status?: number
  readonly details?: ValidationDetail[]
  readonly retryAfterSeconds?: number

  constructor(kind: ErrorKind, message: string, options: {
    code?: string; status?: number; details?: ValidationDetail[]; retryAfterSeconds?: number
  } = {}) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.code = options.code ?? kind
    this.status = options.status
    this.details = options.details
    this.retryAfterSeconds = options.retryAfterSeconds
  }
}

export function parseRetryAfter(value: string | null, now = Date.now()): number | undefined {
  if (value === null || value.trim() === '') return undefined
  const text = value.trim()
  if (/^\d+$/.test(text)) {
    const seconds = Number(text)
    return Number.isSafeInteger(seconds) ? seconds : undefined
  }
  // Date.parse also accepts bare numbers and informal dates; require an HTTP-date.
  if (!/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(text)) return undefined
  const date = Date.parse(text)
  return Number.isFinite(date) ? Math.max(0, Math.ceil((date - now) / 1000)) : undefined
}

function baseUrl(value: string): string {
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error()
    return url.href.replace(/\/+$/, '')
  } catch {
    throw new Error('Configure VITE_API_BASE_URL as a public HTTP(S) backend URL without credentials, query, or fragment.')
  }
}

export function createApiClient(config: {
  baseUrl: string; fetch?: typeof fetch; analysisTimeoutMs?: number; regionsTimeoutMs?: number
}) {
  const base = baseUrl(config.baseUrl)
  const fetcher = config.fetch ?? globalThis.fetch.bind(globalThis)
  const analysisTimeout = config.analysisTimeoutMs ?? ANALYSIS_TIMEOUT_MS
  const regionsTimeout = config.regionsTimeoutMs ?? REGIONS_TIMEOUT_MS
  for (const timeout of [analysisTimeout, regionsTimeout]) {
    if (!Number.isFinite(timeout) || timeout <= 0 || timeout > 2_147_483_647) throw new Error('Invalid API timeout configuration.')
  }

  async function request<T>(path: string, timeout: number, validate: (value: unknown) => value is T,
    body: Selection | undefined, signal?: AbortSignal): Promise<T> {
    const controller = new AbortController()
    let stopped: 'timeout' | 'aborted' | undefined
    const stop = (reason: 'timeout' | 'aborted') => {
      if (stopped) return
      stopped = reason
      controller.abort()
    }
    const onAbort = () => stop('aborted')
    if (signal?.aborted) throw new ApiError('aborted', 'Request cancelled.')
    signal?.addEventListener('abort', onAbort, { once: true })
    const timer = setTimeout(() => stop('timeout'), timeout)
    try {
      const response = await fetcher(`${base}${path}`, {
        method: body === undefined ? 'GET' : 'POST',
        headers: body === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: controller.signal, credentials: 'omit', redirect: 'error',
      })
      let payload: unknown
      try { payload = await response.json() } catch {
        if (stopped) throw new ApiError(stopped, stopped === 'timeout' ? 'The request timed out. Please retry deliberately.' : 'Request cancelled.')
        throw new ApiError(response.ok ? 'invalid_response' : 'http', response.ok
          ? 'The backend returned an unreadable response.' : 'The backend could not complete this request.',
        { status: response.status, retryAfterSeconds: parseRetryAfter(response.headers.get('Retry-After')) })
      }
      if (stopped) throw new ApiError(stopped, stopped === 'timeout' ? 'The request timed out. Please retry deliberately.' : 'Request cancelled.')
      if (!response.ok) {
        const retryAfterSeconds = parseRetryAfter(response.headers.get('Retry-After'))
        if (validateErrorResponse(payload)) {
          throw new ApiError('http', payload.error.message, { status: response.status,
            code: payload.error.code, details: payload.error.details ?? undefined, retryAfterSeconds })
        }
        throw new ApiError('http', 'The backend could not complete this request.', { status: response.status, retryAfterSeconds })
      }
      if (!validate(payload)) throw new ApiError('invalid_response', 'The backend response does not match the supported API contract.', { status: response.status })
      return payload
    } catch (error) {
      if (error instanceof ApiError) throw error
      if (stopped) throw new ApiError(stopped, stopped === 'timeout' ? 'The request timed out. Please retry deliberately.' : 'Request cancelled.')
      throw new ApiError('network', 'Unable to reach the backend. Check the connection and try again.')
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
    }
  }

  return {
    getRegions: (signal?: AbortSignal): Promise<RegionsResponse> => request('/api/v1/regions', regionsTimeout, validateRegionsResponse, undefined, signal),
    analyze: (selection: Selection, signal?: AbortSignal): Promise<AnalysisResponse> => {
      if (!validateSelection(selection) || (selection.start_year ?? 1990) > (selection.end_year ?? 2020)) {
        return Promise.reject(new ApiError('invalid_request', 'Choose a supported city, hazard, and ordered year range.'))
      }
      return request('/api/v1/analyses', analysisTimeout, validateAnalysisResponse, selection, signal)
    },
  }
}

/** Called by the dashboard in F03; importing this module makes no network request. */
export function configuredApiClient() {
  return createApiClient({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '' })
}
