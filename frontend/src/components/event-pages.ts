import type { HeatwaveEvent } from '../types/analysis.ts'

export const EVENTS_PAGE_SIZE = 10
export function eventPage(events: HeatwaveEvent[], requested: number) {
  const pages = Math.max(1, Math.ceil(events.length / EVENTS_PAGE_SIZE))
  const page = Math.min(pages - 1, Math.max(0, Math.trunc(requested) || 0))
  return { page, pages, rows: events.slice(page * EVENTS_PAGE_SIZE, (page + 1) * EVENTS_PAGE_SIZE) }
}
