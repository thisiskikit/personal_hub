export interface AutomationRule {
  id: number
  trigger: string
  conditionText?: string | null
  action: string
  category?: string
  status?: 'draft' | 'approved' | 'rejected' | 'live'
  approvalRequired?: boolean
  createdBy?: string
  active: boolean
}
