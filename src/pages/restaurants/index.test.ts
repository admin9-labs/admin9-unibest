import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import RestaurantList from './index.vue'

const { getRestaurants } = vi.hoisted(() => ({ getRestaurants: vi.fn() }))
vi.mock('@/api/restaurants', () => ({ getRestaurants }))
const WdButton = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' })

function mountPage() {
  return mount(RestaurantList, { global: { stubs: { WdButton, WdSearch: { template: '<input>' }, WdLoading: true, WdEmpty: { props: ['tip'], template: '<div>{{ tip }}<slot name="bottom" /></div>' }, WdImg: true, WdIcon: true, WdTag: { template: '<span><slot /></span>' }, ScrollView: { template: '<div><slot /></div>' } } } })
}

describe('restaurant list page', () => {
  it('loads restaurants and opens an independent detail URL', async () => {
    getRestaurants.mockResolvedValueOnce([{ code: 'xichang-bbq', name: '西昌火盆烧烤', summary: '本地风味', address: '西昌市', average_price: 68, category: { code: 'barbecue', name: '烧烤' }, cover: null }])
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    expect(wrapper.text()).toContain('西昌火盆烧烤')
    expect(wrapper.text()).toContain('人均约 ¥68')
    await wrapper.get('.restaurant').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/restaurants/detail?code=xichang-bbq' })
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
