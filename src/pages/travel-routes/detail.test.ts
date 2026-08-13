import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import PublicContentBody from '@/components/PublicContentBody.vue'
import TravelRouteDetail from './detail.vue'

const { getTravelRoute } = vi.hoisted(() => ({ getTravelRoute: vi.fn() }))
vi.mock('@/api/travel-routes', () => ({ getTravelRoute }))

describe('travel route detail page', () => {
  it('loads ordered nodes and opens the matching content URL', async () => {
    getTravelRoute.mockResolvedValueOnce({ code: 'lake-day', name: '邛海一日游', summary: null, description: '<p>环湖慢游</p>', duration_minutes: 480, cover: null, nodes: [{ node_type: 'scenic_spot', position: 1, stay_minutes: 120, note: '上午游览', target: { code: 'wetland', name: '邛海湿地' } }] })
    const wrapper = mount(TravelRouteDetail, { global: { stubs: { WdButton: true, WdLoading: true, WdEmpty: true, WdImg: true, WdIcon: true, RichText: true } } })
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ code: 'lake-day' })
    await flushPromises()
    expect(wrapper.getComponent(PublicContentBody).props('content')).toBe('<p>环湖慢游</p>')
    expect(wrapper.text()).toContain('邛海湿地')
    await wrapper.get('.node').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/scenic-spots/detail?code=wetland' })
  })
})
