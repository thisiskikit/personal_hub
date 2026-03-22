import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface KPIStatCardProps {
  title: string
  icon: ReactNode
  value: string
  subtext: string
  bgColor?: string
  borderColor?: string
}

export const KPIStatCard = ({
  title,
  icon,
  value,
  subtext,
  bgColor = 'bg-white',
  borderColor = 'border-slate-200',
}: KPIStatCardProps) => (
  <div
    className={cn(
      'col-span-1 flex flex-col justify-between rounded-xl border p-4 shadow-sm',
      bgColor,
      borderColor,
    )}
  >
    <div className="mb-2 flex items-start justify-between gap-4">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      {icon}
    </div>
    <h3 className="my-1 font-mono text-2xl font-bold tracking-tight text-slate-800">{value}</h3>
    <p className="mt-auto truncate text-[11px] font-semibold text-slate-500">{subtext}</p>
  </div>
)
