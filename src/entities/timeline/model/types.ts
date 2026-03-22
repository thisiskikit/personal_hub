export type TimelineType = 'task' | 'finance' | 'event' | 'memo'

export type TimelineStatus = 'completed' | 'pending_category' | 'upcoming' | 'saved'

export interface TimelineItemBase {
  id: number
  type: TimelineType
  title: string
  time: string
  status: TimelineStatus
  date: string
}

export interface TaskTimelineItem extends TimelineItemBase {
  type: 'task'
  desc?: string
}

export interface FinanceTimelineItem extends TimelineItemBase {
  type: 'finance'
  amount: string
  category: string
  location?: string
  relatedEvent?: string
  desc?: string
}

export interface EventTimelineItem extends TimelineItemBase {
  type: 'event'
  location?: string
  desc?: string
}

export interface MemoTimelineItem extends TimelineItemBase {
  type: 'memo'
  preview: string
  tags?: string[]
}

export type TimelineItem =
  | TaskTimelineItem
  | FinanceTimelineItem
  | EventTimelineItem
  | MemoTimelineItem

export type TimelineFilter = 'all' | TimelineType
