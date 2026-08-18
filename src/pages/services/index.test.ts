import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import ServiceList from './index.vue'

const { getServiceInformation } = vi.hoisted(() => ({ getServiceInformation: vi.fn() }))
vi.mock('@/api/service-information', () => ({ getServiceInformation }))
const WdButton = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\', $event)"><slot /></button>' })
const WdTag = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' })
function mountPage() {
  return mount(ServiceList, { global: { stubs: { WdButton, WdSearch: { template: '<input>' }, WdLoading: true, WdEmpty: { props: ['tip'], template: '<div>{{ tip }}<slot name="bottom" /></div>' }, WdImg: true, WdIcon: true, WdTag, ScrollView: { template: '<div><slot /></div>' } } } })
}

describe('service information list page', () => {
  it('loads published services and opens an independent detail URL', async () => {
    getServiceInformation.mockResolvedValueOnce([{ id: 801, title: '邛海游客服务', type: { id: 81, name: '游客中心' }, service_area: '邛海泸山', summary: '咨询与便民协助', cover: null }])
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    expect(wrapper.text()).toContain('邛海游客服务')
    expect(wrapper.text()).toContain('游客中心')
    expect(wrapper.text()).toContain('全部')
    expect(wrapper.text()).not.toContain('找到需要的服务')
    await wrapper.get('.service').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/services/detail?id=801' })
  })

  it('filters loaded services locally and restores all results', async () => {
    getServiceInformation.mockResolvedValueOnce([
      { id: 801, title: '邛海游客服务', type: { id: 81, name: '游客中心' }, service_area: '邛海泸山', summary: '咨询与便民协助', cover: null },
      { id: 802, title: '月城交通服务', type: { id: 82, name: '交通服务' }, service_area: '建昌古城', summary: '公共交通信息', cover: null },
    ])
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()

    const tags = wrapper.findAll('.filter-tag')
    expect(tags.map(tag => tag.text())).toEqual(['全部', '游客中心', '交通服务'])
    await tags[1].trigger('click')
    expect(wrapper.text()).toContain('邛海游客服务')
    expect(wrapper.text()).not.toContain('月城交通服务')
    expect(getServiceInformation).toHaveBeenCalledTimes(1)

    await wrapper.findAll('.filter-tag')[0].trigger('click')
    expect(wrapper.text()).toContain('月城交通服务')
  })

  it('shows retryable error and empty states', async () => {
    getServiceInformation.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce([])
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    expect(wrapper.text()).toContain('服务信息暂时无法加载')
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('暂无符合条件的服务信息')
  })
})
