import type { AutomationRule } from '@/entities/automation/model/types'
import type { TimelineItem } from '@/entities/timeline/model/types'
import type { DataProvider, TimelineParams } from '@/shared/api/data-provider'

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
}
