import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import TravelRouteList from './index.vue'

const { getTravelRoutes } = vi.hoisted(() => ({ getTravelRoutes: vi.fn() }))
vi.mock('@/api/travel-routes', () => ({ getTravelRoutes }))

describe('travel route list page', () => {
  it('loads routes and opens a direct detail URL', async () => {
    getTravelRoutes.mockResolvedValueOnce([{ code: 'lake-day', name: '邛海一日游', summary: '湖滨行程', duration_minutes: 480, cover: null }])
    const wrapper = mount(TravelRouteList, { global: { stubs: { WdButton: true, WdSearch: true, WdLoading: true, WdEmpty: true, WdImg: true, WdIcon: true } } })
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    expect(wrapper.text()).toContain('8小时')
    await wrapper.get('.route').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/travel-routes/detail?code=lake-day' })
  })
})
