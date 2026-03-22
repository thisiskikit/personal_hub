import type { AutomationRule } from '@/entities/automation/model/types'
import type { TimelineItem } from '@/entities/timeline/model/types'
import type { DataProvider, TimelineParams } from '@/shared/api/data-provider'
import type {
  AiEnvelope,
  DashboardBriefingResponse,
  InboxParseResponse,
  ItemAnalysisResponse,
  PromptProfile,
  RuleDraftResponse,
} from '@/shared/types/ai'

const BASE = '/api'

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? res.statusText)
  }
  return res.json() as Promise<T>
}

export const apiDataProvider: DataProvider = {
  getDashboardSummary() {
    return apiFetch('/dashboard-summary')
  },
  getFinanceBudget() {
    return apiFetch('/finance-budget')
  },
  getTimeline(params?: TimelineParams) {
    const qs = params?.type && params.type !== 'all' ? `?type=${params.type}` : ''
    return apiFetch(`/timeline${qs}`)
  },
  getAutomationRules() {
    return apiFetch('/automation-rules')
  },
  createAutomationRule(payload): Promise<AutomationRule> {
    return apiFetch('/automation-rules', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateTimelineCategory(itemId: number, category: string): Promise<TimelineItem | null> {
    return apiFetch(`/timeline/${itemId}/category`, {
      method: 'PATCH',
      body: JSON.stringify({ category }),
    })
  },
  toggleAutomationRule(ruleId: number, active: boolean): Promise<AutomationRule | null> {
    return apiFetch(`/automation-rules/${ruleId}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    })
  },
  getPromptProfiles(): Promise<PromptProfile[]> {
    return apiFetch('/prompt-profiles')
  },
  updatePromptProfile(key: string, promptText: string): Promise<PromptProfile> {
    return apiFetch(`/prompt-profiles/${key}`, {
      method: 'PATCH',
      body: JSON.stringify({ promptText }),
    })
  },
  inboxParse(input: string): Promise<AiEnvelope<InboxParseResponse>> {
    return apiFetch('/ai/inbox-parse', {
      method: 'POST',
      body: JSON.stringify({ input }),
    })
  },
  analyzeItem(itemId: number): Promise<AiEnvelope<ItemAnalysisResponse>> {
    return apiFetch('/ai/analyze-item', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    })
  },
  draftRule(input: string): Promise<AiEnvelope<RuleDraftResponse>> {
    return apiFetch('/ai/rule-draft', {
      method: 'POST',
      body: JSON.stringify({ input }),
    })
  },
  getDashboardBriefing(): Promise<AiEnvelope<DashboardBriefingResponse>> {
    return apiFetch('/ai/dashboard-briefing')
  },
}
