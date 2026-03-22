import { useMemo, useState } from 'react'
import {
  Bot,
  Calendar as CalendarIcon,
  MapPin,
  Paperclip,
  Send,
  Settings,
  Tag,
  Wallet,
  Zap,
} from 'lucide-react'
import type { TimelineItem } from '@/entities/timeline/model/types'
import { OPENAI_MODELS } from '@/features/assistant/model/openai-models'
import { AiSuggestionsCard } from '@/features/assistant/ui/AiSuggestionsCard'
import type { RightPanelTab } from '@/shared/types/ui-state'
import { ChatBubble, DetailRow, RightTab, StatePanel, StatusBadge } from '@/shared/ui'

interface RightPanelProps {
  selectedItem: TimelineItem | null
  rightPanelTab: RightPanelTab
  onTabChange: (tab: RightPanelTab) => void
  onAssignCategory: (itemId: number, category: string) => void
}

interface ChatMessage {
  id: number
  type: 'ai' | 'user'
  text: string
}

const OPENAI_SETTINGS_KEY = 'openaiAssistantSettings'

const readSettings = () => {
  const raw = localStorage.getItem(OPENAI_SETTINGS_KEY)
  if (!raw) {
    return { apiKey: '', model: 'gpt-5.4' }
  }

  try {
    const parsed = JSON.parse(raw) as { apiKey?: string; model?: string }
    return {
      apiKey: parsed.apiKey ?? '',
      model: parsed.model ?? 'gpt-5.4',
    }
  } catch {
    return { apiKey: '', model: 'gpt-5.4' }
  }
}

const saveSettings = (apiKey: string, model: string) => {
  localStorage.setItem(OPENAI_SETTINGS_KEY, JSON.stringify({ apiKey, model }))
}

export const RightPanel = ({
  selectedItem,
  rightPanelTab,
  onTabChange,
  onAssignCategory,
}: RightPanelProps) => {
  const [settings, setSettings] = useState(readSettings)
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

  const helperMessage = useMemo(() => {
    if (selectedItem) {
      return `선택하신 '${selectedItem.title}' 항목과 관련해서 어떤 작업을 도와드릴까요?`
    }
    return '무엇을 도와드릴까요?'
  }, [selectedItem])

  const updateSettings = (nextApiKey: string, nextModel: string) => {
    const next = { apiKey: nextApiKey, model: nextModel }
    setSettings(next)
    saveSettings(nextApiKey, nextModel)
  }

  const sendMessage = async () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || isSending) return

    setError(null)
    setIsSending(true)
    setMessage('')

    const userMessage: ChatMessage = {
      id: Date.now(),
      type: 'user',
      text: trimmedMessage,
    }

    setChatMessages((prev) => [...prev, userMessage])

    if (!settings.apiKey) {
      setError('OpenAI API 키를 먼저 설정 탭에서 입력해 주세요.')
      setIsSending(false)
      return
    }

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: settings.apiKey,
          model: settings.model,
          message: trimmedMessage,
          selectedItem,
        }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'AI 응답 호출에 실패했습니다.')
      }

      const payload = (await response.json()) as { text: string }
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: payload.text,
      }
      setChatMessages((prev) => [...prev, aiMessage])
    } catch (requestError) {
      const messageText =
        requestError instanceof Error
          ? requestError.message
          : 'AI 응답 호출 중 오류가 발생했습니다.'
      setError(messageText)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <aside className="w-full shrink-0 border-t border-slate-200 bg-white shadow-xl lg:w-[360px] lg:border-l lg:border-t-0">
      <div className="border-b border-slate-200 bg-slate-50/50 px-6 pt-6">
        <div className="mb-4 flex items-center gap-2 text-slate-800">
          {rightPanelTab === 'settings' ? (
            <>
              <Settings size={18} className="text-indigo-600" />
              <h2 className="text-lg font-bold">AI 설정</h2>
            </>
          ) : selectedItem ? (
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
                <DetailRow
                  icon={<Tag size={14} />}
                  label="카테고리"
                  value={selectedItem.category}
                />
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
            <AiSuggestionsCard selectedItem={selectedItem} onAssignCategory={onAssignCategory} />
          </div>
        ) : null}

        {rightPanelTab === 'chat' ? (
          <div className="flex min-h-full flex-col gap-4 p-6">
            <ChatBubble type="ai" text={helperMessage} />
            {!settings.apiKey ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-700">
                API 키가 설정되지 않았습니다. 설정 탭에서 OpenAI API 키를 입력해 주세요.
              </div>
            ) : null}
            {chatMessages.map((item) => (
              <ChatBubble key={item.id} type={item.type} text={item.text} />
            ))}
            {error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                {error}
              </div>
            ) : null}
          </div>
        ) : null}

        {rightPanelTab === 'settings' ? (
          <div className="space-y-5 p-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-2 text-sm font-bold text-slate-800">OpenAI API Key</p>
              <input
                value={settings.apiKey}
                onChange={(event) => updateSettings(event.target.value, settings.model)}
                placeholder="sk-..."
                type="password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-2 text-xs text-slate-500">브라우저 localStorage 에 저장됩니다.</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-2 text-sm font-bold text-slate-800">모델 번호</p>
              <select
                value={settings.model}
                onChange={(event) => updateSettings(settings.apiKey, event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500"
              >
                {OPENAI_MODELS.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-500">
                필요하면 API에서 지원되는 다른 모델 ID로 직접 교체 가능합니다.
              </p>
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
            value={message}
            disabled={isSending || rightPanelTab === 'settings'}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void sendMessage()
              }
            }}
          />
          <div className="flex items-center justify-between px-2 pb-2">
            <button
              className="rounded p-1.5 text-slate-400 transition-colors hover:text-indigo-600"
              aria-label="파일 첨부"
              disabled={rightPanelTab === 'settings'}
            >
              <Paperclip size={16} />
            </button>
            <button
              className="rounded-lg bg-slate-800 p-1.5 text-white shadow-sm transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-300"
              aria-label="메시지 전송"
              onClick={() => void sendMessage()}
              disabled={isSending || rightPanelTab === 'settings' || !message.trim()}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
