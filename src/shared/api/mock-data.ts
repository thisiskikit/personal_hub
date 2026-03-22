import type { AutomationRule } from '@/entities/automation/model/types'
import type { BudgetItem, FinanceSummary } from '@/entities/finance/model/types'
import type { TimelineItem } from '@/entities/timeline/model/types'

export const financeSummarySeed: FinanceSummary = {
  balance: '1,240,000',
  upcomingPayments: '135,000',
  pendingCount: 3,
  incomeThisMonth: '3,500,000',
  expenseThisMonth: '2,260,000',
}

export const budgetItemsSeed: BudgetItem[] = [
  { label: '운영비', current: 1500000, max: 2000000, color: 'bg-blue-500' },
  { label: '식비/회의비', current: 450000, max: 500000, color: 'bg-amber-500' },
  { label: '소프트웨어 구독', current: 120000, max: 200000, color: 'bg-cyan-500' },
]

export const timelineItemsSeed: TimelineItem[] = [
  {
    id: 1,
    type: 'task',
    title: '주간 업무 보고서 작성',
    time: '10:00 - 11:30',
    status: 'completed',
    desc: '노션 워크스페이스에 이번 주 지표 업데이트 완료',
    date: '2023-09-06',
  },
  {
    id: 2,
    type: 'finance',
    title: '스타벅스 역삼점',
    time: '12:45',
    amount: '-9,500',
    category: '미분류',
    status: 'pending_category',
    location: '서울 강남구 역삼동',
    relatedEvent: '디자인 에이전시 미팅',
    date: '2023-09-06',
  },
  {
    id: 3,
    type: 'event',
    title: '디자인 에이전시 미팅',
    time: '14:00 - 15:00',
    location: 'Zoom',
    status: 'upcoming',
    desc: '신규 앱 랜딩페이지 시안 검토 및 피드백 전달',
    date: '2023-09-06',
  },
  {
    id: 4,
    type: 'memo',
    title: '미팅 아이디어 스케치',
    time: '15:10',
    preview: '다음 주 런칭 프로모션 관련해서 유저 참여형 이벤트 위주로 구상할 것...',
    status: 'saved',
    tags: ['아이디어', '프로모션'],
    date: '2023-09-06',
  },
  {
    id: 5,
    type: 'finance',
    title: '넷플릭스 정기결제',
    time: '18:00 예정',
    amount: '-17,000',
    category: '구독',
    status: 'upcoming',
    desc: '매월 6일 자동 결제',
    date: '2023-09-06',
  },
  {
    id: 6,
    type: 'memo',
    title: '세무사 제출 서류 목록',
    time: '어제',
    preview: '1. 사업자등록증 사본\n2. 법인통장 내역 3개월치\n3. 부가세 신고 자료',
    status: 'saved',
    tags: ['세무', '중요'],
    date: '2023-09-05',
  },
  {
    id: 7,
    type: 'finance',
    title: '위워크 임대료',
    time: '어제',
    amount: '-450,000',
    category: '운영비',
    status: 'completed',
    date: '2023-09-05',
  },
]

export const automationRulesSeed: AutomationRule[] = [
  {
    id: 1,
    trigger: "결제 내역 '스타벅스' 포함",
    action: "'회의비' 태그 추천 및 일정 연동 대기",
    active: true,
  },
  {
    id: 2,
    trigger: '매월 25일 오전 9시',
    action: '급여 이체 리마인드 및 잔고 브리핑 생성',
    active: true,
  },
  {
    id: 3,
    trigger: "새 메모에 '아이디어' 태그 추가 시",
    action: "노션 '아이디어 백로그' DB로 자동 복사",
    active: false,
  },
  {
    id: 4,
    trigger: '예산 소진율 90% 초과 시',
    action: '지출 알림 강도 높임 (Red Status)',
    active: true,
  },
]
