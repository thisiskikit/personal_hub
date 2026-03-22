import type { ReactNode } from 'react'

interface QuickAddMenuItemProps {
  icon: ReactNode
  label: string
  onClick?: () => void
}

export const QuickAddMenuItem = ({ icon, label, onClick }: QuickAddMenuItemProps) => (
  <button
    onClick={onClick}
    className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-indigo-600"
  >
    <span className="text-slate-400">{icon}</span>
    <span>{label}</span>
  </button>
)
