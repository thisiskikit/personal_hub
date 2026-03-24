import { Bell, CheckCheck, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DensitySwitch } from '@/features/density/ui/DensitySwitch'
import { cn } from '@/shared/lib/cn'
import { MENU_TITLE, MENU_TO_ROUTE } from '@/shared/types/navigation'
import type { ActiveMenu } from '@/shared/types/navigation'
import type { Density } from '@/shared/types/ui-state'
import type { NotificationGroup, NotificationItem } from '@/widgets/layout/ui/useAppShellContext'

interface MainHeaderProps {
  activeMenu: ActiveMenu
  density: Density
  notifications: NotificationItem[]
  onDensityChange: (density: Density) => void
  onOpenCommandPalette: () => void
  onMarkAllNotificationsRead: () => void
  onOpenNotification: (notificationId: number) => void
}

const mobileMenuOrder: ActiveMenu[] = ['dashboard', 'inbox', 'finance', 'calendar', 'notes', 'automation']

const groupLabel: Record<NotificationGroup, string> = {
  processing: '처리 필요',
  ai_approval: 'AI 승인 필요',
  upcoming: '예정 일정 / 결제',
}

export const MainHeader = ({
  activeMenu,
  density,
  notifications,
  onDensityChange,
  onOpenCommandPalette,
  onMarkAllNotificationsRead,
  onOpenNotification,
}: MainHeaderProps) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  const unreadCount = notifications.filter((item) => !item.isRead).length
  const groupedNotifications = useMemo(
    () =>
      notifications.reduce<Record<NotificationGroup, NotificationItem[]>>(
        (acc, item) => {
          acc[item.group].push(item)
          return acc
        },
        { processing: [], ai_approval: [], upcoming: [] },
      ),
    [notifications],
  )

  return (
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
            <h1 className="text-xl font-bold tracking-tight text-slate-800">{MENU_TITLE[activeMenu]}</h1>
            <div className="hidden h-4 w-px bg-slate-200 lg:block" />
            <DensitySwitch density={density} onChange={onDensityChange} />
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="group relative min-w-0 flex-1 text-left lg:w-72 lg:flex-none"
            >
              <div className="flex items-center rounded-lg border border-transparent bg-slate-100 px-3 py-1.5 shadow-inner transition-colors hover:bg-slate-200 focus-within:border-slate-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500">
                <Search size={16} className="mr-2 shrink-0 text-slate-400" />
                <span className="w-full text-sm text-slate-800">검색 또는 명령 실행...</span>
                <kbd className="hidden shrink-0 rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-400 sm:inline-block">
                  ⌘K
                </kbd>
              </div>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationOpen((prev) => !prev)}
                className="relative rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="알림 열기"
                aria-expanded={isNotificationOpen}
              >
                <Bell size={20} />
                {unreadCount > 0 ? (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
                ) : null}
              </button>

              {isNotificationOpen ? (
                <div className="absolute right-0 z-50 mt-2 w-[360px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-800">알림센터</p>
                    <button
                      type="button"
                      onClick={onMarkAllNotificationsRead}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
                    >
                      <CheckCheck size={14} />
                      모두 읽음 처리
                    </button>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto p-2">
                    {(Object.keys(groupedNotifications) as NotificationGroup[]).map((group) => {
                      if (!groupedNotifications[group].length) return null
                      return (
                        <div key={group} className="mb-2">
                          <p className="px-2 pb-1 pt-2 text-xs font-bold text-slate-400">{groupLabel[group]}</p>
                          <div className="space-y-1">
                            {groupedNotifications[group].map((notification) => (
                              <button
                                key={notification.id}
                                type="button"
                                onClick={() => {
                                  onOpenNotification(notification.id)
                                  setIsNotificationOpen(false)
                                }}
                                className="w-full rounded-lg border border-transparent px-3 py-2 text-left transition-colors hover:border-slate-200 hover:bg-slate-50"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-semibold text-slate-800">{notification.title}</p>
                                  <span
                                    className={cn(
                                      'rounded-md border px-1.5 py-0.5 text-[10px] font-semibold',
                                      notification.isRead
                                        ? 'border-slate-200 bg-slate-100 text-slate-500'
                                        : 'border-indigo-200 bg-indigo-50 text-indigo-600',
                                    )}
                                  >
                                    {notification.statusLabel}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">{notification.description}</p>
                                <p className="mt-1 text-[11px] font-medium text-slate-400">{notification.time}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
