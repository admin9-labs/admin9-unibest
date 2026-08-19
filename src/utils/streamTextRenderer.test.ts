import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createStreamTextRenderer } from './streamTextRenderer'

describe('stream text renderer', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('reveals bursty stream content over multiple ticks without losing text', async () => {
    let rendered = ''
    const renderer = createStreamTextRenderer(content => rendered += content)

    renderer.push('邛海适合慢慢游览')
    expect(rendered).toBe('')

    await vi.advanceTimersByTimeAsync(24)
    expect(rendered.length).toBeGreaterThan(0)
    expect(rendered).not.toBe('邛海适合慢慢游览')

    const drained = renderer.drain()
    await vi.runAllTimersAsync()
    await drained
    expect(rendered).toBe('邛海适合慢慢游览')
  })

  it('discards queued content after cancellation', async () => {
    let rendered = ''
    const renderer = createStreamTextRenderer(content => rendered += content)

    renderer.push('不会继续显示')
    renderer.cancel()
    await vi.runAllTimersAsync()

    expect(rendered).toBe('')
    await expect(renderer.drain()).resolves.toBeUndefined()
  })
})
