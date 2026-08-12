import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import RestaurantDetail from './detail.vue'

const { getRestaurant } = vi.hoisted(() => ({ getRestaurant: vi.fn() }))
vi.mock('@/api/restaurants', () => ({ getRestaurant }))
const WdButton = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' })

function mountPage() {
  return mount(RestaurantDetail, { global: { stubs: { WdButton, WdLoading: true, WdEmpty: { props: ['tip'], template: '<div>{{ tip }}<slot name="bottom" /></div>' }, WdImg: true, WdIcon: true, WdTag: { template: '<span><slot /></span>' }, WdSwiper: true } } })
}

describe('restaurant detail page', () => {
  it('supports direct loading, phone, location, and published relations', async () => {
    getRestaurant.mockResolvedValueOnce({ code: 'xichang-bbq', name: '西昌火盆烧烤', summary: '本地风味', description: '围炉而坐', category: { code: 'barbecue', name: '烧烤' }, address: '西昌市海滨路', latitude: 27.85, longitude: 102.26, cover: null, gallery: [], phone: '0834-1234567', opening_hours: '10:00-22:00', average_price: 68, signature_dishes: ['小猪肉'], attraction: { code: 'qionghai', name: '邛海泸山景区' }, scenic_spot: null })
    const wrapper = mountPage()
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ code: 'xichang-bbq' })
    await flushPromises()
    expect(getRestaurant).toHaveBeenCalledWith('xichang-bbq')
    expect(wrapper.text()).toContain('小猪肉')
    await wrapper.findAll('.action')[0].trigger('click')
    expect(uni.makePhoneCall).toHaveBeenCalledWith({ phoneNumber: '0834-1234567' })
    await wrapper.findAll('.action')[1].trigger('click')
    expect(uni.openLocation).toHaveBeenCalledWith({ latitude: 27.85, longitude: 102.26, name: '西昌火盆烧烤', address: '西昌市海滨路' })
    await wrapper.get('.related').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/attractions/detail?code=qionghai' })
  })

  it('shows an unavailable state for missing or unpublished records', async () => {
    getRestaurant.mockRejectedValueOnce(Object.assign(new Error('missing'), { statusCode: 404 }))
    const wrapper = mountPage()
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ code: 'offline' })
    await flushPromises()
    expect(wrapper.text()).toContain('不存在或已停止展示')
    await wrapper.get('button').trigger('click')
    expect(uni.redirectTo).toHaveBeenCalledWith({ url: '/pages/restaurants/index' })
  })
})
