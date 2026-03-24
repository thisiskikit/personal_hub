import { Inbox, Sparkles } from 'lucide-react'
import { StatePanel } from '@/shared/ui'
import { useAppShellContext } from '@/widgets/layout/ui/useAppShellContext'

export const InboxPage = () => {
  const { inboxItems, processInboxItem, selectInboxItem, activeInboxCount } = useAppShellContext()

  return (
    <>
      <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-indigo-900">
          <Inbox size={16} /> 인박스 처리함
        </p>
        <p className="mt-1 text-xs text-indigo-800">
          AI와 빠른 추가로 들어온 항목을 확인하고 메뉴별로 저장하세요.
        </p>
        <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-semibold text-indigo-700">
          <Sparkles size={12} /> 처리 대기 {activeInboxCount}개
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-800">인박스 목록</h3>
          <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">
            총 {inboxItems.length}개
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {inboxItems.length ? (
            inboxItems.map((item) => (
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
                    후보: {item.typeCandidate} · 상태: {item.status} ·{' '}
                    {new Date(item.createdAt).toLocaleString('ko-KR')}
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
            <div className="p-6">
              <StatePanel
                type="empty"
                title="인박스가 비어 있습니다"
                description="빠른 추가 또는 AI 대화에서 항목을 생성해 보세요."
              />
            </div>
          )}
        </div>
      </section>
    </>
  )
}
