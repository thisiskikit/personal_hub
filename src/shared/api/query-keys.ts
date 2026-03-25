export const queryKeys = {
  dashboardSummary: ['dashboard-summary'] as const,
  financeBudget: ['finance-budget'] as const,
  timeline: ['timeline'] as const,
  automationRules: ['automation-rules'] as const,
  promptProfiles: ['prompt-profiles'] as const,
  aiItemAnalysis: (itemId: number | null) => ['ai-item-analysis', itemId] as const,
  aiDashboardBriefing: ['ai-dashboard-briefing'] as const,
}
