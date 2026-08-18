import type { Plugin } from 'vite'

export function h5HistoryRouterDefine(platform: string | undefined) {
  return platform === 'h5'
    ? { __UNI_FEATURE_ROUTER_MODE__: JSON.stringify('history') }
    : {}
}

export function h5HistoryRouterPlugin(platform: string | undefined): Plugin {
  return {
    name: 'h5-history-router',
    enforce: 'post',
    config() {
      const define = h5HistoryRouterDefine(platform)
      return Object.keys(define).length ? { define } : undefined
    },
  }
}
