import { Navigate, createBrowserRouter } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { AutomationPage } from '@/pages/automation/ui/AutomationPage'
import { CalendarPage } from '@/pages/calendar/ui/CalendarPage'
import { DashboardPage } from '@/pages/dashboard/ui/DashboardPage'
import { FinancePage } from '@/pages/finance/ui/FinancePage'
import { InboxPage } from '@/pages/inbox/ui/InboxPage'
import { NotesPage } from '@/pages/notes/ui/NotesPage'
import { AppShell } from '@/widgets/layout/ui/AppShell'

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'inbox', element: <InboxPage /> },
      { path: 'finance', element: <FinancePage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'notes', element: <NotesPage /> },
      { path: 'automation', element: <AutomationPage /> },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]

export const appRouter = createBrowserRouter(appRoutes)
