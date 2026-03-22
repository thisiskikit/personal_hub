import { Bot } from 'lucide-react'
import { AutomationRuleList } from '@/features/automation-rule/ui/AutomationRuleList'
import { StatePanel } from '@/shared/ui'
import { useAppShellContext } from '@/widgets/layout/ui/useAppShellContext'

export const AutomationPage = () => {
  const { automationRules, onToggleRule, isLoading, hasError } = useAppShellContext()

  if (hasError) {
    return (
      <StatePanel
        type="error"
        title="자동화 규칙을 불러오지 못했습니다"
        description="잠시 후 다시 시도해 주세요."
      />
    )
  }

  if (isLoading) {
    return (
      <StatePanel
        type="loading"
        title="자동화 규칙 로딩 중"
        description="규칙 정보를 불러오고 있습니다."
      />
    )
  }

  return (
    <>
      <div className="mb-8 rounded-xl bg-gradient-to-r from-indigo-900 to-cyan-900 p-6 text-white shadow-lg">
        <h2 className="mb-2 flex items-center text-xl font-bold">
          <Bot size={24} className="mr-3 text-indigo-300" />
          AI 에이전트 동작 설정
        </h2>
        <p className="max-w-2xl text-sm font-medium leading-relaxed text-indigo-200">
          에이전트가 백그라운드에서 데이터를 모니터링하고 자동으로 실행할 규칙을 정의합니다.
          자연어로 새로운 규칙을 요청하면 AI가 설정해 줍니다.
        </p>
      </div>

      {automationRules.length ? (
        <AutomationRuleList rules={automationRules} onToggle={onToggleRule} />
      ) : (
        <StatePanel
          type="empty"
          title="등록된 규칙이 없습니다"
          description="새 규칙을 추가해 주세요."
        />
      )}
    </>
  )
}
