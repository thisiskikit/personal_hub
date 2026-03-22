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
import type { RightPanelTab } from '@/shared/types/ui-state'
import { ChatBubble, DetailRow, RightTab, StatePanel, StatusBadge } from '@/shared/ui'

interface RightPanelProps {
  selectedItem: TimelineItem | null
  rightPanelTab: RightPanelTab
  onTabChange: (tab: RightPanelTab) => void
  onAssignCategory: (itemId: number, category: string) => void
  itemActionPrompt: string
  onItemActionPromptChange: (prompt: string) => void
}

export const RightPanel = ({
  selectedItem,
  rightPanelTab,
  onTabChange,
  onAssignCategory,
  itemActionPrompt,
  onItemActionPromptChange,
}: RightPanelProps) => (
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
          <AiSuggestionsCard selectedItem={selectedItem} onAssignCategory={onAssignCategory} />
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
              <ChatBubble type="ai" text={`현재 항목 액션 프롬프트: ${itemActionPrompt}`} />
            ) : null}
          </div>
        </div>
      ) : null}

      {rightPanelTab === 'settings' ? (
        <div className="space-y-4 p-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800">항목 액션 프롬프트</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              선택한 항목에 대해 AI가 어떤 방식으로 답변할지 기본 프롬프트를 직접 설정할 수 있습니다.
            </p>
            <textarea
              value={itemActionPrompt}
              onChange={(event) => onItemActionPromptChange(event.target.value)}
              placeholder="예: 지출 항목이면 카테고리 추천 + 절약 팁까지 포함해서 답해줘."
              className="mt-3 min-h-28 w-full resize-y rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500"
            />
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
