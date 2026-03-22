import { AlertCircle, Bot, Clock, Sparkles, Wallet } from 'lucide-react'
import { TimelineList } from '@/features/timeline/ui/TimelineList'
import { FilterButton, KPIStatCard, StatePanel } from '@/shared/ui'
import { useAppShellContext } from '@/widgets/layout/ui/useAppShellContext'

export const DashboardPage = () => {
  const {
    financeSummary,
    filteredItems,
    isLoading,
    hasError,
    ui,
    onAssignCategory,
    selectItem,
    selectTimelineFilter,
  } = useAppShellContext()

  if (hasError) {
    return (
      <StatePanel
        type="error"
        title="대시보드를 불러오지 못했습니다"
        description="잠시 후 다시 시도해 주세요."
      />
    )
  }

  if (isLoading) {
    return (
      <StatePanel
        type="loading"
        title="대시보드 로딩 중"
        description="데이터를 불러오고 있습니다."
      />
    )
  }

  return (
    <>
      <div className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-4">
        <KPIStatCard
          title="오늘 남은 일정"
          icon={<Clock size={16} className="text-blue-500" />}
          value="2개"
          subtext="다음 일정까지 1시간 15분"
        />
        <KPIStatCard
          title="검토 필요 항목"
          icon={<AlertCircle size={16} className="text-amber-500" />}
          value={`${financeSummary.pendingCount}건`}
          subtext="미분류 지출 내역 대기 중"
          bgColor="bg-amber-50/40"
          borderColor="border-amber-100"
        />
        <KPIStatCard
          title="운용 가능 잔액"
          icon={<Wallet size={16} className="text-emerald-500" />}
          value={`₩${financeSummary.balance}`}
          subtext={`이번 주 결제 예정: ₩${financeSummary.upcomingPayments}`}
        />
        <div className="relative col-span-1 flex flex-col justify-between overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50 p-4">
          <div className="absolute -right-4 -top-4 p-4 opacity-10">
            <Bot size={80} className="text-indigo-600" />
          </div>
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-2 flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-600" />
              <p className="text-sm font-bold text-indigo-900">AI 브리핑</p>
            </div>
            <p className="mt-auto text-sm font-medium leading-snug text-indigo-800">
              오늘 오후 일정 전후로 1시간 여유가 있습니다. 미분류 지출 내역을 정리하시겠어요?
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-t-xl border border-b-0 border-slate-200 bg-slate-50/50 px-6 py-4">
        <h3 className="text-base font-bold text-slate-800">운영 타임라인</h3>
        <div className="flex rounded-lg bg-slate-100 p-1">
          <FilterButton
            label="전체"
            value="all"
            current={ui.filter}
            onClick={selectTimelineFilter}
          />
          <FilterButton
            label="일정"
            value="event"
            current={ui.filter}
            onClick={selectTimelineFilter}
          />
          <FilterButton
            label="재무"
            value="finance"
            current={ui.filter}
            onClick={selectTimelineFilter}
          />
          <FilterButton
            label="할 일"
            value="task"
            current={ui.filter}
            onClick={selectTimelineFilter}
          />
        </div>
      </div>

      {filteredItems.length ? (
        <TimelineList
          items={filteredItems}
          selectedItemId={ui.item}
          density={ui.density}
          onSelect={selectItem}
          onAssignCategory={onAssignCategory}
        />
      ) : (
        <StatePanel
          type="empty"
          title="표시할 항목이 없습니다"
          description="필터 조건을 변경해 주세요."
        />
      )}
    </>
  )
}
