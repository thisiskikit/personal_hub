import type { AutomationRule } from '@/entities/automation/model/types'
import type { TimelineItem } from '@/entities/timeline/model/types'
import type { DataProvider, TimelineParams } from '@/shared/api/data-provider'
import {
  automationRulesSeed,
  budgetItemsSeed,
  financeSummarySeed,
  timelineItemsSeed,
} from '@/shared/api/mock-data'

interface MockDb {
  financeSummary: typeof financeSummarySeed
  budgetItems: typeof budgetItemsSeed
  timelineItems: TimelineItem[]
  automationRules: AutomationRule[]
}

const clone = <T>(value: T): T => structuredClone(value)

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

const db: MockDb = {
  financeSummary: clone(financeSummarySeed),
  budgetItems: clone(budgetItemsSeed),
  timelineItems: clone(timelineItemsSeed),
  automationRules: clone(automationRulesSeed),
}

const filterTimeline = (items: TimelineItem[], params?: TimelineParams) => {
  if (!params || !params.type || params.type === 'all') return items
  return items.filter((item) => item.type === params.type)
}

export const mockDataProvider: DataProvider = {
  async getDashboardSummary() {
    await delay()
    return clone(db.financeSummary)
  },
  async getFinanceBudget() {
    await delay()
    return clone(db.budgetItems)
  },
  async getTimeline(params) {
    await delay()
    const filtered = filterTimeline(db.timelineItems, params)
    return clone(filtered)
  },
  async getAutomationRules() {
    await delay()
    return clone(db.automationRules)
  },
  async updateTimelineCategory(itemId, category) {
    await delay()
    const target = db.timelineItems.find((item) => item.id === itemId)
    if (!target || target.type !== 'finance') return null

    target.category = category
    if (target.status === 'pending_category') {
      target.status = 'completed'
      db.financeSummary.pendingCount = Math.max(db.financeSummary.pendingCount - 1, 0)
    }

    return clone(target)
  },
  async toggleAutomationRule(ruleId, active) {
    await delay()
    const target = db.automationRules.find((rule) => rule.id === ruleId)
    if (!target) return null
    target.active = active
    return clone(target)
  },
}
