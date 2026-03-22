import { ToggleLeft, ToggleRight } from 'lucide-react'
import type { AutomationRule } from '@/entities/automation/model/types'
import { cn } from '@/shared/lib/cn'

interface AutomationRuleListProps {
  rules: AutomationRule[]
  onToggle: (ruleId: number, active: boolean) => void
}

export const AutomationRuleList = ({ rules, onToggle }: AutomationRuleListProps) => (
  <div className="space-y-4">
    {rules.map((rule) => (
      <div
        key={rule.id}
        className={cn(
          'flex items-center justify-between rounded-xl border p-5 transition-all',
          rule.active
            ? 'border-slate-200 bg-white shadow-sm'
            : 'border-slate-100 bg-slate-50 opacity-70',
        )}
      >
        <div className="flex items-start gap-4">
          <span
            className={cn(
              'mt-0.5 h-2 w-2 rounded-full',
              rule.active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300',
            )}
          />
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-400">
                IF
              </span>
              <span
                className={cn(
                  'text-sm font-bold',
                  rule.active ? 'text-slate-800' : 'text-slate-500',
                )}
              >
                {rule.trigger}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-400">
                THEN
              </span>
              <span
                className={cn(
                  'text-sm font-medium',
                  rule.active ? 'text-slate-600' : 'text-slate-400',
                )}
              >
                {rule.action}
              </span>
            </div>
          </div>
        </div>

        <button
          aria-label={`${rule.trigger} 규칙 ${rule.active ? '비활성화' : '활성화'}`}
          onClick={() => onToggle(rule.id, !rule.active)}
          className={cn(rule.active ? 'text-indigo-600' : 'text-slate-400')}
        >
          {rule.active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
        </button>
      </div>
    ))}
  </div>
)
