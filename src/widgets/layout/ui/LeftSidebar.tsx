import {
  Calendar as CalendarIcon,
  FileText,
  LayoutDashboard,
  Settings,
  Wallet,
  Workflow,
} from 'lucide-react'
import { MENU_TO_ROUTE } from '@/shared/types/navigation'
import type { ActiveMenu } from '@/shared/types/navigation'
import { NavItem } from '@/shared/ui'

interface LeftSidebarProps {
  activeMenu: ActiveMenu
  pendingCount: number
  inboxCount: number
}

export const LeftSidebar = ({ activeMenu, pendingCount, inboxCount }: LeftSidebarProps) => (
  <aside className="hidden w-64 shrink-0 flex-col bg-slate-900 text-slate-300 lg:flex">
    <div className="mb-2 flex items-center gap-3 p-6">
      <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-500/30">
        O
      </div>
      <span className="text-lg font-semibold tracking-wide text-white">OpsRoom</span>
    </div>

    <nav className="flex-1 space-y-1 px-4 text-sm font-medium">
      <NavItem
        id="dashboard"
        href={MENU_TO_ROUTE.dashboard}
        icon={<LayoutDashboard size={18} />}
        label="오늘 대시보드"
        activeMenu={activeMenu}
        badge={inboxCount}
      />
      <NavItem
        id="finance"
        href={MENU_TO_ROUTE.finance}
        icon={<Wallet size={18} />}
        label="재무 장부"
        activeMenu={activeMenu}
        badge={pendingCount}
      />
      <NavItem
        id="calendar"
        href={MENU_TO_ROUTE.calendar}
        icon={<CalendarIcon size={18} />}
        label="통합 일정"
        activeMenu={activeMenu}
        badge={2}
      />
      <NavItem
        id="notes"
        href={MENU_TO_ROUTE.notes}
        icon={<FileText size={18} />}
        label="메모 및 지식"
        activeMenu={activeMenu}
      />
      <div className="px-3 pb-2 pt-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Automation
      </div>
      <NavItem
        id="automation"
        href={MENU_TO_ROUTE.automation}
        icon={<Workflow size={18} />}
        label="에이전트 룰 설정"
        activeMenu={activeMenu}
      />
    </nav>

    <div className="border-t border-slate-800 p-4">
      <div className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-800">
        <img
          src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix"
          alt="user avatar"
          className="h-8 w-8 rounded-full bg-slate-700"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">김대표</p>
          <p className="truncate text-xs text-slate-500">Pro Plan</p>
        </div>
        <Settings size={16} className="text-slate-500" />
      </div>
    </div>
  </aside>
)
