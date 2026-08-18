import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import PublicContentBody from '@/components/PublicContentBody.vue'
import PublicDetailCover from '@/components/PublicDetailCover.vue'
import PublicDetailHeading from '@/components/PublicDetailHeading.vue'
import TravelRouteDetail from './detail.vue'

const { getTravelRoute } = vi.hoisted(() => ({ getTravelRoute: vi.fn() }))
vi.mock('@/api/travel-routes', () => ({ getTravelRoute }))

describe('travel route detail page', () => {
  it('loads ordered nodes and opens the matching content URL', async () => {
    getTravelRoute.mockResolvedValueOnce({ id: 301, name: '邛海一日游', summary: null, description: '<p>环湖慢游</p>', duration_minutes: 480, cover: null, nodes: [{ node_type: 'scenic_spot', position: 1, stay_minutes: 120, note: '上午游览', target: { id: 201, name: '邛海湿地' } }] })
    const wrapper = mount(TravelRouteDetail, { global: { stubs: { WdButton: true, WdLoading: true, WdEmpty: true, WdImg: true, WdIcon: true, RichText: true } } })
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ id: '301' })
    await flushPromises()
    expect(wrapper.getComponent(PublicDetailCover).props('height')).toBe('420rpx')
    expect(wrapper.getComponent(PublicDetailHeading).props('title')).toBe('邛海一日游')
    expect(wrapper.getComponent(PublicContentBody).props('content')).toBe('<p>环湖慢游</p>')
    expect(wrapper.text()).toContain('8小时')
    expect(wrapper.text()).toContain('邛海湿地')
    await wrapper.get('.node').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/scenic-spots/detail?id=201' })
  })
})
