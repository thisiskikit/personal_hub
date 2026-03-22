import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Bot,
  Calendar as CalendarIcon,
  MapPin,
  Paperclip,
  Send,
  Tag,
  Wallet,
  Zap,
} from 'lucide-react'
import type { TimelineItem } from '@/entities/timeline/model/types'
import { AiSuggestionsCard } from '@/features/assistant/ui/AiSuggestionsCard'
import { dataProvider, queryKeys } from '@/shared/api'
import type { ItemAnalysisResponse, PromptProfile } from '@/shared/types/ai'
import type { RightPanelTab } from '@/shared/types/ui-state'
import { ChatBubble, DetailRow, RightTab, StatePanel, StatusBadge } from '@/shared/ui'
import type { InboxParsingRule } from '@/widgets/layout/ui/useAppShellContext'

interface RightPanelProps {
  selectedItem: TimelineItem | null
  rightPanelTab: RightPanelTab
  onTabChange: (tab: RightPanelTab) => void
  onAssignCategory: (itemId: number, category: string) => void
  promptProfiles: PromptProfile[]
  onPromptProfileChange: (key: string, promptText: string) => Promise<void>
  inboxParsingRules: InboxParsingRule[]
  onAddInboxParsingRule: (rule: Omit<InboxParsingRule, 'id'>) => void
  onUpdateInboxParsingRule: (ruleId: string, patch: Partial<Omit<InboxParsingRule, 'id'>>) => void
  onDeleteInboxParsingRule: (ruleId: string) => void
}

export const RightPanel = ({
  selectedItem,
  rightPanelTab,
  onTabChange,
  onAssignCategory,
  promptProfiles,
  onPromptProfileChange,
  inboxParsingRules,
  onAddInboxParsingRule,
  onUpdateInboxParsingRule,
  onDeleteInboxParsingRule,
}: RightPanelProps) => {
  const itemAnalysisQuery = useQuery({
    queryKey: queryKeys.aiItemAnalysis(selectedItem?.id ?? null),
    queryFn: () => dataProvider.analyzeItem(selectedItem!.id),
    enabled: Boolean(selectedItem && rightPanelTab === 'ai'),
  })

  const fallbackAnalysis: ItemAnalysisResponse | null = selectedItem
    ? {
        mode: 'item_analysis',
        item_id: selectedItem.id,
        summary: '기본 분석 결과입니다.',
        best_interpretation: '서버 연결 전에는 규칙 기반 요약만 제공합니다.',
        alternative_interpretations: [],
        confidence: 0.52,
        approval_required: selectedItem.type === 'finance',
        suggested_actions: selectedItem.type === 'finance' ? ['회의비로 분류', '관련 메모 작성'] : ['관련 메모 작성'],
        rule_draft: null,
      }
    : null
  const itemAnalysis = itemAnalysisQuery.data?.data ?? fallbackAnalysis

  return (
    <aside className="w-full shrink-0 border-t border-slate-200 bg-white shadow-xl lg:w-[360px] lg:border-l lg:border-t-0">
    <div className="border-b border-slate-200 bg-slate-50/50 px-6 pt-6">
      <div className="mb-4 flex items-center gap-2 text-slate-800">
        {selectedItem ? (
          <>
            <Zap size={18} className="text-indigo-600" />
            <h2 className="text-lg font-bold">항목 액션</h2>
          </>
        ) : (
          <>
            <Bot size={18} className="text-indigo-600" />
            <h2 className="text-lg font-bold">AI 어시스턴트</h2>
          </>
        )}
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <RightTab
          label="상세 정보"
          id="details"
          current={rightPanelTab}
          onClick={onTabChange}
          disabled={!selectedItem}
        />
        <RightTab
          label="AI 제안"
          id="ai"
          current={rightPanelTab}
          onClick={onTabChange}
          disabled={!selectedItem}
          showBadge={selectedItem?.status === 'pending_category'}
        />
        <RightTab label="대화" id="chat" current={rightPanelTab} onClick={onTabChange} />
        <RightTab label="설정" id="settings" current={rightPanelTab} onClick={onTabChange} />
      </div>
    </div>

    <div className="max-h-[min(60vh,800px)] overflow-y-auto bg-slate-50/30 lg:max-h-[calc(100vh-210px)]">
      {rightPanelTab === 'details' && selectedItem ? (
        <div className="space-y-6 p-6">
          <div>
            <StatusBadge status={selectedItem.status} className="mb-3" />
            <h3 className="mb-1 text-xl font-bold text-slate-800">{selectedItem.title}</h3>
            <p className="font-mono text-sm text-slate-500">{selectedItem.time}</p>
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {'amount' in selectedItem ? (
              <DetailRow
                icon={<Wallet size={14} />}
                label="금액"
                value={selectedItem.amount}
                valueClass="font-mono font-bold text-slate-800"
              />
            ) : null}
            {'category' in selectedItem ? (
              <DetailRow icon={<Tag size={14} />} label="카테고리" value={selectedItem.category} />
            ) : null}
            {'location' in selectedItem && selectedItem.location ? (
              <DetailRow icon={<MapPin size={14} />} label="위치" value={selectedItem.location} />
            ) : null}
            {'desc' in selectedItem && selectedItem.desc ? (
              <div className="border-t border-slate-100 pt-2">
                <p className="mb-1 text-xs font-semibold text-slate-400">메모/내용</p>
                <p className="text-sm leading-relaxed text-slate-700">{selectedItem.desc}</p>
              </div>
            ) : null}
            {'preview' in selectedItem && selectedItem.preview ? (
              <div className="border-t border-slate-100 pt-2">
                <p className="mb-1 text-xs font-semibold text-slate-400">메모/내용</p>
                <p className="text-sm leading-relaxed text-slate-700">{selectedItem.preview}</p>
              </div>
            ) : null}
          </div>

          {'relatedEvent' in selectedItem && selectedItem.relatedEvent ? (
            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                연결된 항목
              </h4>
              <div className="flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-indigo-300">
                <CalendarIcon size={16} className="mr-3 text-blue-500" />
                <span className="text-sm font-semibold text-slate-700">
                  {selectedItem.relatedEvent}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {rightPanelTab === 'ai' && selectedItem ? (
        <div className="space-y-4 p-6">
          {itemAnalysis ? (
            <AiSuggestionsCard
              selectedItem={selectedItem}
              analysis={itemAnalysis}
              onAssignCategory={onAssignCategory}
            />
          ) : (
            <StatePanel type="loading" title="AI 분석 중" description="항목을 분석하고 있습니다." />
          )}
        </div>
      ) : null}

      {rightPanelTab === 'chat' ? (
        <div className="flex min-h-full flex-col gap-6 p-6">
          <div className="space-y-4">
            <ChatBubble
              type="ai"
              text={
                selectedItem
                  ? `선택하신 '${selectedItem.title}' 항목과 관련해서 어떤 작업을 도와드릴까요?`
                  : '무엇을 도와드릴까요?'
              }
            />
            {selectedItem ? (
              <ChatBubble
                type="ai"
                text={`현재 분석 프롬프트: ${promptProfiles.find((profile) => profile.key === 'item_analysis_prompt')?.promptText ?? '기본값'}`}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {rightPanelTab === 'settings' ? (
        <div className="space-y-4 p-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800">프롬프트 프로필 설정</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              AI 동작 프롬프트를 키별로 관리합니다. 저장 시 즉시 서버 DB에 반영됩니다.
            </p>
            <div className="mt-3 space-y-3">
              {promptProfiles.length ? (
                promptProfiles.map((profile) => (
                  <PromptProfileEditor
                    key={profile.key}
                    profile={profile}
                    onSave={onPromptProfileChange}
                  />
                ))
              ) : (
                <p className="rounded-md bg-slate-50 px-2 py-3 text-xs text-slate-500">
                  프롬프트 프로필 서버에 연결되지 않았습니다. API 서버를 확인해 주세요.
                </p>
              )}
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-xs font-bold text-slate-700">인박스 분류 규칙</p>
              <p className="mt-1 text-xs text-slate-500">
                AI 응답 전/후에 적용할 로컬 규칙입니다. 우선순위가 높은 규칙부터 매칭됩니다.
              </p>
              <div className="mt-2 space-y-2">
                {inboxParsingRules.map((rule) => (
                  <InboxRuleEditor
                    key={rule.id}
                    rule={rule}
                    onChange={onUpdateInboxParsingRule}
                    onDelete={onDeleteInboxParsingRule}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  onAddInboxParsingRule({
                    label: '새 규칙',
                    pattern: '키워드',
                    typeCandidate: 'memo',
                    recommendedSaveMode: 'inbox',
                    priority: 50,
                  })
                }
                className="mt-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
              >
                규칙 추가
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {!selectedItem && rightPanelTab !== 'chat' && rightPanelTab !== 'settings' ? (
        <div className="p-6">
          <StatePanel
            type="empty"
            title="선택된 항목이 없습니다"
            description="타임라인에서 항목을 선택해 주세요."
          />
        </div>
      ) : null}
    </div>

    <div className="border-t border-slate-200 bg-white p-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-inner transition-all focus-within:border-transparent focus-within:ring-2 focus-within:ring-indigo-500">
        <textarea
          placeholder="자연어로 지시사항 입력..."
          className="min-h-[50px] max-h-32 w-full resize-none bg-transparent p-3 text-sm font-medium outline-none placeholder:text-slate-400"
          rows={2}
        />
        <div className="flex items-center justify-between px-2 pb-2">
          <button
            className="rounded p-1.5 text-slate-400 transition-colors hover:text-indigo-600"
            aria-label="파일 첨부"
          >
            <Paperclip size={16} />
          </button>
          <button
            className="rounded-lg bg-slate-800 p-1.5 text-white shadow-sm transition-colors hover:bg-slate-900"
            aria-label="메시지 전송"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  </aside>
  )
}

interface InboxRuleEditorProps {
  rule: InboxParsingRule
  onChange: (ruleId: string, patch: Partial<Omit<InboxParsingRule, 'id'>>) => void
  onDelete: (ruleId: string) => void
}

const InboxRuleEditor = ({ rule, onChange, onDelete }: InboxRuleEditorProps) => (
  <div className="rounded-lg border border-slate-200 bg-white p-2">
    <input
      value={rule.label}
      onChange={(event) => onChange(rule.id, { label: event.target.value })}
      className="mb-1 w-full rounded border border-slate-200 px-2 py-1 text-xs"
      placeholder="규칙 이름"
    />
    <input
      value={rule.pattern}
      onChange={(event) => onChange(rule.id, { pattern: event.target.value })}
      className="mb-1 w-full rounded border border-slate-200 px-2 py-1 text-xs"
      placeholder="정규식 또는 키워드"
    />
    <div className="grid grid-cols-3 gap-1">
      <select
        value={rule.typeCandidate}
        onChange={(event) =>
          onChange(rule.id, { typeCandidate: event.target.value as InboxParsingRule['typeCandidate'] })
        }
        className="rounded border border-slate-200 px-1 py-1 text-xs"
      >
        <option value="event">일정</option>
        <option value="finance">거래</option>
        <option value="memo">메모</option>
        <option value="task">할 일</option>
      </select>
      <select
        value={rule.recommendedSaveMode}
        onChange={(event) =>
          onChange(rule.id, {
            recommendedSaveMode: event.target.value as InboxParsingRule['recommendedSaveMode'],
          })
        }
        className="rounded border border-slate-200 px-1 py-1 text-xs"
      >
        <option value="inbox">인박스</option>
        <option value="event">일정</option>
        <option value="memo">메모</option>
      </select>
      <input
        type="number"
        value={rule.priority}
        onChange={(event) => onChange(rule.id, { priority: Number(event.target.value) })}
        className="rounded border border-slate-200 px-1 py-1 text-xs"
      />
    </div>
    <div className="mt-1 flex justify-end">
      <button
        type="button"
        onClick={() => onDelete(rule.id)}
        className="text-[11px] font-semibold text-rose-600"
      >
        삭제
      </button>
    </div>
  </div>
)

interface PromptProfileEditorProps {
  profile: PromptProfile
  onSave: (key: string, promptText: string) => Promise<void>
}

const PromptProfileEditor = ({ profile, onSave }: PromptProfileEditorProps) => {
  const [value, setValue] = useState(profile.promptText)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setValue(profile.promptText)
  }, [profile.promptText])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(profile.key, value)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-bold text-slate-600">{profile.label}</p>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="mt-2 min-h-24 w-full resize-y rounded-lg border border-slate-200 bg-white p-2 text-xs outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500"
      />
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
        >
          저장
        </button>
      </div>
    </div>
  )
}
