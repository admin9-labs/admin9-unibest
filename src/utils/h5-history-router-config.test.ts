import { describe, expect, it } from 'vitest'
import h5HistoryRouterSource from '../../vite-plugins/h5-history-router.ts?raw'

describe('h5 history router build configuration', () => {
  it('forces the compile-time router mode after uni-app config only for H5', () => {
    expect(h5HistoryRouterSource).toContain('platform === \'h5\'')
    expect(h5HistoryRouterSource).toContain('__UNI_FEATURE_ROUTER_MODE__: JSON.stringify(\'history\')')
    expect(h5HistoryRouterSource).toContain('enforce: \'post\'')
  })
})
