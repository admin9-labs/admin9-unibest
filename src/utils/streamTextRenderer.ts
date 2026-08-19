export interface StreamTextRenderer {
  push: (content: string) => void
  drain: () => Promise<void>
  cancel: () => void
}

const DEFAULT_RENDER_INTERVAL = 24
const DEFAULT_TAIL_DRAIN_DURATION = 600

function splitGraphemes(content: string): string[] {
  if (typeof Intl.Segmenter === 'function') {
    return Array.from(new Intl.Segmenter('zh-CN', { granularity: 'grapheme' }).segment(content), item => item.segment)
  }

  return Array.from(content)
}

export function createStreamTextRenderer(
  onAppend: (content: string) => void,
  interval = DEFAULT_RENDER_INTERVAL,
  tailDrainDuration = DEFAULT_TAIL_DRAIN_DURATION,
): StreamTextRenderer {
  const pending: string[] = []
  const drainResolvers: Array<() => void> = []
  let timer: ReturnType<typeof setTimeout> | null = null
  let cancelled = false
  let drainDeadline: number | null = null

  const resolveDrains = () => {
    while (drainResolvers.length)
      drainResolvers.shift()?.()
  }

  const schedule = () => {
    if (cancelled || timer !== null || pending.length === 0)
      return

    timer = setTimeout(() => {
      timer = null
      if (cancelled)
        return

      const remainingDuration = Math.max(0, (drainDeadline ?? Date.now()) - Date.now())
      const remainingTicks = Math.max(1, Math.ceil(remainingDuration / interval))
      const batchSize = Math.max(1, Math.ceil(pending.length / remainingTicks))
      onAppend(pending.splice(0, batchSize).join(''))
      if (pending.length) {
        schedule()
      }
      else {
        drainDeadline = null
        resolveDrains()
      }
    }, interval)
  }

  return {
    push(content) {
      if (cancelled || !content)
        return
      pending.push(...splitGraphemes(content))
      // Each incoming delta extends the visual tail without changing output order.
      drainDeadline = Date.now() + tailDrainDuration
      schedule()
    },
    drain() {
      if (pending.length === 0 && timer === null)
        return Promise.resolve()
      return new Promise(resolve => drainResolvers.push(resolve))
    },
    cancel() {
      cancelled = true
      pending.length = 0
      drainDeadline = null
      if (timer !== null) {
        clearTimeout(timer)
        timer = null
      }
      resolveDrains()
    },
  }
}
