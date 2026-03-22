import { CheckCircle2, Sparkles } from 'lucide-react'
import type { TimelineItem } from '@/entities/timeline/model/types'

interface AiSuggestionsCardProps {
  selectedItem: TimelineItem
  onAssignCategory: (itemId: number, category: string) => void
}

export const AiSuggestionsCard = ({ selectedItem, onAssignCategory }: AiSuggestionsCardProps) => (
  <div className="relative rounded-xl border border-indigo-100 bg-indigo-50/80 p-5">
    <div className="absolute -left-1 top-5 h-2 w-2 rounded-full bg-indigo-500" />
    <div className="mb-2 flex items-center gap-2">
      <Sparkles size={16} className="text-indigo-600" />
      <p className="text-sm font-bold text-indigo-900">AI 컨텍스트 분석</p>
    </div>
    <p className="mb-4 text-sm font-medium leading-relaxed text-indigo-800/80">
      {selectedItem.id === 2
        ? "해당 결제(12:45) 직후에 '디자인 에이전시 미팅(14:00)'이 예정되어 있습니다. 이 지출을 일반 식비가 아닌 미팅 관련 비용으로 처리할까요?"
        : '현재 이 항목과 관련된 추가 분석이나 최적화할 액션이 감지되지 않았습니다.'}
    </p>

    {selectedItem.id === 2 ? (
      <div className="space-y-2">
        <button
          onClick={() => onAssignCategory(selectedItem.id, '회의비')}
          className="flex w-full items-center justify-center rounded-lg bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          <CheckCircle2 size={16} className="mr-2" />
          네, 접대/회의비로 자동 분류
        </button>
        <button className="w-full rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50">
          관련 메모 작성하기
        </button>
        <button className="w-full py-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700">
          아니요, 개인 식비입니다
        </button>
      </div>
    ) : null}
  </div>
)
