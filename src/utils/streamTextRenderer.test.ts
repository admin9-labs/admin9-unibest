import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createStreamTextRenderer } from './streamTextRenderer'

describe('stream text renderer', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('reveals bursty stream content over multiple ticks without losing text', async () => {
    let rendered = ''
    const states: string[] = []
    const observedRenderer = createStreamTextRenderer((content) => {
      rendered += content
      states.push(rendered)
    })

    observedRenderer.push('邛海适合慢慢游览，适合在清晨和傍晚沿湖慢行。')
    expect(rendered).toBe('')

    await vi.advanceTimersByTimeAsync(72)
    expect(rendered.length).toBeGreaterThan(0)
    expect(rendered).not.toBe('邛海适合慢慢游览，适合在清晨和傍晚沿湖慢行。')
    expect(states).toHaveLength(3)

    const drained = observedRenderer.drain()
    await vi.runAllTimersAsync()
    await drained
    expect(rendered).toBe('邛海适合慢慢游览，适合在清晨和傍晚沿湖慢行。')
  })

  it('uses the final delta deadline while preserving Unicode graphemes', async () => {
    const chunks: string[] = []
    const renderer = createStreamTextRenderer(content => chunks.push(content))
    const answer = '🌄👨‍👩‍👧‍👦a\u0301西昌邛海'

    renderer.push(answer)
    await vi.advanceTimersByTimeAsync(24)
    expect(chunks[0]).toBe('🌄')

    await vi.advanceTimersByTimeAsync(24)
    renderer.push('，傍晚适合散步。')
    const drained = renderer.drain()
    await vi.advanceTimersByTimeAsync(600)
    await drained

    expect(chunks.join('')).toBe(`${answer}，傍晚适合散步。`)
  })

  it('settles a large final burst within the visual tail duration', async () => {
    let rendered = ''
    const renderer = createStreamTextRenderer(content => rendered += content)
    const answer = '西昌文旅信息'.repeat(120)

    renderer.push(answer)
    await vi.advanceTimersByTimeAsync(48)
    expect(rendered.length).toBeGreaterThan(0)
    expect(rendered.length).toBeLessThan(answer.length)

    const drained = renderer.drain()
    await vi.advanceTimersByTimeAsync(552)
    await drained
    expect(rendered).toBe(answer)
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
