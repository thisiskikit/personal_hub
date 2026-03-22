import { Bell, Command, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DensitySwitch } from '@/features/density/ui/DensitySwitch'
import { cn } from '@/shared/lib/cn'
import { MENU_TITLE } from '@/shared/types/navigation'
import type { ActiveMenu } from '@/shared/types/navigation'
import type { Density } from '@/shared/types/ui-state'
import type { NotificationItem } from '@/widgets/layout/ui/useAppShellContext'

interface MainHeaderProps {
  activeMenu: ActiveMenu
  density: Density
  notifications: NotificationItem[]
  onDensityChange: (density: Density) => void
  onMoveMenu: (menu: ActiveMenu) => void
  onOpenQuickAdd: () => void
  onOpenInbox: () => void
  onOpenAiTab: () => void
  onNotificationClick: (notificationId: number) => void
  onMarkAllRead: () => void
}

const mobileMenuOrder: ActiveMenu[] = ['dashboard', 'finance', 'calendar', 'notes', 'automation']

const commandItems: { id: string; label: string; action: 'menu' | 'quickAdd' | 'inbox' | 'ai'; target?: ActiveMenu }[] = [
  { id: 'dashboard', label: '오늘 대시보드로 이동', action: 'menu', target: 'dashboard' },
  { id: 'finance', label: '재무 장부로 이동', action: 'menu', target: 'finance' },
  { id: 'calendar', label: '통합 일정으로 이동', action: 'menu', target: 'calendar' },
  { id: 'notes', label: '메모 및 지식으로 이동', action: 'menu', target: 'notes' },
  { id: 'quick-add', label: '빠른 추가 열기', action: 'quickAdd' },
  { id: 'inbox', label: '인박스 보기', action: 'inbox' },
  { id: 'ai', label: 'AI 제안 탭 열기', action: 'ai' },
]

const groupLabel: Record<NotificationItem['group'], string> = {
  action_required: '처리 필요',
  ai_approval: 'AI 승인 필요',
  upcoming: '예정 일정 / 결제',
}

export const MainHeader = ({
  activeMenu,
  density,
  notifications,
  onDensityChange,
  onMoveMenu,
  onOpenQuickAdd,
  onOpenInbox,
  onOpenAiTab,
  onNotificationClick,
  onMarkAllRead,
}: MainHeaderProps) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsCommandOpen(true)
      }
      if (event.key === 'Escape') {
        setIsCommandOpen(false)
        setIsNotificationOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const unreadCount = notifications.filter((item) => item.status === 'new').length
  const grouped = useMemo(
    () =>
      notifications.reduce<Record<NotificationItem['group'], NotificationItem[]>>(
        (acc, item) => {
          acc[item.group].push(item)
          return acc
        },
        { action_required: [], ai_approval: [], upcoming: [] },
      ),
    [notifications],
  )

  const filteredCommands = commandItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))

  const runCommand = (commandId: string) => {
    const command = commandItems.find((item) => item.id === commandId)
    if (!command) return
    if (command.action === 'menu' && command.target) onMoveMenu(command.target)
    if (command.action === 'quickAdd') onOpenQuickAdd()
    if (command.action === 'inbox') onOpenInbox()
    if (command.action === 'ai') onOpenAiTab()
    setIsCommandOpen(false)
    setQuery('')
  }

  return (
    <>
      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        {mobileMenuOrder.map((menu) => (
          <Link
            key={menu}
            to={menu === 'dashboard' ? '/dashboard' : `/${menu}`}
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
              onClick={() => setIsCommandOpen(true)}
              className="group relative min-w-0 flex-1 lg:w-72 lg:flex-none"
            >
              <div className="flex items-center rounded-lg border border-transparent bg-slate-100 px-3 py-1.5 text-left shadow-inner transition-colors hover:bg-slate-200 focus-within:border-slate-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500">
                <Search size={16} className="mr-2 shrink-0 text-slate-400" />
                <span className="w-full text-sm text-slate-400">검색 또는 명령 실행...</span>
                <kbd className="hidden shrink-0 rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-400 sm:inline-block">
                  ⌘K
                </kbd>
              </div>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen((value) => !value)}
                className="relative rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="알림 열기"
              >
                <Bell size={20} />
                {unreadCount ? <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-rose-500" /> : null}
              </button>

              {isNotificationOpen ? (
                <div className="absolute right-0 z-50 mt-2 w-[360px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800">알림센터</h3>
                    <button onClick={onMarkAllRead} className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">모두 읽음 처리</button>
                  </div>
                  <div className="space-y-3">
                    {(Object.keys(grouped) as NotificationItem['group'][]).map((group) => (
                      <div key={group}>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{groupLabel[group]}</p>
                        <div className="space-y-1">
                          {grouped[group].map((item) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                onNotificationClick(item.id)
                                setIsNotificationOpen(false)
                              }}
                              className="w-full rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2 text-left hover:border-indigo-200 hover:bg-indigo-50/50"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-700">{item.title}</p>
                                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', item.status === 'new' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600')}>
                                  {item.status === 'new' ? 'NEW' : '읽음'}
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                              <p className="mt-1 text-[11px] font-medium text-slate-400">{item.time}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {isCommandOpen ? (
        <div className="fixed inset-0 z-[80] flex items-start justify-center bg-slate-900/40 p-4 pt-24" onClick={() => setIsCommandOpen(false)}>
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-2 flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <Command size={16} className="mr-2 text-slate-500" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="검색 또는 명령 실행..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-1">
              {filteredCommands.map((item) => (
                <button
                  key={item.id}
                  onClick={() => runCommand(item.id)}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mt-3 border-t border-slate-100 pt-3">
              <p className="mb-1 text-xs font-semibold text-slate-400">최근 항목</p>
              <div className="space-y-1 text-sm text-slate-600">
                <p className="rounded-md bg-slate-50 px-2 py-1">스타벅스 9,500원 분류 필요</p>
                <p className="rounded-md bg-slate-50 px-2 py-1">프랑스 인보이스 다시 보내기</p>
                <p className="rounded-md bg-slate-50 px-2 py-1">이번 주 결제 일정 확인</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
