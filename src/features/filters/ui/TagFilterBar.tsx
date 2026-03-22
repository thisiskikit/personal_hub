import { Filter } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

interface TagFilterBarProps {
  tags: string[]
  selected: string
  onSelect: (tag: string) => void
}

export const TagFilterBar = ({ tags, selected, onSelect }: TagFilterBarProps) => (
  <div className="mb-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
    <Filter size={16} className="ml-2 text-slate-400" />
    <div className="flex gap-2 overflow-x-auto p-1">
      {tags.map((tag, index) => {
        const value = index === 0 ? '전체' : tag
        const active = selected === value
        return (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={cn(
              'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold',
              active ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            {index === 0 ? value : `#${tag}`}
          </button>
        )
      })}
    </div>
  </div>
)
