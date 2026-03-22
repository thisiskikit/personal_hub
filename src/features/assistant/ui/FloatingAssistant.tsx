import { Bot, MessageCircle, Minimize2, Send } from 'lucide-react'
import { useState } from 'react'
import { ChatBubble } from '@/shared/ui'
import type {
  AssistantMessage,
  AssistantSaveMode,
} from '@/widgets/layout/ui/useAppShellContext'

interface FloatingAssistantProps {
  isOpen: boolean
  onToggleOpen: () => void
  messages: AssistantMessage[]
  onSendMessage: (message: string) => void
  onConfirmSave: (actionId: string, mode: AssistantSaveMode) => void
}

const saveOptions: { mode: AssistantSaveMode; label: string }[] = [
  { mode: 'inbox', label: '인박스 초안으로' },
  { mode: 'event', label: '바로 일정으로' },
  { mode: 'memo', label: '바로 메모로' },
]

export const FloatingAssistant = ({
  isOpen,
  onToggleOpen,
  messages,
  onSendMessage,
  onConfirmSave,
}: FloatingAssistantProps) => {
  const [draft, setDraft] = useState('')

  const handleSend = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    onSendMessage(trimmed)
    setDraft('')
  }

  return (
    <div className="fixed bottom-4 right-4 z-[90]">
      {isOpen ? (
        <div className="flex h-[min(72vh,620px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-indigo-600" />
              <p className="text-sm font-bold text-slate-800">AI 어시스턴트</p>
            </div>
            <button
              type="button"
              onClick={onToggleOpen}
              className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-200"
              aria-label="AI 대화창 최소화"
            >
              <Minimize2 size={14} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/40 p-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <ChatBubble type={message.role} text={message.text} />
                {message.pendingAction ? (
                  <div className="ml-2 space-y-1">
                    {saveOptions.map((option) => (
                      <button
                        key={`${message.pendingAction?.id}-${option.mode}`}
                        type="button"
                        onClick={() => onConfirmSave(message.pendingAction!.id, option.mode)}
                        className="mr-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-inner focus-within:ring-2 focus-within:ring-indigo-500">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="예: 내일 3시 치과 일정 등록해줘"
                className="min-h-[54px] max-h-36 w-full resize-none bg-transparent p-3 text-sm outline-none"
                rows={2}
              />
              <div className="flex items-center justify-end px-2 pb-2">
                <button
                  type="button"
                  onClick={handleSend}
                  className="rounded-lg bg-slate-900 p-1.5 text-white transition-colors hover:bg-slate-700"
                  aria-label="AI 메시지 전송"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggleOpen}
          className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-xl transition-colors hover:bg-slate-700"
          aria-label="AI 대화창 열기"
        >
          <MessageCircle size={16} />
          AI와 대화
        </button>
      )}
    </div>
  )
}
