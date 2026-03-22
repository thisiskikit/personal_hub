export interface FinanceSummary {
  balance: string
  upcomingPayments: string
  pendingCount: number
  incomeThisMonth: string
  expenseThisMonth: string
}

export interface BudgetItem {
  label: string
  current: number
  max: number
  color: string
}
