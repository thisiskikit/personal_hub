interface BudgetBarProps {
  label: string
  current: number
  max: number
  color: string
}

export const BudgetBar = ({ label, current, max, color }: BudgetBarProps) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-500">
        ₩{current.toLocaleString()} / ₩{max.toLocaleString()}
      </span>
    </div>
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div
        className={`${color} h-2 rounded-full`}
        style={{ width: `${Math.min((current / max) * 100, 100)}%` }}
      />
    </div>
  </div>
)
