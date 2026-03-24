import type { AutomationRule } from '@/entities/automation/model/types'
import type { BudgetItem, FinanceSummary } from '@/entities/finance/model/types'
import type { TimelineFilter, TimelineItem } from '@/entities/timeline/model/types'
import type {
  AiEnvelope,
  DashboardBriefingResponse,
  InboxParseResponse,
  ItemAnalysisResponse,
  PromptProfile,
  RuleDraftResponse,
} from '@/shared/types/ai'

export interface TimelineParams {
  type?: TimelineFilter
}

export interface DataProvider {
  getDashboardSummary: () => Promise<FinanceSummary>
  getFinanceBudget: () => Promise<BudgetItem[]>
  getTimeline: (params?: TimelineParams) => Promise<TimelineItem[]>
  getAutomationRules: () => Promise<AutomationRule[]>
  createAutomationRule: (payload: {
    trigger: string
    conditionText?: string
    action: string
    category?: string
    status?: 'draft' | 'approved' | 'rejected' | 'live'
    approvalRequired?: boolean
    active?: boolean
  }) => Promise<AutomationRule>
  updateTimelineCategory: (itemId: number, category: string) => Promise<TimelineItem | null>
  toggleAutomationRule: (ruleId: number, active: boolean) => Promise<AutomationRule | null>
  getPromptProfiles: () => Promise<PromptProfile[]>
  updatePromptProfile: (key: string, promptText: string) => Promise<PromptProfile>
  inboxParse: (input: string, model?: string) => Promise<AiEnvelope<InboxParseResponse>>
  analyzeItem: (itemId: number, model?: string) => Promise<AiEnvelope<ItemAnalysisResponse>>
  draftRule: (input: string, model?: string) => Promise<AiEnvelope<RuleDraftResponse>>
  getDashboardBriefing: (model?: string) => Promise<AiEnvelope<DashboardBriefingResponse>>
}
