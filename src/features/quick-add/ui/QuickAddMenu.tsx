import { Calendar as CalendarIcon, FileText, ListTodo, Plus, Sparkles, Wallet } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import { QuickAddMenuItem } from '@/shared/ui'

interface QuickAddMenuProps {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

export const QuickAddMenu = ({ isOpen, setIsOpen }: QuickAddMenuProps) => (
  <div className="relative">
    <button
      onClick={() => setIsOpen((value) => !value)}
      className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
      aria-expanded={isOpen}
      aria-label="빠른 추가 메뉴 열기"
    >
      <Plus size={16} />
      <span>빠른 추가</span>
    </button>

    {isOpen ? (
      <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-slate-100 bg-white py-2 shadow-xl">
        <div className="mb-2 border-b border-slate-100 px-3 pb-2 text-xs font-semibold text-slate-400">
          항목 추가
        </div>
        <QuickAddMenuItem icon={<CalendarIcon size={14} />} label="일정 추가" />
        <QuickAddMenuItem icon={<Wallet size={14} />} label="거래 내역 추가" />
        <QuickAddMenuItem icon={<FileText size={14} />} label="빠른 메모" />
        <QuickAddMenuItem icon={<ListTodo size={14} />} label="할 일 추가" />
        <div className="my-2 h-px bg-slate-100" />
        <QuickAddMenuItem
          icon={<Sparkles size={14} className="text-indigo-500" />}
          label="AI에게 정리 맡기기"
        />
      </div>
    ) : null}
  </div>
)
