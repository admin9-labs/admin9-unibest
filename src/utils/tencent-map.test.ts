import { afterEach, describe, expect, it } from 'vitest'
import { createTencentRouteUrl, loadTencentMap } from './tencent-map'

afterEach(() => {
  delete window.TMap
  document.querySelector('#xichang-tencent-map-sdk')?.remove()
})

describe('tencent map integration', () => {
  it('rejects a missing browser key without creating a script', async () => {
    await expect(loadTencentMap('')).rejects.toThrow('not configured')
    expect(document.querySelector('#xichang-tencent-map-sdk')).toBeNull()
  })

  it('builds a Tencent route URL without a credential', () => {
    const url = createTencentRouteUrl({ name: '邛海湿', address: '海滨路', latitude: 27.86, longitude: 102.27 })
    expect(url).toContain('apis.map.qq.com/uri/v1/routeplan')
    expect(url).toContain('tocoord=27.86,102.27')
    expect(url).not.toContain('key=')
  })
})
