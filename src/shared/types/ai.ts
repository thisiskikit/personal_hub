export interface PromptProfile {
  id: number
  key: string
  label: string
  promptText: string
  isSystem: boolean
  updatedAt: string
}

export type AiModelOption =
  | 'gpt-5.4'
  | 'gpt-5.3'
  | 'gpt-5.2'
  | 'gpt-5.1'
  | 'gpt-5'
  | 'gemini-1.5-flash'

export type AssistantSaveMode = 'inbox' | 'event' | 'memo'

export interface InboxParseResponse {
  mode: 'inbox_parse'
  summary: string
  primary_type: 'finance' | 'event' | 'memo' | 'task'
  secondary_types: string[]
  confidence: number
  clarification_needed: boolean
  recommended_save_mode: AssistantSaveMode
  entities: {
    title: string
    datetime_text: string | null
    amount_text: string | null
    location: string | null
    people: string[]
    tags: string[]
  }
  suggested_actions: string[]
  approval_required?: boolean
}

export interface ItemAnalysisResponse {
  mode: 'item_analysis'
  item_id: number
  summary: string
  best_interpretation: string
  alternative_interpretations: string[]
  confidence: number
  approval_required: boolean
  suggested_actions: string[]
  rule_draft: RuleDraftResponse | null
}

export interface RuleDraftResponse {
  mode: 'rule_draft'
  human_summary: string
  trigger_text: string
  condition_text: string
  action_text: string
  category: string
  approval_required: boolean
  default_active: boolean
  risk_level: 'low' | 'medium' | 'high'
}

export interface DashboardBriefingResponse {
  mode: 'dashboard_briefing'
  headline: string
  bullets: string[]
  priority_score: number
}

export interface AiEnvelope<T> {
  ok: boolean
  data: T
  error?: string
}
