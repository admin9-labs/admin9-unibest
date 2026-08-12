import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import AttractionList from './index.vue'

const { getAttractions } = vi.hoisted(() => ({ getAttractions: vi.fn() }))
vi.mock('@/api/attractions', () => ({ getAttractions }))

const WdButton = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' })

function mountPage() {
  return mount(AttractionList, {
    global: { stubs: { WdButton, WdSearch: { template: '<input>' }, WdLoading: true, WdEmpty: { props: ['tip'], template: '<div>{{ tip }}<slot name="bottom" /></div>' }, WdImg: true, WdIcon: true } },
  })
}

describe('attraction list page', () => {
  it('loads attractions and opens an independent detail URL', async () => {
    getAttractions.mockResolvedValueOnce([{ code: 'qionghai', name: '邛海泸山景区', summary: '山水相依', address: '西昌市', cover: null }])
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()

    expect(wrapper.text()).toContain('邛海泸山景区')
    await wrapper.get('.item').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/attractions/detail?code=qionghai' })
  })

  it('shows empty and retryable error states', async () => {
    getAttractions.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce([])
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    expect(wrapper.text()).toContain('景区信息暂时无法加载')
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('暂无符合条件的景区')
  })
})
