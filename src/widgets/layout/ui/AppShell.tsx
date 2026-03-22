import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useSearchParams, Outlet } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AutomationRule } from '@/entities/automation/model/types'
import type { BudgetItem, FinanceSummary } from '@/entities/finance/model/types'
import type { TimelineFilter, TimelineItem } from '@/entities/timeline/model/types'
import { QuickAddMenu } from '@/features/quick-add/ui/QuickAddMenu'
import { dataProvider, queryKeys } from '@/shared/api'
import { serializeUiQueryState, parseUiQueryState } from '@/shared/lib/route-query'
import { ROUTE_TO_MENU } from '@/shared/types/navigation'
import type { ActiveMenu } from '@/shared/types/navigation'
import type { Density, RightPanelTab, UiQueryState } from '@/shared/types/ui-state'
import { MainHeader } from '@/widgets/layout/ui/MainHeader'
import { LeftSidebar } from '@/widgets/layout/ui/LeftSidebar'
import { RightPanel } from '@/widgets/layout/ui/RightPanel'
import type { AppShellContextValue } from '@/widgets/layout/ui/useAppShellContext'

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

const getActiveMenu = (pathname: string): ActiveMenu => ROUTE_TO_MENU[pathname] ?? 'dashboard'

export const AppShell = () => {
  const location = useLocation()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const [notesTag, setNotesTag] = useState('전체')
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)

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

  const selectedItem = timelineItems.find((item) => item.id === ui.item) ?? timelineItems[0] ?? null
  const filteredItems = useMemo(
    () =>
      ui.filter === 'all' ? timelineItems : timelineItems.filter((item) => item.type === ui.filter),
    [timelineItems, ui.filter],
  )

  useEffect(() => {
    if (!timelineItems.length) return
    if (!selectedItem) {
      setSearchParams((prev) => serializeUiQueryState(prev, { item: timelineItems[0].id }), {
        replace: true,
      })
    }
  }, [selectedItem, setSearchParams, timelineItems])

  const setUi = useCallback(
    (patch: Partial<UiQueryState>) => {
      setSearchParams((prev) => serializeUiQueryState(prev, patch), { replace: true })
    },
    [setSearchParams],
  )

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
    isLoading:
      dashboardSummaryQuery.isPending ||
      budgetQuery.isPending ||
      timelineQuery.isPending ||
      automationRulesQuery.isPending,
    hasError:
      dashboardSummaryQuery.isError ||
      budgetQuery.isError ||
      timelineQuery.isError ||
      automationRulesQuery.isError,
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
        <LeftSidebar activeMenu={activeMenu} pendingCount={financeSummary.pendingCount} />

        <main className="relative flex min-h-screen flex-1 flex-col overflow-hidden border-r border-slate-200 bg-slate-50">
          <MainHeader
            activeMenu={activeMenu}
            density={ui.density}
            onDensityChange={contextValue.selectDensity}
          />

          <div className="relative flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="absolute right-4 top-4 z-10 lg:right-8 lg:top-8">
              <QuickAddMenu isOpen={isQuickAddOpen} setIsOpen={setIsQuickAddOpen} />
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
    </div>
  )
}
