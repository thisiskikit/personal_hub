import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ActiveMenu } from '@/shared/types/navigation'
import { cn } from '@/shared/lib/cn'

interface NavItemProps {
  id: ActiveMenu
  href: string
  icon: ReactNode
  label: string
  activeMenu: ActiveMenu
  badge?: number | string
}

export const NavItem = ({ id, href, icon, label, activeMenu, badge }: NavItemProps) => {
  const active = activeMenu === id

  return (
    <Link
      to={href}
      className={cn(
        'group flex items-center justify-between rounded-lg px-3 py-2.5 font-semibold transition-colors',
        active
          ? 'bg-indigo-500/15 text-white'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
      )}
    >
      <span className="flex items-center gap-3">
        <span
          className={cn(active ? 'text-indigo-300' : 'text-slate-500 group-hover:text-slate-300')}
        >
          {icon}
        </span>
        <span>{label}</span>
      </span>
      {badge ? (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-bold',
            active ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300',
          )}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  )
}
