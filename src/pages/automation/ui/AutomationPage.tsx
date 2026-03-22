import { Bot } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { AutomationRuleList } from '@/features/automation-rule/ui/AutomationRuleList'
import { dataProvider, queryKeys } from '@/shared/api'
import { StatePanel } from '@/shared/ui'
import type { RuleDraftResponse } from '@/shared/types/ai'
import { useAppShellContext } from '@/widgets/layout/ui/useAppShellContext'

export const AutomationPage = () => {
  const { automationRules, onToggleRule, isLoading, hasError } = useAppShellContext()
  const queryClient = useQueryClient()
  const [prompt, setPrompt] = useState('')
  const [draft, setDraft] = useState<RuleDraftResponse | null>(null)

  const draftMutation = useMutation({
    mutationFn: (input: string) => dataProvider.draftRule(input),
    onSuccess: (result) => {
      setDraft(result.data)
    },
    onError: (_, input) => {
      setDraft({
        mode: 'rule_draft',
        human_summary: '서버 연결 없이 임시 규칙 초안을 만들었습니다.',
        trigger_text: input,
        condition_text: '조건 충족 시',
        action_text: '후속 알림 생성',
        category: '운영',
        approval_required: true,
        default_active: false,
        risk_level: 'medium',
      })
    },
  })

  const saveDraftMutation = useMutation({
    mutationFn: () => {
      if (!draft) throw new Error('draft required')
      return dataProvider.createAutomationRule({
        trigger: draft.trigger_text,
        conditionText: draft.condition_text,
        action: draft.action_text,
        category: draft.category,
        status: draft.approval_required ? 'draft' : 'approved',
        approvalRequired: draft.approval_required,
        active: draft.approval_required ? false : draft.default_active,
      })
    },
    onSuccess: async () => {
      setDraft(null)
      setPrompt('')
      await queryClient.invalidateQueries({ queryKey: queryKeys.automationRules })
    },
  })

  if (hasError) {
    return (
      <StatePanel
        type="error"
        title="자동화 규칙을 불러오지 못했습니다"
        description="잠시 후 다시 시도해 주세요."
      />
    )
  }

  if (isLoading) {
    return (
      <StatePanel
        type="loading"
        title="자동화 규칙 로딩 중"
        description="규칙 정보를 불러오고 있습니다."
      />
    )
  }

  return (
    <>
      <div className="mb-8 rounded-xl bg-gradient-to-r from-indigo-900 to-cyan-900 p-6 text-white shadow-lg">
        <h2 className="mb-2 flex items-center text-xl font-bold">
          <Bot size={24} className="mr-3 text-indigo-300" />
          AI 에이전트 동작 설정
        </h2>
        <p className="max-w-2xl text-sm font-medium leading-relaxed text-indigo-200">
          에이전트가 백그라운드에서 데이터를 모니터링하고 자동으로 실행할 규칙을 정의합니다.
          자연어로 새로운 규칙을 요청하면 AI가 설정해 줍니다.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-slate-800">AI 규칙 초안 생성</p>
        <p className="mt-1 text-xs text-slate-500">자연어로 규칙을 설명하면 승인 가능한 초안을 생성합니다.</p>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="예: 거래 금액이 30만원 이상이면 CFO 승인 요청 알림을 보내줘"
          className="mt-3 min-h-24 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => draftMutation.mutate(prompt)}
            disabled={!prompt.trim() || draftMutation.isPending}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            초안 생성
          </button>
        </div>
      </div>

      {draft ? (
        <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
          <p className="text-sm font-bold text-indigo-900">생성된 규칙 초안</p>
          <p className="mt-1 text-sm text-indigo-800">{draft.human_summary}</p>
          <ul className="mt-2 space-y-1 text-xs text-indigo-900">
            <li>IF: {draft.trigger_text}</li>
            <li>조건: {draft.condition_text}</li>
            <li>THEN: {draft.action_text}</li>
            <li>카테고리: {draft.category}</li>
            <li>리스크: {draft.risk_level}</li>
          </ul>
          {draft.approval_required ? (
            <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
              승인 필요: 저장 후 초안 상태로 보관됩니다.
            </p>
          ) : null}
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => saveDraftMutation.mutate()}
              disabled={saveDraftMutation.isPending}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              승인 후 저장
            </button>
          </div>
        </div>
      ) : null}

      {automationRules.length ? (
        <AutomationRuleList rules={automationRules} onToggle={onToggleRule} />
      ) : (
        <StatePanel
          type="empty"
          title="등록된 규칙이 없습니다"
          description="새 규칙을 추가해 주세요."
        />
      )}
    </>
  )
}
