import type { Density } from '@/shared/types/ui-state'
import { cn } from '@/shared/lib/cn'

interface DensitySwitchProps {
  density: Density
  onChange: (density: Density) => void
}

export const DensitySwitch = ({ density, onChange }: DensitySwitchProps) => (
  <div className="rounded-lg border border-slate-200 bg-slate-100 p-0.5">
    <button
      onClick={() => onChange('comfortable')}
      className={cn(
        'rounded-md px-3 py-1 text-xs font-medium transition-colors',
        density === 'comfortable'
          ? 'bg-white text-slate-800 shadow-sm'
          : 'text-slate-500 hover:text-slate-700',
      )}
    >
      여유롭게
    </button>
    <button
      onClick={() => onChange('compact')}
      className={cn(
        'rounded-md px-3 py-1 text-xs font-medium transition-colors',
        density === 'compact'
          ? 'bg-white text-slate-800 shadow-sm'
          : 'text-slate-500 hover:text-slate-700',
      )}
    >
      촘촘하게
    </button>
  </div>
)
