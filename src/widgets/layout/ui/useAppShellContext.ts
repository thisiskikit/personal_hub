import type { AutomationRule } from '@/entities/automation/model/types'
import type { BudgetItem, FinanceSummary } from '@/entities/finance/model/types'
import type { TimelineFilter, TimelineItem } from '@/entities/timeline/model/types'
import { useOutletContext } from 'react-router-dom'
import type { ActiveMenu } from '@/shared/types/navigation'
import type { Density, RightPanelTab, UiQueryState } from '@/shared/types/ui-state'

export interface AppShellContextValue {
  activeMenu: ActiveMenu
  ui: UiQueryState
  setUi: (patch: Partial<UiQueryState>) => void
  selectedItem: TimelineItem | null
  timelineItems: TimelineItem[]
  filteredItems: TimelineItem[]
  financeSummary: FinanceSummary
  budgetItems: BudgetItem[]
  automationRules: AutomationRule[]
  notesTag: string
  setNotesTag: (value: string) => void
  isQuickAddOpen: boolean
  setIsQuickAddOpen: (value: boolean) => void
  isLoading: boolean
  hasError: boolean
  onAssignCategory: (itemId: number, category: string) => void
  onToggleRule: (ruleId: number, active: boolean) => void
  selectTimelineFilter: (filter: TimelineFilter) => void
  selectDensity: (density: Density) => void
  selectRightPanelTab: (tab: RightPanelTab) => void
  selectItem: (itemId: number) => void
}

export const useAppShellContext = () => useOutletContext<AppShellContextValue>()
