import { Plus } from 'lucide-react'
import type { MemoTimelineItem } from '@/entities/timeline/model/types'
import { cn } from '@/shared/lib/cn'
import { StatusBadge } from '@/shared/ui'

interface MemoGridProps {
  memos: MemoTimelineItem[]
  selectedItemId: number | null
  onSelect: (id: number) => void
}

export const MemoGrid = ({ memos, selectedItemId, onSelect }: MemoGridProps) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    {memos.map((memo) => (
      <button
        key={memo.id}
        onClick={() => onSelect(memo.id)}
        className={cn(
          'flex h-40 cursor-pointer flex-col rounded-xl border p-5 text-left transition-all',
          selectedItemId === memo.id
            ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500'
            : 'border-slate-200 shadow-sm hover:border-slate-300',
        )}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <h4 className="truncate pr-2 font-bold text-slate-800">{memo.title}</h4>
          <StatusBadge status={memo.status} />
        </div>
        <p className="mb-4 line-clamp-3 flex-1 text-sm font-medium leading-relaxed text-slate-500">
          {memo.preview}
        </p>
        <div className="mt-auto flex gap-1">
          {memo.tags?.map((tag) => (
            <span
              key={tag}
              className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      </button>
    ))}

    <button className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/50 text-slate-400 transition-colors hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-500">
      <Plus size={24} className="mb-2" />
      <span className="text-sm font-bold">새 메모 작성</span>
    </button>
  </div>
)
