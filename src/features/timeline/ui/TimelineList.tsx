import {
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  Coffee,
  CreditCard,
  FileText,
  Link2,
  MoreVertical,
} from 'lucide-react'
import type { TimelineItem } from '@/entities/timeline/model/types'
import { cn } from '@/shared/lib/cn'
import type { Density } from '@/shared/types/ui-state'
import { StatusBadge } from '@/shared/ui'

interface TimelineListProps {
  items: TimelineItem[]
  selectedItemId: number | null
  density: Density
  onSelect: (id: number) => void
  onAssignCategory: (itemId: number, category: string) => void
  onComplete: (itemId: number) => void
}

const TimelineTypeIcon = ({ item }: { item: TimelineItem }) => {
  if (item.type === 'task') {
    return (
      <CheckCircle2
        size={16}
        className={cn(item.status === 'completed' ? 'text-slate-300' : 'text-indigo-500')}
      />
    )
  }
  if (item.type === 'finance') {
    return item.title.includes('스타벅스') ? (
      <Coffee size={16} className="text-amber-600" />
    ) : (
      <CreditCard size={16} className="text-rose-500" />
    )
  }
  if (item.type === 'event') {
    return <CalendarIcon size={16} className="text-blue-500" />
  }
  return <FileText size={16} className="text-slate-500" />
}

export const TimelineList = ({
  items,
  selectedItemId,
  density,
  onSelect,
  onAssignCategory,
  onComplete,
}: TimelineListProps) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
    {items.map((item) => {
      const isSelected = selectedItemId === item.id
      const pClass = density === 'compact' ? 'p-3' : 'p-4'

      return (
        <div
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={cn(
            'group flex cursor-pointer items-start border-l-4 transition-all',
            isSelected
              ? 'border-indigo-500 bg-indigo-50/40'
              : 'border-transparent hover:bg-slate-50',
            pClass,
          )}
        >
          <div className="w-28 shrink-0 pr-5 pt-0.5">
            <div className="flex flex-col items-end">
              <span className="font-mono text-xs font-semibold text-slate-600">{item.time}</span>
              <div className="mt-1.5">
                <StatusBadge status={item.status} />
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1 pr-4">
            <div className="flex items-center gap-2.5">
              <TimelineTypeIcon item={item} />
              <p
                className={cn(
                  'truncate text-sm font-bold',
                  item.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800',
                )}
              >
                {item.title}
              </p>

              {item.type === 'finance' ? (
                <>
                  <span className="ml-2 font-mono text-sm font-bold text-slate-700">
                    {item.amount}
                  </span>
                  <span className="ml-2 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500">
                    {item.category}
                  </span>
                </>
              ) : null}
            </div>

            {'desc' in item && item.desc ? (
              <p className="ml-6 mt-1.5 truncate text-sm font-medium leading-relaxed text-slate-500">
                {item.desc}
              </p>
            ) : null}
            {'preview' in item && item.preview ? (
              <p className="ml-6 mt-1.5 truncate text-sm font-medium leading-relaxed text-slate-500">
                {item.preview}
              </p>
            ) : null}
          </div>

          <div
            className={cn(
              'flex shrink-0 items-center gap-2 transition-opacity',
              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
            )}
          >
            {item.type === 'finance' && item.status === 'pending_category' ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-amber-100 bg-white p-1 shadow-sm">
                <button
                  onClick={(event) => {
                    event.stopPropagation()
                    onAssignCategory(item.id, '식비')
                  }}
                  className="rounded bg-amber-50 px-2 py-1.5 text-[11px] font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                >
                  식비
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation()
                    onAssignCategory(item.id, '회의비')
                  }}
                  className="rounded bg-indigo-50 px-2 py-1.5 text-[11px] font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
                >
                  회의비
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button className="rounded p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600">
                  <Link2 size={16} />
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation()
                    onComplete(item.id)
                  }}
                  className="rounded p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <Check size={16} />
                </button>
              </div>
            )}
            <button className="rounded p-1.5 text-slate-300 transition-colors hover:text-slate-600">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
      )
    })}
  </div>
)
