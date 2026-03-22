import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from '@/shared/ui/StatusBadge'

describe('StatusBadge', () => {
  it('shows translated labels', () => {
    render(
      <div>
        <StatusBadge status="completed" />
        <StatusBadge status="pending_category" />
      </div>,
    )

    expect(screen.getByText('완료')).toBeInTheDocument()
    expect(screen.getByText('검토 필요')).toBeInTheDocument()
  })
})
