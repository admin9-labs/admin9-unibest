import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Home from './index.vue'

describe('home page', () => {
  it('keeps all ten business entries and their existing routes', async () => {
    const wrapper = mount(Home, {
      global: {
        stubs: {
          WdIcon: true,
          WdImg: { template: '<div><slot /><slot name="loading" /><slot name="error" /></div>' },
          WdLoading: true,
        },
      },
    })

    const expectedRoutes = [
      '/pages/attractions/index',
      '/pages/scenic-spots/index',
      '/pages/articles/index',
      '/pages/travel-routes/index',
      '/pages/audio-guides/index',
      '/pages/restaurants/index',
      '/pages/accommodations/index',
      '/pages/map/index',
      '/pages/public-services/index',
      '/pages/ai-assistants/index',
    ]
    const entries = wrapper.findAll('.home-entry')

    expect(entries).toHaveLength(expectedRoutes.length)
    for (const entry of entries)
      await entry.trigger('click')

    expectedRoutes.forEach((url, index) => {
      expect(uni.navigateTo).toHaveBeenNthCalledWith(index + 1, { url })
    })
    expect(wrapper.text()).toContain('四川 · 西昌')
    expect(wrapper.text()).toContain('发现目的地')
    expect(wrapper.text()).toContain('规划到访')
    expect(wrapper.text()).toContain('在途服务')
    expect(wrapper.text()).not.toContain('旅享西昌')
    expect(wrapper.text()).not.toContain('景区、景点与行程灵感')
    expect(wrapper.findAll('.entry-arrow')).toHaveLength(0)
    expect(wrapper.findAll('.entry-description')).toHaveLength(0)
  })
})
