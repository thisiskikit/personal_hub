import { CheckCircle2, Sparkles } from 'lucide-react'
import type { TimelineItem } from '@/entities/timeline/model/types'
import type { ItemAnalysisResponse } from '@/shared/types/ai'
import { StatusBadge } from '@/shared/ui'

interface AiSuggestionsCardProps {
  selectedItem: TimelineItem
  analysis: ItemAnalysisResponse
  onAssignCategory: (itemId: number, category: string) => void
}

export const AiSuggestionsCard = ({ selectedItem, analysis, onAssignCategory }: AiSuggestionsCardProps) => (
  <div className="relative rounded-xl border border-indigo-100 bg-indigo-50/80 p-5">
    <div className="absolute -left-1 top-5 h-2 w-2 rounded-full bg-indigo-500" />
    <div className="mb-2 flex items-center gap-2">
      <Sparkles size={16} className="text-indigo-600" />
      <p className="text-sm font-bold text-indigo-900">AI 컨텍스트 분석</p>
    </div>
    <p className="mb-2 text-sm font-semibold text-indigo-900">{analysis.summary}</p>
    <p className="mb-4 text-sm font-medium leading-relaxed text-indigo-800/80">{analysis.best_interpretation}</p>
    <div className="mb-4 flex items-center gap-2 text-xs text-indigo-800">
      <span>신뢰도 {Math.round(analysis.confidence * 100)}%</span>
      {analysis.approval_required ? <StatusBadge status="pending_category" /> : null}
    </div>

    {analysis.suggested_actions.length ? (
      <div className="space-y-2">
        {selectedItem.type === 'finance' ? (
          <button
            onClick={() => onAssignCategory(selectedItem.id, '회의비')}
            className="flex w-full items-center justify-center rounded-lg bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <CheckCircle2 size={16} className="mr-2" />
            회의비로 분류 적용
          </button>
        ) : null}
        {analysis.suggested_actions.map((action) => (
          <button
            key={action}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            {action}
          </button>
        ))}
      </div>
    ) : null}
  </div>
)
