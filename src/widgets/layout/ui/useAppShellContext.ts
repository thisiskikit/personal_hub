import type { AutomationRule } from '@/entities/automation/model/types'
import type { BudgetItem, FinanceSummary } from '@/entities/finance/model/types'
import type { TimelineFilter, TimelineItem } from '@/entities/timeline/model/types'
import { useOutletContext } from 'react-router-dom'
import type { ActiveMenu } from '@/shared/types/navigation'
import type { Density, RightPanelTab, UiQueryState } from '@/shared/types/ui-state'

export type QuickAddType = 'event' | 'finance' | 'memo' | 'task' | 'ai'

export type InboxStatus = 'draft' | 'needs_review' | 'scheduled' | 'saved' | 'dismissed'

export interface InboxItem {
  id: number
  title: string
  typeCandidate: QuickAddType
  createdAt: string
  status: InboxStatus
}

export type NotificationGroup = 'action_required' | 'ai_approval' | 'upcoming'

export interface NotificationItem {
  id: number
  title: string
  description: string
  time: string
  status: 'new' | 'read'
  group: NotificationGroup
  targetTab?: RightPanelTab
  targetItemId?: number
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
  selectedInboxItemId: number | null
  setSelectedInboxItemId: (id: number | null) => void
  notifications: NotificationItem[]
  isLoading: boolean
  hasError: boolean
  onQuickAddSubmit: (payload: {
    text: string
    type: QuickAddType
    saveMode: 'inbox' | 'event' | 'memo'
  }) => void
  onInboxAction: (itemId: number, destination: 'event' | 'finance' | 'memo' | 'task' | 'dismiss') => void
  onMarkAllNotificationsRead: () => void
  onNotificationClick: (notificationId: number) => void
  onTimelineStatusChange: (itemId: number, status: 'completed' | 'saved') => void
  onAssignCategory: (itemId: number, category: string) => void
  onToggleRule: (ruleId: number, active: boolean) => void
  selectTimelineFilter: (filter: TimelineFilter) => void
  selectDensity: (density: Density) => void
  selectRightPanelTab: (tab: RightPanelTab) => void
  selectItem: (itemId: number) => void
}

export const useAppShellContext = () => useOutletContext<AppShellContextValue>()
