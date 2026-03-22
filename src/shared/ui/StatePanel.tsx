import { AlertCircle, LoaderCircle } from 'lucide-react'

interface StatePanelProps {
  type: 'loading' | 'error' | 'empty'
  title: string
  description: string
}

export const StatePanel = ({ type, title, description }: StatePanelProps) => (
  <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
    <div className="mb-3 flex justify-center">
      {type === 'loading' ? (
        <LoaderCircle className="size-5 animate-spin text-slate-400" />
      ) : (
        <AlertCircle className="size-5 text-slate-400" />
      )}
    </div>
    <h3 className="mb-1 text-sm font-bold text-slate-800">{title}</h3>
    <p className="text-sm text-slate-500">{description}</p>
  </div>
)
