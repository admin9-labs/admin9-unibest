import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import TravelRouteList from './index.vue'

const { getTravelRoutes } = vi.hoisted(() => ({ getTravelRoutes: vi.fn() }))
vi.mock('@/api/travel-routes', () => ({ getTravelRoutes }))

describe('travel route list page', () => {
  it('loads routes and opens a direct detail URL', async () => {
    getTravelRoutes.mockResolvedValueOnce([{ id: 301, name: '邛海一日游', summary: '湖滨行程', duration_minutes: 480, cover: null }])
    const wrapper = mount(TravelRouteList, { global: { stubs: { WdButton: true, WdSearch: true, WdLoading: true, WdEmpty: true, WdImg: true, WdIcon: true } } })
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    expect(wrapper.text()).toContain('建议用时 8小时')
    expect(wrapper.text()).toContain('暂无图片')
    expect(wrapper.text()).not.toContain('慢游西昌')
    expect(wrapper.get('.route').classes()).toContain('route-item')
    await wrapper.get('.route').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/travel-routes/detail?id=301' })
  })
})
