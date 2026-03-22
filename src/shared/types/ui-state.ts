import type { TimelineFilter } from '@/entities/timeline/model/types'

export type RightPanelTab = 'details' | 'ai' | 'chat'
export type Density = 'comfortable' | 'compact'

export interface UiQueryState {
  item: number | null
  filter: TimelineFilter
  tab: RightPanelTab
  density: Density
}

export const DEFAULT_UI_QUERY_STATE: UiQueryState = {
  item: 2,
  filter: 'all',
  tab: 'ai',
  density: 'comfortable',
}
