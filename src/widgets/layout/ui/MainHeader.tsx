import { Bell, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DensitySwitch } from '@/features/density/ui/DensitySwitch'
import { MENU_TITLE, MENU_TO_ROUTE } from '@/shared/types/navigation'
import type { ActiveMenu } from '@/shared/types/navigation'
import type { Density } from '@/shared/types/ui-state'
import { cn } from '@/shared/lib/cn'

interface MainHeaderProps {
  activeMenu: ActiveMenu
  density: Density
  onDensityChange: (density: Density) => void
}

const mobileMenuOrder: ActiveMenu[] = ['dashboard', 'finance', 'calendar', 'notes', 'automation']

export const MainHeader = ({ activeMenu, density, onDensityChange }: MainHeaderProps) => (
  <>
    <div className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
      {mobileMenuOrder.map((menu) => (
        <Link
          key={menu}
          to={MENU_TO_ROUTE[menu]}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-semibold',
            menu === activeMenu ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600',
          )}
        >
          {MENU_TITLE[menu]}
        </Link>
      ))}
    </div>

    <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 lg:h-16 lg:px-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            {MENU_TITLE[activeMenu]}
          </h1>
          <div className="hidden h-4 w-px bg-slate-200 lg:block" />
          <DensitySwitch density={density} onChange={onDensityChange} />
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          <div className="group relative min-w-0 flex-1 lg:w-72 lg:flex-none">
            <div className="flex items-center rounded-lg border border-transparent bg-slate-100 px-3 py-1.5 shadow-inner transition-colors hover:bg-slate-200 focus-within:border-slate-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500">
              <Search size={16} className="mr-2 shrink-0 text-slate-400" />
              <input
                type="text"
                placeholder="검색 또는 명령 실행..."
                className="w-full border-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              <kbd className="hidden shrink-0 rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-400 sm:inline-block">
                ⌘K
              </kbd>
            </div>
          </div>

          <button
            className="relative rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="알림 열기"
          >
            <Bell size={20} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
          </button>
        </div>
      </div>
    </header>
  </>
)
