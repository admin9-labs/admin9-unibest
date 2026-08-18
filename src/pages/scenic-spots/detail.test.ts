import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import PublicContentBody from '@/components/PublicContentBody.vue'
import PublicDetailCover from '@/components/PublicDetailCover.vue'
import PublicDetailHeading from '@/components/PublicDetailHeading.vue'
import ScenicSpotDetail from './detail.vue'

const { getScenicSpot } = vi.hoisted(() => ({ getScenicSpot: vi.fn() }))
vi.mock('@/api/scenic-spots', () => ({ getScenicSpot }))

const WdButton = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' })

function mountPage() {
  return mount(ScenicSpotDetail, {
    global: {
      stubs: {
        WdButton,
        WdLoading: { template: '<div>正在加载景点详情</div>' },
        WdEmpty: { props: ['tip'], template: '<div>{{ tip }}<slot name="bottom" /></div>' },
        WdImg: true,
        WdIcon: true,
        RichText: true,
      },
    },
  })
}

describe('scenic spot detail page', () => {
  it('loads directly from the URL id and exposes contact action', async () => {
    getScenicSpot.mockResolvedValueOnce({ id: 201, name: '建昌古城', summary: '古城街巷', description: '历史文化街区', address: '西昌市', opening_hours: '全天开放', phone: '0834-1234567', cover: null })
    const wrapper = mountPage()
    const load = vi.mocked(onLoad).mock.calls.at(-1)?.[0]
    load?.({ id: '201' })
    await flushPromises()

    expect(getScenicSpot).toHaveBeenCalledWith(201)
    expect(wrapper.getComponent(PublicDetailCover).props('src')).toBe('')
    expect(wrapper.getComponent(PublicDetailHeading).props()).toMatchObject({ title: '建昌古城', summary: '古城街巷' })
    expect(wrapper.getComponent(PublicContentBody).props('content')).toBe('历史文化街区')
    expect(wrapper.text()).toContain('建昌古城')
    await wrapper.get('.visit-info__row--action button').trigger('click')
    expect(uni.makePhoneCall).toHaveBeenCalledWith({ phoneNumber: '0834-1234567' })
  })

  it('shows the unavailable state for a missing or unpublished detail', async () => {
    getScenicSpot.mockRejectedValueOnce(Object.assign(new Error('missing'), { statusCode: 404 }))
    const wrapper = mountPage()
    const load = vi.mocked(onLoad).mock.calls.at(-1)?.[0]
    load?.({ id: '999' })
    await flushPromises()

    expect(wrapper.text()).toContain('不存在或已停止展示')
    await wrapper.get('button').trigger('click')
    expect(uni.redirectTo).toHaveBeenCalledWith({ url: '/pages/scenic-spots/index' })
  })
})
