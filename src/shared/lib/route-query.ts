import type { TimelineFilter, TimelineType } from '@/entities/timeline/model/types'
import type { Density, RightPanelTab, UiQueryState } from '@/shared/types/ui-state'
import { DEFAULT_UI_QUERY_STATE } from '@/shared/types/ui-state'

const ALLOWED_FILTERS: TimelineFilter[] = ['all', 'task', 'finance', 'event', 'memo']
const ALLOWED_TABS: RightPanelTab[] = ['details', 'ai', 'chat']
const ALLOWED_DENSITIES: Density[] = ['comfortable', 'compact']

const isTimelineType = (value: string): value is TimelineType =>
  ['task', 'finance', 'event', 'memo'].includes(value)

const toPositiveInt = (value: string | null): number | null => {
  if (!value) return null
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) return null
  return parsed
}

export const parseFilter = (value: string | null): TimelineFilter => {
  if (!value) return DEFAULT_UI_QUERY_STATE.filter
  if (ALLOWED_FILTERS.includes(value as TimelineFilter)) return value as TimelineFilter
  if (isTimelineType(value)) return value
  return DEFAULT_UI_QUERY_STATE.filter
}

export const parseTab = (value: string | null): RightPanelTab => {
  if (!value) return DEFAULT_UI_QUERY_STATE.tab
  if (ALLOWED_TABS.includes(value as RightPanelTab)) return value as RightPanelTab
  return DEFAULT_UI_QUERY_STATE.tab
}

export const parseDensity = (value: string | null): Density => {
  if (!value) return DEFAULT_UI_QUERY_STATE.density
  if (ALLOWED_DENSITIES.includes(value as Density)) return value as Density
  return DEFAULT_UI_QUERY_STATE.density
}

export const parseUiQueryState = (params: URLSearchParams): UiQueryState => ({
  item: toPositiveInt(params.get('item')) ?? DEFAULT_UI_QUERY_STATE.item,
  filter: parseFilter(params.get('filter')),
  tab: parseTab(params.get('tab')),
  density: parseDensity(params.get('density')),
})

export const serializeUiQueryState = (
  prev: URLSearchParams,
  patch: Partial<UiQueryState>,
): URLSearchParams => {
  const next = new URLSearchParams(prev)
  const current = parseUiQueryState(next)
  const merged: UiQueryState = {
    ...current,
    ...patch,
  }

  const setOrDelete = (key: string, value: string | number | null, fallback: string | number) => {
    if (value === null || value === fallback) {
      next.delete(key)
      return
    }
    next.set(key, String(value))
  }

  setOrDelete('item', merged.item, DEFAULT_UI_QUERY_STATE.item ?? '')
  setOrDelete('filter', merged.filter, DEFAULT_UI_QUERY_STATE.filter)
  setOrDelete('tab', merged.tab, DEFAULT_UI_QUERY_STATE.tab)
  setOrDelete('density', merged.density, DEFAULT_UI_QUERY_STATE.density)

  return next
}
