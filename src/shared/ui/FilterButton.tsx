import type { TimelineFilter } from '@/entities/timeline/model/types'
import { cn } from '@/shared/lib/cn'

interface FilterButtonProps {
  label: string
  value: TimelineFilter
  current: TimelineFilter
  onClick: (value: TimelineFilter) => void
}

export const FilterButton = ({ label, value, current, onClick }: FilterButtonProps) => (
  <button
    onClick={() => onClick(value)}
    className={cn(
      'rounded-md px-3 py-1.5 text-xs font-bold transition-all',
      current === value
        ? 'bg-white text-slate-800 shadow-sm'
        : 'text-slate-500 hover:bg-slate-200/60 hover:text-slate-700',
    )}
  >
    {label}
  </button>
)
