import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import RestaurantList from './index.vue'

const { getRestaurants } = vi.hoisted(() => ({ getRestaurants: vi.fn() }))
vi.mock('@/api/restaurants', () => ({ getRestaurants }))
const WdButton = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' })
const WdTag = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' })

function mountPage() {
  return mount(RestaurantList, { global: { stubs: { WdButton, WdSearch: { template: '<input>' }, WdLoading: true, WdEmpty: { props: ['tip'], template: '<div>{{ tip }}<slot name="bottom" /></div>' }, WdImg: true, WdIcon: true, WdTag, ScrollView: { template: '<div><slot /></div>' } } } })
}

describe('restaurant list page', () => {
  it('loads restaurants and opens an independent detail URL', async () => {
    getRestaurants.mockResolvedValueOnce([{ id: 601, name: '西昌火盆烧烤', summary: '本地风味', address: '西昌市', average_price: 68, category: { id: 61, name: '烧烤' }, cover: null }])
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    expect(wrapper.text()).toContain('西昌火盆烧烤')
    expect(wrapper.text()).toContain('烧烤')
    expect(wrapper.text()).toContain('人均约 ¥68')
    expect(wrapper.text()).toContain('全部')
    expect(wrapper.text()).not.toContain('尝一口西昌')
    await wrapper.get('.restaurant').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/restaurants/detail?id=601' })
  })

  it('filters loaded restaurants locally and restores all results', async () => {
    getRestaurants.mockResolvedValueOnce([
      { id: 601, name: '西昌火盆烧烤', summary: '本地风味', address: '西昌市', average_price: 68, category: { id: 61, name: '烧烤' }, cover: null },
      { id: 602, name: '会理羊肉米粉', summary: '鲜香热汤', address: '月城广场', average_price: 18, category: { id: 62, name: '米粉' }, cover: null },
    ])
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()

    const tags = wrapper.findAll('.filter-tag')
    expect(tags.map(tag => tag.text())).toEqual(['全部', '烧烤', '米粉'])
    await tags[1].trigger('click')
    expect(wrapper.text()).toContain('西昌火盆烧烤')
    expect(wrapper.text()).not.toContain('会理羊肉米粉')
    expect(getRestaurants).toHaveBeenCalledTimes(1)

    await wrapper.findAll('.filter-tag')[0].trigger('click')
    expect(wrapper.text()).toContain('会理羊肉米粉')
  })

  it('shows retryable error and empty states', async () => {
    getRestaurants.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce([])
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    expect(wrapper.text()).toContain('餐饮信息暂时无法加载')
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('暂无符合条件的餐厅')
  })
})
