import { Calendar as CalendarIcon, FileText, Inbox, Plus, Sparkles, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { InboxItem, InboxStatus } from '@/widgets/layout/ui/useAppShellContext'

interface QuickAddMenuProps {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  onAddInboxItem: (payload: {
    title: string
    typeCandidate: InboxItem['typeCandidate']
    status?: InboxStatus
  }) => void
}

const typeOptions: { label: string; value: InboxItem['typeCandidate'] }[] = [
  { label: '일정', value: 'event' },
  { label: '거래', value: 'finance' },
  { label: '메모', value: 'memo' },
  { label: '할 일', value: 'task' },
  { label: 'AI 요청', value: 'ai_request' },
]

type SaveMode = 'inbox' | 'event' | 'memo'

const detectCandidate = (input: string): InboxItem['typeCandidate'] => {
  const hasAmount = /(\d+[\d,]*(원|만원)?)/.test(input) || /(\d+[\d,]*)/.test(input)
  const hasSchedule = /(내일|오후|오전|\d+시|\d{1,2}:\d{2})/.test(input)

  if (hasAmount) return 'finance'
  if (hasSchedule) return 'event'
  return 'memo'
}

export const QuickAddMenu = ({ isOpen, setIsOpen, onAddInboxItem }: QuickAddMenuProps) => {
  const [inputValue, setInputValue] = useState('')
  const [selectedType, setSelectedType] = useState<InboxItem['typeCandidate']>('memo')
  const [saveMode, setSaveMode] = useState<SaveMode>('inbox')

  const parsedCandidate = useMemo(() => detectCandidate(inputValue), [inputValue])

  const handleSave = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return

    const typeCandidate = selectedType === 'memo' ? parsedCandidate : selectedType
    const status: InboxStatus = saveMode === 'inbox' ? 'needs_review' : saveMode === 'event' ? 'scheduled' : 'saved'

    onAddInboxItem({
      title: trimmed,
      typeCandidate: saveMode === 'memo' ? 'memo' : saveMode === 'event' ? 'event' : typeCandidate,
      status,
    })

    setInputValue('')
    setSelectedType('memo')
    setSaveMode('inbox')
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((value) => !value)}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
        aria-expanded={isOpen}
        aria-label="빠른 추가 메뉴 열기"
      >
        <Plus size={16} />
        <span>빠른 추가</span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-50 mt-2 w-[420px] rounded-xl border border-slate-200 bg-white p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">빠른 추가</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>

          <textarea
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder={'내일 3시 치과\n스타벅스 9500 점심 커피\n프랑스 인보이스 다시 보내기'}
            className="min-h-[96px] w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {typeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedType(option.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  selectedType === option.value
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            ))}
            <span className="ml-auto rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">
              추천: {parsedCandidate === 'finance' ? '거래' : parsedCandidate === 'event' ? '일정' : '메모'}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setSaveMode('inbox')}
              className={`flex items-center justify-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-semibold ${
                saveMode === 'inbox'
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Inbox size={14} /> 인박스로 저장
            </button>
            <button
              type="button"
              onClick={() => setSaveMode('event')}
              className={`flex items-center justify-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-semibold ${
                saveMode === 'event'
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CalendarIcon size={14} /> 바로 일정으로
            </button>
            <button
              type="button"
              onClick={() => setSaveMode('memo')}
              className={`flex items-center justify-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-semibold ${
                saveMode === 'memo'
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileText size={14} /> 바로 메모로
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
              <Sparkles size={13} className="text-indigo-500" />
              빠른 분류 후 인박스에서 후속 처리할 수 있습니다.
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
            >
              저장
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
