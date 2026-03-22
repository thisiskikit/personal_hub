import type { AutomationRule } from '@/entities/automation/model/types'
import type { BudgetItem, FinanceSummary } from '@/entities/finance/model/types'
import type { TimelineFilter, TimelineItem } from '@/entities/timeline/model/types'

export interface TimelineParams {
  type?: TimelineFilter
}

export interface DataProvider {
  getDashboardSummary: () => Promise<FinanceSummary>
  getFinanceBudget: () => Promise<BudgetItem[]>
  getTimeline: (params?: TimelineParams) => Promise<TimelineItem[]>
  getAutomationRules: () => Promise<AutomationRule[]>
  updateTimelineCategory: (itemId: number, category: string) => Promise<TimelineItem | null>
  toggleAutomationRule: (ruleId: number, active: boolean) => Promise<AutomationRule | null>
}
