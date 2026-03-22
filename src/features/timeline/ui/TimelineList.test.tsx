import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { TimelineItem } from '@/entities/timeline/model/types'
import { TimelineList } from '@/features/timeline/ui/TimelineList'

const items: TimelineItem[] = [
  {
    id: 2,
    type: 'finance',
    title: '스타벅스 역삼점',
    time: '12:45',
    amount: '-9,500',
    category: '미분류',
    status: 'pending_category',
    date: '2023-09-06',
  },
]

describe('TimelineList', () => {
  it('calls assign category when quick action button is clicked', async () => {
    const user = userEvent.setup()
    const onAssignCategory = vi.fn()

    render(
      <TimelineList
        items={items}
        selectedItemId={2}
        density="comfortable"
        onSelect={vi.fn()}
        onAssignCategory={onAssignCategory}
      />,
    )

    await user.click(screen.getByRole('button', { name: '회의비' }))

    expect(onAssignCategory).toHaveBeenCalledWith(2, '회의비')
  })
})
