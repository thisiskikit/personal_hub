import { cn } from '@/shared/lib/cn'

interface ChatBubbleProps {
  type: 'user' | 'ai'
  text: string
}

export const ChatBubble = ({ type, text }: ChatBubbleProps) => (
  <div className={cn('flex', type === 'user' ? 'justify-end' : 'justify-start')}>
    <div
      className={cn(
        'max-w-[90%] rounded-2xl p-4 text-sm font-medium',
        type === 'user'
          ? 'rounded-tr-sm bg-slate-800 text-white'
          : 'rounded-tl-sm border border-slate-200 bg-white text-slate-700 shadow-sm',
      )}
    >
      <p className="leading-relaxed">{text}</p>
    </div>
  </div>
)
