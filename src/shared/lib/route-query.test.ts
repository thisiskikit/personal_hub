import { describe, expect, it } from 'vitest'
import { parseUiQueryState, serializeUiQueryState } from '@/shared/lib/route-query'

describe('route-query', () => {
  it('falls back when query values are invalid', () => {
    const params = new URLSearchParams('item=-1&filter=unknown&tab=none&density=wide')
    const parsed = parseUiQueryState(params)

    expect(parsed.item).toBe(2)
    expect(parsed.filter).toBe('all')
    expect(parsed.tab).toBe('ai')
    expect(parsed.density).toBe('comfortable')
  })

  it('serializes patched state and removes defaults', () => {
    const next = serializeUiQueryState(new URLSearchParams('item=99&tab=chat'), {
      item: 2,
      filter: 'finance',
      density: 'compact',
      tab: 'details',
    })

    expect(next.get('item')).toBeNull()
    expect(next.get('tab')).toBe('details')
    expect(next.get('filter')).toBe('finance')
    expect(next.get('density')).toBe('compact')
  })

  it('keeps settings tab when provided', () => {
    const params = new URLSearchParams('tab=settings')
    const parsed = parseUiQueryState(params)

    expect(parsed.tab).toBe('settings')
  })
})
