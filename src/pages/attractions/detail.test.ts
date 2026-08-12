import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import AttractionDetail from './detail.vue'

const { getAttraction } = vi.hoisted(() => ({ getAttraction: vi.fn() }))
vi.mock('@/api/attractions', () => ({ getAttraction }))

const WdButton = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' })

function mountPage() {
  return mount(AttractionDetail, {
    global: { stubs: { WdButton, WdLoading: true, WdEmpty: { props: ['tip'], template: '<div>{{ tip }}<slot name="bottom" /></div>' }, WdImg: true, WdIcon: true } },
  })
}

describe('attraction detail page', () => {
  it('loads a direct URL and links its published scenic spots', async () => {
    getAttraction.mockResolvedValueOnce({ code: 'qionghai', name: '邛海泸山景区', summary: '山水相依', description: '国家级旅游景区', address: '西昌市', opening_hours: '全天开放', phone: '0834-1234567', ticket_info: '免费', cover: null, scenic_spots: [{ code: 'wetland', name: '邛海湿地', summary: '湖滨湿地' }] })
    const wrapper = mountPage()
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ code: 'qionghai' })
    await flushPromises()

    expect(getAttraction).toHaveBeenCalledWith('qionghai')
    expect(wrapper.text()).toContain('景区内景点')
    await wrapper.get('.related').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/scenic-spots/detail?code=wetland' })
  })

  it('shows the unavailable state for a missing or unpublished detail', async () => {
    getAttraction.mockRejectedValueOnce(Object.assign(new Error('missing'), { statusCode: 404 }))
    const wrapper = mountPage()
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ code: 'offline-area' })
    await flushPromises()
    expect(wrapper.text()).toContain('不存在或已停止展示')
    await wrapper.get('button').trigger('click')
    expect(uni.redirectTo).toHaveBeenCalledWith({ url: '/pages/attractions/index' })
  })
})
