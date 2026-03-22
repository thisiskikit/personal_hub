import { Calendar as CalendarIcon, FileText, ListTodo, Plus, Sparkles, Wallet, X } from 'lucide-react'
import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import type { QuickAddType } from '@/widgets/layout/ui/useAppShellContext'

interface QuickAddMenuProps {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  onSubmit: (payload: { text: string; type: QuickAddType; saveMode: 'inbox' | 'event' | 'memo' }) => void
}

const typeOptions: { id: QuickAddType; label: string; icon: ReactNode }[] = [
  { id: 'event', label: '일정', icon: <CalendarIcon size={14} /> },
  { id: 'finance', label: '거래', icon: <Wallet size={14} /> },
  { id: 'memo', label: '메모', icon: <FileText size={14} /> },
  { id: 'task', label: '할 일', icon: <ListTodo size={14} /> },
  { id: 'ai', label: 'AI 요청', icon: <Sparkles size={14} /> },
]

export const QuickAddMenu = ({ isOpen, setIsOpen, onSubmit }: QuickAddMenuProps) => {
  const [text, setText] = useState('')
  const [type, setType] = useState<QuickAddType>('memo')

  const suggestedType = useMemo(() => {
    if (/\d+[\d,]*\s*(원|만원|\₩)?/.test(text)) return '거래 후보'
    if (/(내일|오후|오전|\d+시)/.test(text)) return '일정 후보'
    return '메모/할 일 후보'
  }, [text])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
        aria-expanded={isOpen}
        aria-label="빠른 추가 열기"
      >
        <Plus size={16} />
        <span>빠른 추가</span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">빠른 추가</h3>
                <p className="text-sm text-slate-500">입력 → 인박스 → 처리 흐름으로 바로 저장합니다.</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={'내일 3시 치과\n스타벅스 9500 점심 커피\n프랑스 인보이스 다시 보내기'}
              className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none ring-indigo-500 placeholder:text-slate-400 focus:bg-white focus:ring-2"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {typeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setType(option.id)}
                  className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    type === option.id
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
              <span className="ml-auto text-xs font-semibold text-slate-400">{suggestedType}</span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                onClick={() => {
                  if (!text.trim()) return
                  onSubmit({ text: text.trim(), type, saveMode: 'inbox' })
                  setText('')
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
              >
                인박스로 저장
              </button>
              <button
                onClick={() => {
                  if (!text.trim()) return
                  onSubmit({ text: text.trim(), type, saveMode: 'event' })
                  setText('')
                }}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >
                바로 일정으로 저장
              </button>
              <button
                onClick={() => {
                  if (!text.trim()) return
                  onSubmit({ text: text.trim(), type, saveMode: 'memo' })
                  setText('')
                }}
                className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                바로 메모로 저장
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
