import { cn } from '@/shared/lib/cn'
import type { RightPanelTab } from '@/shared/types/ui-state'

interface RightTabProps {
  label: string
  id: RightPanelTab
  current: RightPanelTab
  onClick: (value: RightPanelTab) => void
  disabled?: boolean
  showBadge?: boolean
}

export const RightTab = ({
  label,
  id,
  current,
  onClick,
  disabled = false,
  showBadge = false,
}: RightTabProps) => (
  <button
    onClick={() => !disabled && onClick(id)}
    disabled={disabled}
    className={cn(
      'relative px-2 pb-3 text-sm font-bold transition-colors',
      disabled
        ? 'cursor-not-allowed text-slate-300'
        : current === id
          ? 'text-indigo-600'
          : 'text-slate-500 hover:text-slate-800',
    )}
  >
    <span className="flex items-center gap-1">
      <span>{label}</span>
      {showBadge ? <span className="h-2 w-2 rounded-full bg-amber-500" /> : null}
    </span>
    {current === id ? (
      <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-t-full bg-indigo-600" />
    ) : null}
  </button>
)
