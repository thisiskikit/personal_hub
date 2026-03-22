import type { TimelineStatus } from '@/entities/timeline/model/types'
import { cn } from '@/shared/lib/cn'

interface StatusBadgeProps {
  status: TimelineStatus
  className?: string
}

const statusConfig: Record<
  TimelineStatus,
  { bg: string; text: string; border: string; label: string }
> = {
  completed: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    label: '완료',
  },
  pending_category: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    label: '검토 필요',
  },
  upcoming: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    label: '예정',
  },
  saved: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    label: '저장됨',
  },
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex rounded-md border px-2 py-1 text-[10px] font-bold',
        config.bg,
        config.text,
        config.border,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
