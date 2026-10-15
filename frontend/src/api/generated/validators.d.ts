import type { AnalysisResponse, RegionsResponse, Selection, ErrorResponse } from '../../types/analysis'

export function validateAnalysisResponse(value: unknown): value is AnalysisResponse
export function validateRegionsResponse(value: unknown): value is RegionsResponse
export function validateSelection(value: unknown): value is Selection
export function validateErrorResponse(value: unknown): value is ErrorResponse
