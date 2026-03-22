import type { AutomationRule } from '@/entities/automation/model/types'
import type { BudgetItem, FinanceSummary } from '@/entities/finance/model/types'
import type { TimelineFilter, TimelineItem, TimelineType } from '@/entities/timeline/model/types'
import { useOutletContext } from 'react-router-dom'
import type { ActiveMenu } from '@/shared/types/navigation'
import type { Density, RightPanelTab, UiQueryState } from '@/shared/types/ui-state'

export type InboxStatus = 'draft' | 'needs_review' | 'scheduled' | 'saved' | 'dismissed'

export interface InboxItem {
  id: number
  title: string
  typeCandidate: TimelineType | 'ai_request'
  createdAt: string
  status: InboxStatus
}

export type NotificationGroup = 'processing' | 'ai_approval' | 'upcoming'

export interface NotificationItem {
  id: number
  group: NotificationGroup
  title: string
  description: string
  time: string
  statusLabel: string
  isRead: boolean
  target?: {
    menu?: ActiveMenu
    tab?: RightPanelTab
    itemId?: number
  }
}

export type AssistantSaveMode = 'inbox' | 'event' | 'memo'

export interface AssistantPendingAction {
  id: string
  title: string
  typeCandidate: InboxItem['typeCandidate']
  suggestedMode: AssistantSaveMode
}

export interface AssistantMessage {
  id: string
  role: 'user' | 'ai'
  text: string
  pendingAction?: AssistantPendingAction
}

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
  inboxItems: InboxItem[]
  activeInboxCount: number
  notifications: NotificationItem[]
  selectedItemId: number | null
  isCommandPaletteOpen: boolean
  setIsCommandPaletteOpen: (value: boolean) => void
  selectInboxItem: (id: number) => void
  processInboxItem: (id: number, destination: TimelineType | 'dismissed') => void
  addInboxItem: (payload: { title: string; typeCandidate: InboxItem['typeCandidate']; status?: InboxStatus }) => void
  markNotificationsRead: () => void
  openNotification: (notificationId: number) => void
  completeTimelineItem: (itemId: number) => void
  isLoading: boolean
  hasError: boolean
  onAssignCategory: (itemId: number, category: string) => void
  itemActionPrompt: string
  setItemActionPrompt: (prompt: string) => void
  onToggleRule: (ruleId: number, active: boolean) => void
  assistantMessages: AssistantMessage[]
  sendAssistantMessage: (message: string) => void
  confirmAssistantSave: (actionId: string, mode: AssistantSaveMode) => void
  selectTimelineFilter: (filter: TimelineFilter) => void
  selectDensity: (density: Density) => void
  selectRightPanelTab: (tab: RightPanelTab) => void
  selectItem: (itemId: number) => void
}

export const useAppShellContext = () => useOutletContext<AppShellContextValue>()
