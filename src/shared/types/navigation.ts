export type ActiveMenu = 'dashboard' | 'finance' | 'calendar' | 'notes' | 'automation'

export const ROUTE_TO_MENU: Record<string, ActiveMenu> = {
  '/dashboard': 'dashboard',
  '/finance': 'finance',
  '/calendar': 'calendar',
  '/notes': 'notes',
  '/automation': 'automation',
}

export const MENU_TO_ROUTE: Record<ActiveMenu, string> = {
  dashboard: '/dashboard',
  finance: '/finance',
  calendar: '/calendar',
  notes: '/notes',
  automation: '/automation',
}

export const MENU_TITLE: Record<ActiveMenu, string> = {
  dashboard: '오늘 대시보드',
  finance: '재무 장부',
  calendar: '통합 일정',
  notes: '메모 및 지식',
  automation: '에이전트 룰 설정',
}
