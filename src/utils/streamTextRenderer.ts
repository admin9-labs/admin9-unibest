export interface StreamTextRenderer {
  push: (content: string) => void
  drain: () => Promise<void>
  cancel: () => void
}

export function createStreamTextRenderer(onAppend: (content: string) => void, interval = 24): StreamTextRenderer {
  const pending: string[] = []
  const drainResolvers: Array<() => void> = []
  let timer: ReturnType<typeof setTimeout> | null = null
  let cancelled = false

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

      const batchSize = Math.max(1, Math.ceil(pending.length / 24))
      onAppend(pending.splice(0, batchSize).join(''))
      if (pending.length)
        schedule()
      else
        resolveDrains()
    }, interval)
  }

  return {
    push(content) {
      if (cancelled || !content)
        return
      pending.push(...Array.from(content))
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
      if (timer !== null) {
        clearTimeout(timer)
        timer = null
      }
      resolveDrains()
    },
  }
}
