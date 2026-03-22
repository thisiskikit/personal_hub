import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams, Outlet } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AutomationRule } from '@/entities/automation/model/types'
import type { BudgetItem, FinanceSummary } from '@/entities/finance/model/types'
import type { TimelineFilter, TimelineItem } from '@/entities/timeline/model/types'
import { QuickAddMenu } from '@/features/quick-add/ui/QuickAddMenu'
import { dataProvider, queryKeys } from '@/shared/api'
import { serializeUiQueryState, parseUiQueryState } from '@/shared/lib/route-query'
import { MENU_TO_ROUTE, ROUTE_TO_MENU } from '@/shared/types/navigation'
import type { ActiveMenu } from '@/shared/types/navigation'
import type { Density, RightPanelTab, UiQueryState } from '@/shared/types/ui-state'
import { MainHeader } from '@/widgets/layout/ui/MainHeader'
import { LeftSidebar } from '@/widgets/layout/ui/LeftSidebar'
import { RightPanel } from '@/widgets/layout/ui/RightPanel'
import {
  type AppShellContextValue,
  type InboxItem,
  type InboxStatus,
  type NotificationItem,
  type QuickAddType,
} from '@/widgets/layout/ui/useAppShellContext'

const FALLBACK_SUMMARY: FinanceSummary = {
  balance: '0',
  upcomingPayments: '0',
  pendingCount: 0,
  incomeThisMonth: '0',
  expenseThisMonth: '0',
}

const FALLBACK_BUDGET: BudgetItem[] = []
const FALLBACK_TIMELINE: TimelineItem[] = []
const FALLBACK_AUTOMATION_RULES: AutomationRule[] = []

const LOCAL_STORAGE_KEYS = {
  inbox: 'inboxItems',
  notifications: 'notifications',
  density: 'densityMode',
  selectedItem: 'selectedItemId',
}

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: '미분류 결제 처리 필요',
    description: '스타벅스 9,500원을 카테고리 지정해 주세요.',
    time: '방금 전',
    status: 'new',
    group: 'action_required',
    targetTab: 'ai',
    targetItemId: 2,
  },
  {
    id: 2,
    title: 'AI 승인 대기',
    description: 'AI가 프랑스 인보이스 메일 초안을 준비했습니다.',
    time: '10분 전',
    status: 'new',
    group: 'ai_approval',
    targetTab: 'ai',
  },
  {
    id: 3,
    title: '오늘 18:00 결제 예정',
    description: '넷플릭스 자동 결제가 예정되어 있습니다.',
    time: '30분 전',
    status: 'read',
    group: 'upcoming',
    targetItemId: 5,
  },
]

interface UndoToast {
  id: number
  message: string
  onUndo: () => void
}

const getActiveMenu = (pathname: string): ActiveMenu => ROUTE_TO_MENU[pathname] ?? 'dashboard'

const readStorage = <T,>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const parseQuickAddCandidate = (text: string, type: QuickAddType): QuickAddType => {
  if (type !== 'memo') return type
  const hasFinance = /\d+[\d,]*\s*(원|만원|\₩)?/.test(text)
  const hasSchedule = /(내일|모레|오후|오전|\d+시)/.test(text)
  if (hasFinance) return 'finance'
  if (hasSchedule) return 'event'
  return 'task'
}

export const AppShell = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const [notesTag, setNotesTag] = useState('전체')
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [selectedInboxItemId, setSelectedInboxItemId] = useState<number | null>(null)
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [toast, setToast] = useState<UndoToast | null>(null)

  const activeMenu = getActiveMenu(location.pathname)
  const ui = useMemo(() => parseUiQueryState(searchParams), [searchParams])

  const dashboardSummaryQuery = useQuery({ queryKey: queryKeys.dashboardSummary, queryFn: dataProvider.getDashboardSummary })
  const budgetQuery = useQuery({ queryKey: queryKeys.financeBudget, queryFn: dataProvider.getFinanceBudget })
  const timelineQuery = useQuery({ queryKey: queryKeys.timeline, queryFn: () => dataProvider.getTimeline({ type: 'all' }) })
  const automationRulesQuery = useQuery({ queryKey: queryKeys.automationRules, queryFn: dataProvider.getAutomationRules })

  const timelineItems = timelineQuery.data ?? FALLBACK_TIMELINE
  const financeSummary = dashboardSummaryQuery.data ?? FALLBACK_SUMMARY
  const budgetItems = budgetQuery.data ?? FALLBACK_BUDGET
  const automationRules = automationRulesQuery.data ?? FALLBACK_AUTOMATION_RULES

  const selectedItem = timelineItems.find((item) => item.id === ui.item) ?? timelineItems[0] ?? null
  const filteredItems = useMemo(
    () => (ui.filter === 'all' ? timelineItems : timelineItems.filter((item) => item.type === ui.filter)),
    [timelineItems, ui.filter],
  )

  useEffect(() => {
    const savedDensity = window.localStorage.getItem(LOCAL_STORAGE_KEYS.density)
    if ((savedDensity === 'compact' || savedDensity === 'comfortable') && savedDensity !== ui.density) {
      setSearchParams((prev) => serializeUiQueryState(prev, { density: savedDensity as Density }), { replace: true })
    }
    const savedSelected = Number(window.localStorage.getItem(LOCAL_STORAGE_KEYS.selectedItem) ?? '')
    if (!Number.isNaN(savedSelected) && savedSelected > 0 && ui.item !== savedSelected) {
      setSearchParams((prev) => serializeUiQueryState(prev, { item: savedSelected }), { replace: true })
    }
    setInboxItems(readStorage<InboxItem[]>(LOCAL_STORAGE_KEYS.inbox, []))
    setNotifications(readStorage<NotificationItem[]>(LOCAL_STORAGE_KEYS.notifications, initialNotifications))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    window.localStorage.setItem(LOCAL_STORAGE_KEYS.inbox, JSON.stringify(inboxItems))
  }, [inboxItems])

  useEffect(() => {
    window.localStorage.setItem(LOCAL_STORAGE_KEYS.notifications, JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    window.localStorage.setItem(LOCAL_STORAGE_KEYS.density, ui.density)
  }, [ui.density])

  useEffect(() => {
    if (ui.item) {
      window.localStorage.setItem(LOCAL_STORAGE_KEYS.selectedItem, String(ui.item))
    }
  }, [ui.item])

  useEffect(() => {
    if (!timelineItems.length) return
    if (!selectedItem) {
      setSearchParams((prev) => serializeUiQueryState(prev, { item: timelineItems[0].id }), { replace: true })
    }
  }, [selectedItem, setSearchParams, timelineItems])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 4500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const setUi = useCallback(
    (patch: Partial<UiQueryState>) => {
      setSearchParams((prev) => serializeUiQueryState(prev, patch), { replace: true })
    },
    [setSearchParams],
  )

  const showUndoToast = useCallback((message: string, onUndo: () => void) => {
    setToast({ id: Date.now(), message, onUndo })
  }, [])

  const assignCategoryMutation = useMutation({
    mutationFn: ({ itemId, category }: { itemId: number; category: string }) => dataProvider.updateTimelineCategory(itemId, category),
    onMutate: async ({ itemId, category }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.timeline })
      await queryClient.cancelQueries({ queryKey: queryKeys.dashboardSummary })
      const previousTimeline = queryClient.getQueryData<TimelineItem[]>(queryKeys.timeline)
      const previousSummary = queryClient.getQueryData<FinanceSummary>(queryKeys.dashboardSummary)

      queryClient.setQueryData<TimelineItem[]>(queryKeys.timeline, (current = []) =>
        current.map((item) => (item.id === itemId && item.type === 'finance' ? { ...item, category, status: item.status === 'pending_category' ? 'completed' : item.status } : item)),
      )
      queryClient.setQueryData<FinanceSummary>(queryKeys.dashboardSummary, (current) =>
        current ? { ...current, pendingCount: Math.max(current.pendingCount - 1, 0) } : current,
      )
      showUndoToast(`결제 항목을 ${category}로 분류했습니다`, () => {
        if (previousTimeline) queryClient.setQueryData(queryKeys.timeline, previousTimeline)
        if (previousSummary) queryClient.setQueryData(queryKeys.dashboardSummary, previousSummary)
      })
      return { previousTimeline, previousSummary }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTimeline) queryClient.setQueryData(queryKeys.timeline, context.previousTimeline)
      if (context?.previousSummary) queryClient.setQueryData(queryKeys.dashboardSummary, context.previousSummary)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.timeline })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary })
    },
  })

  const toggleRuleMutation = useMutation({
    mutationFn: ({ ruleId, active }: { ruleId: number; active: boolean }) => dataProvider.toggleAutomationRule(ruleId, active),
    onMutate: async ({ ruleId, active }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.automationRules })
      const previousRules = queryClient.getQueryData<AutomationRule[]>(queryKeys.automationRules)
      queryClient.setQueryData<AutomationRule[]>(queryKeys.automationRules, (current = []) => current.map((rule) => (rule.id === ruleId ? { ...rule, active } : rule)))
      return { previousRules }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousRules) queryClient.setQueryData(queryKeys.automationRules, context.previousRules)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.automationRules })
    },
  })

  const updateInboxStatus = useCallback(
    (itemId: number, status: InboxStatus, message: string) => {
      const previous = inboxItems
      setInboxItems((current) => current.map((item) => (item.id === itemId ? { ...item, status } : item)))
      showUndoToast(message, () => setInboxItems(previous))
    },
    [inboxItems, showUndoToast],
  )

  const contextValue: AppShellContextValue = {
    activeMenu,
    ui,
    setUi,
    selectedItem,
    timelineItems,
    filteredItems,
    financeSummary,
    budgetItems,
    automationRules,
    notesTag,
    setNotesTag,
    isQuickAddOpen,
    setIsQuickAddOpen,
    inboxItems,
    selectedInboxItemId,
    setSelectedInboxItemId,
    notifications,
    isLoading: dashboardSummaryQuery.isPending || budgetQuery.isPending || timelineQuery.isPending || automationRulesQuery.isPending,
    hasError: dashboardSummaryQuery.isError || budgetQuery.isError || timelineQuery.isError || automationRulesQuery.isError,
    onQuickAddSubmit: ({ text, type, saveMode }) => {
      const candidate = parseQuickAddCandidate(text, type)
      const nextItem: InboxItem = {
        id: Date.now(),
        title: text,
        typeCandidate: candidate,
        createdAt: new Date().toISOString(),
        status: saveMode === 'inbox' ? 'draft' : 'saved',
      }
      setInboxItems((current) => [nextItem, ...current])
      setSelectedInboxItemId(nextItem.id)
      setIsQuickAddOpen(false)
      if (saveMode === 'event') {
        setInboxItems((current) => current.map((item) => (item.id === nextItem.id ? { ...item, status: 'scheduled' } : item)))
      }
      if (saveMode === 'memo') {
        setInboxItems((current) => current.map((item) => (item.id === nextItem.id ? { ...item, status: 'saved' } : item)))
      }
    },
    onInboxAction: (itemId, destination) => {
      if (destination === 'dismiss') {
        updateInboxStatus(itemId, 'dismissed', '인박스 항목을 무시했습니다')
        return
      }
      const labelMap: Record<string, { status: InboxStatus; text: string }> = {
        event: { status: 'scheduled', text: '인박스 항목을 일정으로 저장했습니다' },
        finance: { status: 'needs_review', text: '인박스 항목을 거래로 저장했습니다' },
        memo: { status: 'saved', text: '인박스 항목을 메모로 저장했습니다' },
        task: { status: 'saved', text: '인박스 항목을 할 일로 저장했습니다' },
      }
      const target = labelMap[destination]
      updateInboxStatus(itemId, target.status, target.text)
    },
    onMarkAllNotificationsRead: () => {
      setNotifications((current) => current.map((item) => ({ ...item, status: 'read' })))
    },
    onNotificationClick: (notificationId) => {
      const target = notifications.find((item) => item.id === notificationId)
      if (!target) return
      setNotifications((current) =>
        current.map((item) => (item.id === notificationId ? { ...item, status: 'read' } : item)),
      )
      if (target.targetItemId) setUi({ item: target.targetItemId })
      if (target.targetTab) setUi({ tab: target.targetTab })
    },
    onTimelineStatusChange: (itemId, status) => {
      const previousTimeline = queryClient.getQueryData<TimelineItem[]>(queryKeys.timeline) ?? []
      queryClient.setQueryData<TimelineItem[]>(queryKeys.timeline, (current = []) =>
        current.map((item) => (item.id === itemId ? { ...item, status } : item)),
      )
      showUndoToast('타임라인 상태를 변경했습니다', () => {
        queryClient.setQueryData(queryKeys.timeline, previousTimeline)
      })
    },
    onAssignCategory: (itemId: number, category: string) => {
      assignCategoryMutation.mutate({ itemId, category })
    },
    onToggleRule: (ruleId: number, active: boolean) => {
      toggleRuleMutation.mutate({ ruleId, active })
    },
    selectTimelineFilter: (filter: TimelineFilter) => setUi({ filter }),
    selectDensity: (density: Density) => setUi({ density }),
    selectRightPanelTab: (tab: RightPanelTab) => setUi({ tab }),
    selectItem: (itemId: number) => setUi({ item: itemId }),
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <LeftSidebar activeMenu={activeMenu} pendingCount={financeSummary.pendingCount} inboxCount={inboxItems.filter((item) => item.status !== 'dismissed').length} />

        <main className="relative flex min-h-screen flex-1 flex-col overflow-hidden border-r border-slate-200 bg-slate-50">
          <MainHeader
            activeMenu={activeMenu}
            density={ui.density}
            onDensityChange={contextValue.selectDensity}
            notifications={notifications}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onMoveMenu={(menu) => navigate(MENU_TO_ROUTE[menu])}
            onOpenInbox={() => navigate('/dashboard')}
            onNotificationClick={contextValue.onNotificationClick}
            onMarkAllRead={contextValue.onMarkAllNotificationsRead}
            onOpenAiTab={() => setUi({ tab: 'ai' })}
          />

          <div className="relative flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="absolute right-4 top-4 z-10 lg:right-8 lg:top-8">
              <QuickAddMenu isOpen={isQuickAddOpen} setIsOpen={setIsQuickAddOpen} onSubmit={contextValue.onQuickAddSubmit} />
            </div>
            <div className="pt-14 lg:pt-2">
              <Outlet context={contextValue} />
            </div>
          </div>
        </main>

        <RightPanel
          selectedItem={selectedItem}
          rightPanelTab={ui.tab}
          onTabChange={contextValue.selectRightPanelTab}
          onAssignCategory={contextValue.onAssignCategory}
        />
      </div>

      {toast ? (
        <div className="fixed bottom-4 right-4 z-[70] w-[320px] rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
          <p className="text-sm font-medium text-slate-700">{toast.message}</p>
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => {
                toast.onUndo()
                setToast(null)
              }}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
            >
              Undo
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
