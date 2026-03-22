import { Calendar as CalendarIcon } from 'lucide-react'
import { TimelineList } from '@/features/timeline/ui/TimelineList'
import { StatePanel } from '@/shared/ui'
import { useAppShellContext } from '@/widgets/layout/ui/useAppShellContext'

export const CalendarPage = () => {
  const { timelineItems, ui, onAssignCategory, selectItem, isLoading, hasError } =
    useAppShellContext()
  const scheduleItems = timelineItems.filter(
    (item) => item.type === 'event' || item.type === 'task',
  )
  const days = ['월', '화', '수', '목', '금', '토', '일']

  if (hasError) {
    return (
      <StatePanel
        type="error"
        title="일정을 불러오지 못했습니다"
        description="잠시 후 다시 시도해 주세요."
      />
    )
  }

  if (isLoading) {
    return (
      <StatePanel
        type="loading"
        title="일정 로딩 중"
        description="일정 정보를 불러오고 있습니다."
      />
    )
  }

  return (
    <>
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {days.map((day, idx) => (
          <div
            key={day}
            className={`flex min-w-16 flex-1 flex-col items-center rounded-xl border p-3 ${
              idx === 4
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <span className="mb-1 text-xs font-semibold opacity-80">{day}</span>
            <span className="text-lg font-bold">{idx + 2}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 mb-4 ml-1 flex items-center justify-between">
        <h3 className="flex items-center text-base font-bold text-slate-800">
          <CalendarIcon size={18} className="mr-2 text-slate-400" />
          오늘의 일정 및 할 일
        </h3>
        <button className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
          전체 캘린더 보기
        </button>
      </div>

      {scheduleItems.length ? (
        <TimelineList
          items={scheduleItems}
          selectedItemId={ui.item}
          density={ui.density}
          onSelect={selectItem}
          onAssignCategory={onAssignCategory}
        />
      ) : (
        <StatePanel
          type="empty"
          title="예정된 일정이 없습니다"
          description="새로운 일정을 추가해 주세요."
        />
      )}
    </>
  )
}
