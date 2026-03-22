import { ArrowDownRight, ArrowUpRight, ListTodo, Wallet } from 'lucide-react'
import { TimelineList } from '@/features/timeline/ui/TimelineList'
import { BudgetBar, KPIStatCard, StatePanel } from '@/shared/ui'
import { useAppShellContext } from '@/widgets/layout/ui/useAppShellContext'

export const FinancePage = () => {
  const {
    financeSummary,
    budgetItems,
    timelineItems,
    ui,
    isLoading,
    hasError,
    onAssignCategory,
    selectItem,
  } = useAppShellContext()

  if (hasError) {
    return (
      <StatePanel
        type="error"
        title="재무 데이터를 불러오지 못했습니다"
        description="잠시 후 다시 시도해 주세요."
      />
    )
  }

  if (isLoading) {
    return (
      <StatePanel
        type="loading"
        title="재무 장부 로딩 중"
        description="데이터를 불러오고 있습니다."
      />
    )
  }

  const financeItems = timelineItems.filter((item) => item.type === 'finance')

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <KPIStatCard
          title="총 잔액"
          icon={<Wallet size={16} className="text-slate-400" />}
          value={`₩${financeSummary.balance}`}
          subtext="모든 연결 계좌 합산"
        />
        <KPIStatCard
          title="이번 달 수입"
          icon={<ArrowUpRight size={16} className="text-emerald-500" />}
          value={`₩${financeSummary.incomeThisMonth}`}
          subtext="전월 대비 12% 상승"
          bgColor="bg-emerald-50/30"
        />
        <KPIStatCard
          title="이번 달 지출"
          icon={<ArrowDownRight size={16} className="text-rose-500" />}
          value={`₩${financeSummary.expenseThisMonth}`}
          subtext="예산 300만 원 중 75% 사용"
          bgColor="bg-rose-50/30"
        />
      </div>

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="mb-4 text-sm font-bold text-slate-800">주요 카테고리 예산</h4>
        <div className="space-y-4">
          {budgetItems.map((budget) => (
            <BudgetBar
              key={budget.label}
              label={budget.label}
              current={budget.current}
              max={budget.max}
              color={budget.color}
            />
          ))}
        </div>
      </div>

      <h3 className="mb-3 ml-1 flex items-center text-base font-bold text-slate-800">
        <ListTodo size={18} className="mr-2 text-slate-400" />
        최근 거래 내역
      </h3>
      {financeItems.length ? (
        <TimelineList
          items={financeItems}
          selectedItemId={ui.item}
          density={ui.density}
          onSelect={selectItem}
          onAssignCategory={onAssignCategory}
          onComplete={() => undefined}
        />
      ) : (
        <StatePanel
          type="empty"
          title="거래 내역이 없습니다"
          description="새로운 거래를 추가해 주세요."
        />
      )}
    </>
  )
}
