import type { ReactNode } from 'react'

interface DetailRowProps {
  icon: ReactNode
  label: string
  value: string
  valueClass?: string
}

export const DetailRow = ({
  icon,
  label,
  value,
  valueClass = 'text-slate-700 font-semibold',
}: DetailRowProps) => (
  <div className="flex items-center justify-between py-1">
    <div className="flex items-center gap-2 text-slate-500">
      {icon}
      <span className="text-xs font-semibold">{label}</span>
    </div>
    <span className={`text-sm ${valueClass}`}>{value}</span>
  </div>
)
