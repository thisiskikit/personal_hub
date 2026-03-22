import { AlertCircle, Bot, Clock, Sparkles } from 'lucide-react'
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
    completeTimelineItem,
    inboxItems,
    activeInboxCount,
    processInboxItem,
    selectInboxItem,
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
      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-4">
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
          title="인박스"
          icon={<AlertCircle size={16} className="text-indigo-500" />}
          value={`${activeInboxCount}개`}
          subtext="빠른 입력 후 아직 처리되지 않은 항목"
          bgColor="bg-indigo-50/40"
          borderColor="border-indigo-100"
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

      <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3">
          <h3 className="text-base font-bold text-slate-800">인박스 / 미분류 항목</h3>
          <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">
            {activeInboxCount}개 대기
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {inboxItems.length ? (
            inboxItems.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between"
              >
                <button
                  type="button"
                  onClick={() => selectInboxItem(item.id)}
                  className="min-w-0 text-left"
                >
                  <p className="truncate text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    후보: {item.typeCandidate} · {new Date(item.createdAt).toLocaleString('ko-KR')} · {item.status}
                  </p>
                </button>
                <div className="grid grid-cols-3 gap-1 sm:flex sm:flex-wrap sm:justify-end">
                  <button
                    type="button"
                    onClick={() => processInboxItem(item.id, 'event')}
                    className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700"
                  >
                    일정
                  </button>
                  <button
                    type="button"
                    onClick={() => processInboxItem(item.id, 'finance')}
                    className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700"
                  >
                    거래
                  </button>
                  <button
                    type="button"
                    onClick={() => processInboxItem(item.id, 'memo')}
                    className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700"
                  >
                    메모
                  </button>
                  <button
                    type="button"
                    onClick={() => processInboxItem(item.id, 'task')}
                    className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700"
                  >
                    할 일
                  </button>
                  <button
                    type="button"
                    onClick={() => processInboxItem(item.id, 'dismissed')}
                    className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700"
                  >
                    무시
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm font-medium text-slate-500">
              인박스가 비어 있습니다. 빠른 추가로 운영 항목을 모아보세요.
            </div>
          )}
        </div>
      </section>

      <div className="flex items-center justify-between rounded-t-xl border border-b-0 border-slate-200 bg-slate-50/50 px-6 py-4">
        <h3 className="text-base font-bold text-slate-800">운영 타임라인</h3>
        <div className="flex rounded-lg bg-slate-100 p-1">
          <FilterButton label="전체" value="all" current={ui.filter} onClick={selectTimelineFilter} />
          <FilterButton label="일정" value="event" current={ui.filter} onClick={selectTimelineFilter} />
          <FilterButton
            label="재무"
            value="finance"
            current={ui.filter}
            onClick={selectTimelineFilter}
          />
          <FilterButton label="할 일" value="task" current={ui.filter} onClick={selectTimelineFilter} />
        </div>
      </div>

      {filteredItems.length ? (
        <TimelineList
          items={filteredItems}
          selectedItemId={ui.item}
          density={ui.density}
          onSelect={selectItem}
          onAssignCategory={onAssignCategory}
          onComplete={completeTimelineItem}
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
