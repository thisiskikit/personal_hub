import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams, Outlet } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AutomationRule } from '@/entities/automation/model/types'
import type { BudgetItem, FinanceSummary } from '@/entities/finance/model/types'
import type { TimelineFilter, TimelineItem, TimelineType } from '@/entities/timeline/model/types'
import { QuickAddMenu } from '@/features/quick-add/ui/QuickAddMenu'
import { FloatingAssistant } from '@/features/assistant/ui/FloatingAssistant'
import { dataProvider, queryKeys } from '@/shared/api'
import { serializeUiQueryState, parseUiQueryState } from '@/shared/lib/route-query'
import { MENU_TO_ROUTE, ROUTE_TO_MENU } from '@/shared/types/navigation'
import type { ActiveMenu } from '@/shared/types/navigation'
import type { Density, RightPanelTab, UiQueryState } from '@/shared/types/ui-state'
import type { AssistantSaveMode, InboxParseResponse } from '@/shared/types/ai'
import { MainHeader } from '@/widgets/layout/ui/MainHeader'
import { LeftSidebar } from '@/widgets/layout/ui/LeftSidebar'
import { RightPanel } from '@/widgets/layout/ui/RightPanel'
import type {
  AppShellContextValue,
  AssistantMessage,
  AssistantPendingAction,
  InboxItem,
  InboxStatus,
  NotificationItem,
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
const INBOX_STORAGE_KEY = 'inboxItems'
const NOTIFICATION_STORAGE_KEY = 'notifications'
const DENSITY_STORAGE_KEY = 'densityMode'
const SELECTED_ITEM_STORAGE_KEY = 'selectedItemId'
const ASSISTANT_OPEN_STORAGE_KEY = 'assistantOpen'

const seedNotifications: NotificationItem[] = [
  {
    id: 101,
    group: 'processing',
    title: '스타벅스 결제 분류 필요',
    description: '회의비 또는 식비로 확정해 주세요.',
    time: '5분 전',
    statusLabel: '처리 필요',
    isRead: false,
    target: { menu: 'dashboard', tab: 'details', itemId: 2 },
  },
  {
    id: 102,
    group: 'ai_approval',
    title: 'AI 분류 제안 승인 대기',
    description: '이번 주 교통비 4건 일괄 적용 제안이 도착했습니다.',
    time: '12분 전',
    statusLabel: '승인 대기',
    isRead: false,
    target: { menu: 'dashboard', tab: 'ai' },
  },
  {
    id: 103,
    group: 'upcoming',
    title: '넷플릭스 결제 예정',
    description: '오늘 18:00 자동 결제가 예정되어 있습니다.',
    time: '오늘',
    statusLabel: '예정',
    isRead: true,
    target: { menu: 'finance' },
  },
]

interface ToastItem {
  id: number
  message: string
  undo: () => void
}

const getActiveMenu = (pathname: string): ActiveMenu => ROUTE_TO_MENU[pathname] ?? 'dashboard'

const readStorage = <T,>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const inferStatusFromDestination = (destination: TimelineType | 'dismissed'): InboxStatus => {
  if (destination === 'dismissed') return 'dismissed'
  if (destination === 'event') return 'scheduled'
  return 'saved'
}

export const AppShell = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const [notesTag, setNotesTag] = useState('전체')
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [inboxItems, setInboxItems] = useState<InboxItem[]>(() => readStorage(INBOX_STORAGE_KEY, []))
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    readStorage(NOTIFICATION_STORAGE_KEY, seedNotifications),
  )
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [isAssistantOpen, setIsAssistantOpen] = useState(() =>
    readStorage(ASSISTANT_OPEN_STORAGE_KEY, true),
  )
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>(() => [
    {
      id: `ai-${Date.now()}`,
      role: 'ai' as const,
      text: '원하는 작업을 말씀해 주세요. 저장 전에는 반드시 저장 방법을 확인해 드릴게요.',
    },
  ])
  const [assistantDrafts, setAssistantDrafts] = useState<Record<string, InboxParseResponse>>({})

  const activeMenu = getActiveMenu(location.pathname)
  const ui = useMemo(() => parseUiQueryState(searchParams), [searchParams])

  const dashboardSummaryQuery = useQuery({
    queryKey: queryKeys.dashboardSummary,
    queryFn: dataProvider.getDashboardSummary,
  })

  const budgetQuery = useQuery({
    queryKey: queryKeys.financeBudget,
    queryFn: dataProvider.getFinanceBudget,
  })

  const timelineQuery = useQuery({
    queryKey: queryKeys.timeline,
    queryFn: () => dataProvider.getTimeline({ type: 'all' }),
  })

  const automationRulesQuery = useQuery({
    queryKey: queryKeys.automationRules,
    queryFn: dataProvider.getAutomationRules,
  })

  const timelineItems = timelineQuery.data ?? FALLBACK_TIMELINE
  const financeSummary = dashboardSummaryQuery.data ?? FALLBACK_SUMMARY
  const budgetItems = budgetQuery.data ?? FALLBACK_BUDGET
  const automationRules = automationRulesQuery.data ?? FALLBACK_AUTOMATION_RULES

  const promptProfilesQuery = useQuery({
    queryKey: queryKeys.promptProfiles,
    queryFn: dataProvider.getPromptProfiles,
  })

  const promptProfiles = promptProfilesQuery.data ?? []

  const selectedItem = timelineItems.find((item) => item.id === ui.item) ?? timelineItems[0] ?? null
  const filteredItems = useMemo(
    () =>
      ui.filter === 'all' ? timelineItems : timelineItems.filter((item) => item.type === ui.filter),
    [timelineItems, ui.filter],
  )

  const activeInboxCount = inboxItems.filter((item) => item.status !== 'dismissed').length

  useEffect(() => {
    if (!timelineItems.length) return
    if (!selectedItem) {
      const storedItem = Number(localStorage.getItem(SELECTED_ITEM_STORAGE_KEY))
      const fallbackId =
        storedItem && timelineItems.some((item) => item.id === storedItem) ? storedItem : timelineItems[0].id

      setSearchParams((prev) => serializeUiQueryState(prev, { item: fallbackId }), {
        replace: true,
      })
    }
  }, [selectedItem, setSearchParams, timelineItems])

  useEffect(() => {
    localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(inboxItems))
  }, [inboxItems])

  useEffect(() => {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    localStorage.setItem(DENSITY_STORAGE_KEY, ui.density)
  }, [ui.density])

  useEffect(() => {
    if (!ui.item) return
    localStorage.setItem(SELECTED_ITEM_STORAGE_KEY, String(ui.item))
  }, [ui.item])

  useEffect(() => {
    localStorage.setItem(ASSISTANT_OPEN_STORAGE_KEY, JSON.stringify(isAssistantOpen))
  }, [isAssistantOpen])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsCommandPaletteOpen(true)
      }
      if (event.key === 'Escape') {
        setIsQuickAddOpen(false)
        setIsCommandPaletteOpen(false)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const setUi = useCallback(
    (patch: Partial<UiQueryState>) => {
      setSearchParams((prev) => serializeUiQueryState(prev, patch), { replace: true })
    },
    [setSearchParams],
  )

  const pushUndoToast = useCallback((message: string, undo: () => void) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, undo }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4200)
  }, [])

  const assignCategoryMutation = useMutation({
    mutationFn: ({ itemId, category }: { itemId: number; category: string }) =>
      dataProvider.updateTimelineCategory(itemId, category),
    onMutate: async ({ itemId, category }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.timeline })
      await queryClient.cancelQueries({ queryKey: queryKeys.dashboardSummary })
      const previousTimeline = queryClient.getQueryData<TimelineItem[]>(queryKeys.timeline)
      const previousSummary = queryClient.getQueryData<FinanceSummary>(queryKeys.dashboardSummary)

      queryClient.setQueryData<TimelineItem[]>(queryKeys.timeline, (current = []) =>
        current.map((item) => {
          if (item.id !== itemId || item.type !== 'finance') return item
          return {
            ...item,
            category,
            status: item.status === 'pending_category' ? 'completed' : item.status,
          }
        }),
      )

      queryClient.setQueryData<FinanceSummary>(queryKeys.dashboardSummary, (current) => {
        if (!current) return current
        return {
          ...current,
          pendingCount: Math.max(current.pendingCount - 1, 0),
        }
      })

      return { previousTimeline, previousSummary }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTimeline) {
        queryClient.setQueryData(queryKeys.timeline, context.previousTimeline)
      }
      if (context?.previousSummary) {
        queryClient.setQueryData(queryKeys.dashboardSummary, context.previousSummary)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.timeline })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary })
    },
  })

  const toggleRuleMutation = useMutation({
    mutationFn: ({ ruleId, active }: { ruleId: number; active: boolean }) =>
      dataProvider.toggleAutomationRule(ruleId, active),
    onMutate: async ({ ruleId, active }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.automationRules })
      const previousRules = queryClient.getQueryData<AutomationRule[]>(queryKeys.automationRules)
      queryClient.setQueryData<AutomationRule[]>(queryKeys.automationRules, (current = []) =>
        current.map((rule) => (rule.id === ruleId ? { ...rule, active } : rule)),
      )
      return { previousRules }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousRules) {
        queryClient.setQueryData(queryKeys.automationRules, context.previousRules)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.automationRules })
    },
  })

  const completeTimelineItem = useCallback(
    (itemId: number) => {
      const previousTimeline = queryClient.getQueryData<TimelineItem[]>(queryKeys.timeline) ?? []
      const target = previousTimeline.find((item) => item.id === itemId)
      queryClient.setQueryData<TimelineItem[]>(queryKeys.timeline, (current = []) =>
        current.map((item) =>
          item.id === itemId ? { ...item, status: 'completed' as const } : item,
        ),
      )

      if (target) {
        pushUndoToast(`'${target.title}' 항목을 완료 처리했습니다`, () => {
          queryClient.setQueryData(queryKeys.timeline, previousTimeline)
        })
      }
    },
    [pushUndoToast, queryClient],
  )

  const processInboxItem = useCallback(
    (id: number, destination: TimelineType | 'dismissed') => {
      setInboxItems((current) => {
        const previous = [...current]
        const next = current.map((item) =>
          item.id === id ? { ...item, status: inferStatusFromDestination(destination) } : item,
        )
        const target = current.find((item) => item.id === id)

        if (target) {
          const destinationText = destination === 'dismissed' ? '무시' : `${destination}로 저장`
          pushUndoToast(`인박스 항목을 ${destinationText}했습니다`, () => setInboxItems(previous))
        }

        return next
      })
    },
    [pushUndoToast],
  )

  const addInboxItem = useCallback(
    ({ title, typeCandidate, status = 'needs_review' }: { title: string; typeCandidate: InboxItem['typeCandidate']; status?: InboxStatus }) => {
      const item: InboxItem = {
        id: Date.now(),
        title,
        typeCandidate,
        createdAt: new Date().toISOString(),
        status,
      }

      setInboxItems((current) => [item, ...current])
      pushUndoToast('인박스에 새 항목을 추가했습니다', () => {
        setInboxItems((current) => current.filter((inboxItem) => inboxItem.id !== item.id))
      })
    },
    [pushUndoToast],
  )

  const sendAssistantMessage = useCallback((message: string) => {
    const parseResponseToPendingAction = (payload: InboxParseResponse): AssistantPendingAction => ({
      id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: payload.entities.title || message.trim(),
      typeCandidate: payload.primary_type,
      suggestedMode: payload.recommended_save_mode,
    })

    const trimmed = message.trim()
    if (!trimmed) return

    setAssistantMessages((current) => [...current, { id: `user-${Date.now()}`, role: 'user', text: trimmed }])

    void dataProvider
      .inboxParse(trimmed)
      .then((result) => {
        const parsed = result.data
        const pendingAction = parseResponseToPendingAction(parsed)
        setAssistantDrafts((current) => ({ ...current, [pendingAction.id]: parsed }))

        const saveModeLabel =
          parsed.recommended_save_mode === 'event'
            ? '바로 일정 저장'
            : parsed.recommended_save_mode === 'memo'
              ? '바로 메모 저장'
              : '인박스 저장'

        const clarifying = parsed.clarification_needed
          ? '정보가 조금 부족해요. 먼저 인박스로 저장한 뒤 수정하는 것을 권장합니다.'
          : '원하시는 저장 방식을 선택해 주세요.'

        setAssistantMessages((current) => [
          ...current,
          {
            id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            role: 'ai',
            text: `${parsed.summary} (신뢰도 ${Math.round(parsed.confidence * 100)}%)\n추천: ${saveModeLabel}\n${clarifying}`,
            pendingAction,
          },
        ])
      })
      .catch(() => {
        setAssistantMessages((current) => [
          ...current,
          {
            id: `ai-error-${Date.now()}`,
            role: 'ai',
            text: 'AI 분석에 실패했습니다. 잠시 후 다시 시도해 주세요.',
          },
        ])
      })
  }, [])

  const confirmAssistantSave = useCallback(
    (actionId: string, mode: AssistantSaveMode) => {
      let actionToSave: AssistantPendingAction | undefined

      setAssistantMessages((current) => {
        actionToSave =
          current.find((message) => message.pendingAction?.id === actionId)?.pendingAction
        return current.map((message) =>
          message.pendingAction?.id === actionId ? { ...message, pendingAction: undefined } : message,
        )
      })

      const resolvedAction = actionToSave
      if (!resolvedAction) return

      const status: InboxStatus = mode === 'inbox' ? 'needs_review' : mode === 'event' ? 'scheduled' : 'saved'
      const draft = assistantDrafts[actionId]
      const typeCandidate =
        mode === 'event' ? 'event' : mode === 'memo' ? 'memo' : draft?.primary_type ?? resolvedAction.typeCandidate

      addInboxItem({
        title: resolvedAction.title,
        typeCandidate,
        status,
      })

      const savedTargetLabel = mode === 'event' ? '일정' : mode === 'memo' ? '메모' : '인박스'
      setAssistantMessages((current) => [
        ...current,
        {
          id: `ai-saved-${Date.now()}`,
          role: 'ai',
          text: `좋아요. '${resolvedAction.title}' 항목을 ${savedTargetLabel}로 저장했습니다.`,
        },
      ])
      setAssistantDrafts((current) => {
        const next = { ...current }
        delete next[actionId]
        return next
      })
    },
    [addInboxItem, assistantDrafts],
  )

  const updatePromptProfile = useCallback(async (key: string, promptText: string) => {
    await dataProvider.updatePromptProfile(key, promptText)
    void queryClient.invalidateQueries({ queryKey: queryKeys.promptProfiles })
    pushUndoToast('프롬프트를 저장했습니다', () => undefined)
  }, [pushUndoToast, queryClient])

  const markNotificationsRead = useCallback(() => {
    const previous = [...notifications]
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })))
    pushUndoToast('모든 알림을 읽음 처리했습니다', () => setNotifications(previous))
  }, [notifications, pushUndoToast])

  const openNotification = useCallback(
    (notificationId: number) => {
      const notification = notifications.find((item) => item.id === notificationId)
      if (!notification) return

      setNotifications((current) =>
        current.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)),
      )

      if (notification.target?.menu) {
        void navigate(MENU_TO_ROUTE[notification.target.menu])
      }
      if (notification.target?.tab) {
        setUi({ tab: notification.target.tab })
      }
      if (notification.target?.itemId) {
        setUi({ item: notification.target.itemId })
      }
    },
    [navigate, notifications, setUi],
  )

  const executeCommand = useCallback(
    (commandId: string) => {
      if (commandId === 'open-quick-add') {
        setIsQuickAddOpen(true)
      }
      if (commandId === 'open-inbox') {
        void navigate('/dashboard')
      }
      if (commandId === 'open-ai-tab') {
        setUi({ tab: 'ai' })
      }
      if (commandId === 'go-dashboard') void navigate('/dashboard')
      if (commandId === 'go-finance') void navigate('/finance')
      if (commandId === 'go-calendar') void navigate('/calendar')
      if (commandId === 'go-notes') void navigate('/notes')
      setIsCommandPaletteOpen(false)
    },
    [navigate, setUi],
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
    activeInboxCount,
    notifications,
    selectedItemId: ui.item,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    selectInboxItem: (id: number) => setUi({ item: id }),
    processInboxItem,
    addInboxItem,
    markNotificationsRead,
    openNotification,
    completeTimelineItem,
    isLoading:
      dashboardSummaryQuery.isPending ||
      budgetQuery.isPending ||
      timelineQuery.isPending ||
      automationRulesQuery.isPending || promptProfilesQuery.isPending,
    hasError:
      dashboardSummaryQuery.isError ||
      budgetQuery.isError ||
      timelineQuery.isError ||
      automationRulesQuery.isError || promptProfilesQuery.isError,
    onAssignCategory: (itemId: number, category: string) => {
      assignCategoryMutation.mutate({ itemId, category })
      pushUndoToast(`분류를 '${category}'로 변경했습니다`, () => {
        queryClient.setQueryData<TimelineItem[]>(queryKeys.timeline, (current = []) =>
          current.map((item) =>
            item.id === itemId && item.type === 'finance'
              ? { ...item, category: '미분류', status: 'pending_category' }
              : item,
          ),
        )
      })
    },
    promptProfiles,
    updatePromptProfile,
    onToggleRule: (ruleId: number, active: boolean) => {
      toggleRuleMutation.mutate({ ruleId, active })
    },
    assistantMessages,
    sendAssistantMessage,
    confirmAssistantSave,
    selectTimelineFilter: (filter: TimelineFilter) => setUi({ filter }),
    selectDensity: (density: Density) => setUi({ density }),
    selectRightPanelTab: (tab: RightPanelTab) => setUi({ tab }),
    selectItem: (itemId: number) => setUi({ item: itemId }),
  }

  const commandItems = [
    { id: 'go-dashboard', label: '오늘 대시보드로 이동' },
    { id: 'go-finance', label: '재무 장부로 이동' },
    { id: 'go-calendar', label: '통합 일정으로 이동' },
    { id: 'go-notes', label: '메모 및 지식으로 이동' },
    { id: 'open-quick-add', label: '빠른 추가 열기' },
    { id: 'open-inbox', label: '인박스 보기' },
    { id: 'open-ai-tab', label: 'AI 제안 탭 열기' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <LeftSidebar activeMenu={activeMenu} pendingCount={activeInboxCount} />

        <main className="relative flex min-h-screen flex-1 flex-col overflow-hidden border-r border-slate-200 bg-slate-50">
          <MainHeader
            activeMenu={activeMenu}
            density={ui.density}
            notifications={notifications}
            onDensityChange={contextValue.selectDensity}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onMarkAllNotificationsRead={markNotificationsRead}
            onOpenNotification={openNotification}
          />

          <div className="relative flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="absolute right-4 top-4 z-10 lg:right-8 lg:top-8">
              <QuickAddMenu
                isOpen={isQuickAddOpen}
                setIsOpen={setIsQuickAddOpen}
                onAddInboxItem={addInboxItem}
              />
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
          promptProfiles={promptProfiles}
          onPromptProfileChange={updatePromptProfile}
        />
      </div>

      {isCommandPaletteOpen ? (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-slate-900/30 p-4 pt-24">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-4 py-3">
              <input
                autoFocus
                placeholder="검색 또는 명령 실행..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="max-h-[380px] overflow-y-auto p-2">
              <p className="px-2 pb-1 pt-2 text-xs font-semibold text-slate-400">명령</p>
              {commandItems.map((command) => (
                <button
                  key={command.id}
                  type="button"
                  onClick={() => executeCommand(command.id)}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {command.label}
                </button>
              ))}
              <p className="px-2 pb-1 pt-3 text-xs font-semibold text-slate-400">최근 항목</p>
              <div className="space-y-1">
                <div className="rounded-lg px-3 py-2 text-sm text-slate-600">스타벅스 결제 분류</div>
                <div className="rounded-lg px-3 py-2 text-sm text-slate-600">내일 3시 치과 일정</div>
                <div className="rounded-lg px-3 py-2 text-sm text-slate-600">프랑스 인보이스 메모</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-4 right-4 z-[80] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg"
          >
            <p className="text-sm font-medium text-slate-700">{toast.message}</p>
            <button
              type="button"
              onClick={() => {
                toast.undo()
                setToasts((prev) => prev.filter((item) => item.id !== toast.id))
              }}
              className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-700"
            >
              Undo
            </button>
          </div>
        ))}
      </div>

      <FloatingAssistant
        isOpen={isAssistantOpen}
        onToggleOpen={() => setIsAssistantOpen((current) => !current)}
        messages={assistantMessages}
        onSendMessage={sendAssistantMessage}
        onConfirmSave={confirmAssistantSave}
      />
    </div>
  )
}
