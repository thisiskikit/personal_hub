import type { AutomationRule } from '@/entities/automation/model/types'
import type { TimelineItem } from '@/entities/timeline/model/types'
import type { DataProvider, TimelineParams } from '@/shared/api/data-provider'
import type {
  DashboardBriefingResponse,
  InboxParseResponse,
  ItemAnalysisResponse,
  PromptProfile,
  RuleDraftResponse,
} from '@/shared/types/ai'
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

const MOCK_DB_STORAGE_KEY = 'mockDataProviderDb'
const MOCK_PROMPT_STORAGE_KEY = 'mockPromptProfiles'

const clone = <T>(value: T): T => structuredClone(value)

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

const db: MockDb = {
  financeSummary: clone(financeSummarySeed),
  budgetItems: clone(budgetItemsSeed),
  timelineItems: clone(timelineItemsSeed),
  automationRules: clone(automationRulesSeed),
}

const promptProfiles: PromptProfile[] = [
  {
    id: 1,
    key: 'global_system_prompt',
    label: '전역 시스템 프롬프트',
    promptText: '운영 비서 톤으로 간결하게 답변',
    isSystem: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    key: 'item_analysis_prompt',
    label: '항목 분석 프롬프트',
    promptText: '분류/다음 액션/승인 필요 여부를 제안',
    isSystem: false,
    updatedAt: new Date().toISOString(),
  },
]

const readLocal = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback
  const raw = window.localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const writeLocal = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

const restoreMockState = () => {
  const storedDb = readLocal<MockDb | null>(MOCK_DB_STORAGE_KEY, null)
  const storedPrompts = readLocal<PromptProfile[] | null>(MOCK_PROMPT_STORAGE_KEY, null)

  if (storedDb) {
    db.financeSummary = storedDb.financeSummary
    db.budgetItems = storedDb.budgetItems
    db.timelineItems = storedDb.timelineItems
    db.automationRules = storedDb.automationRules
  }

  if (storedPrompts?.length) {
    promptProfiles.splice(0, promptProfiles.length, ...storedPrompts)
  }
}

const persistMockDb = () => {
  writeLocal(MOCK_DB_STORAGE_KEY, db)
}

const persistPromptProfiles = () => {
  writeLocal(MOCK_PROMPT_STORAGE_KEY, promptProfiles)
}

restoreMockState()

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
  async createAutomationRule(payload) {
    await delay()
    const item: AutomationRule = {
      id: Date.now(),
      trigger: payload.trigger,
      conditionText: payload.conditionText,
      action: payload.action,
      category: payload.category,
      status: payload.status,
      approvalRequired: payload.approvalRequired,
      createdBy: 'ai',
      active: Boolean(payload.active),
    }
    db.automationRules = [item, ...db.automationRules]
    persistMockDb()
    return clone(item)
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

    persistMockDb()

    return clone(target)
  },
  async toggleAutomationRule(ruleId, active) {
    await delay()
    const target = db.automationRules.find((rule) => rule.id === ruleId)
    if (!target) return null
    target.active = active
    persistMockDb()
    return clone(target)
  },
  async getPromptProfiles() {
    await delay()
    return clone(promptProfiles)
  },
  async updatePromptProfile(key, promptText) {
    await delay()
    const target = promptProfiles.find((profile) => profile.key === key)
    if (!target) throw new Error('Prompt profile not found')
    target.promptText = promptText
    target.updatedAt = new Date().toISOString()
    persistPromptProfiles()
    return clone(target)
  },
  async inboxParse(input, _model) {
    await delay()
    const data: InboxParseResponse = {
      mode: 'inbox_parse',
      summary: '입력을 인박스 후보로 분석했습니다.',
      primary_type: /(내일|오후|오전|\d+시)/.test(input) ? 'event' : 'memo',
      secondary_types: [],
      confidence: 0.68,
      clarification_needed: false,
      recommended_save_mode: /(내일|오후|오전|\d+시)/.test(input) ? 'event' : 'inbox',
      entities: {
        title: input,
        datetime_text: null,
        amount_text: null,
        location: null,
        people: [],
        tags: [],
      },
      suggested_actions: ['저장 모드 선택'],
    }
    return { ok: true, data }
  },
  async analyzeItem(itemId, _model) {
    await delay()
    const data: ItemAnalysisResponse = {
      mode: 'item_analysis',
      item_id: itemId,
      summary: '선택 항목 분석 결과입니다.',
      best_interpretation: '후속 처리가 필요한 운영 항목입니다.',
      alternative_interpretations: [],
      confidence: 0.7,
      approval_required: true,
      suggested_actions: ['관련 메모 작성'],
      rule_draft: null,
    }
    return { ok: true, data }
  },
  async draftRule(input, _model) {
    await delay()
    const data: RuleDraftResponse = {
      mode: 'rule_draft',
      human_summary: '자동화 규칙 초안을 만들었습니다.',
      trigger_text: input,
      condition_text: '조건 충족 시',
      action_text: '후속 조치 실행',
      category: '운영',
      approval_required: true,
      default_active: false,
      risk_level: 'medium',
    }
    return { ok: true, data }
  },
  async getDashboardBriefing(_model) {
    await delay()
    const data: DashboardBriefingResponse = {
      mode: 'dashboard_briefing',
      headline: '운영 우선순위: 인박스와 일정 점검',
      bullets: ['미분류 항목을 먼저 처리하세요.', '오후 일정 전 메모를 확인하세요.'],
      priority_score: 72,
    }
    return { ok: true, data }
  },
}
