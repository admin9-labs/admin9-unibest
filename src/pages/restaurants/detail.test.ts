import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import PublicContentBody from '@/components/PublicContentBody.vue'
import RestaurantDetail from './detail.vue'

const { getRestaurant } = vi.hoisted(() => ({ getRestaurant: vi.fn() }))
vi.mock('@/api/restaurants', () => ({ getRestaurant }))
const WdButton = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' })
const WdSwiper = defineComponent({
  emits: ['click'],
  template: '<button class="swiper-preview" @click="$emit(\'click\', { index: 1 })" />',
})

function mountPage() {
  return mount(RestaurantDetail, { global: { stubs: { WdButton, WdLoading: true, WdEmpty: { props: ['tip'], template: '<div>{{ tip }}<slot name="bottom" /></div>' }, WdImg: true, WdIcon: true, WdTag: { template: '<span><slot /></span>' }, WdSwiper, RichText: true } } })
}

describe('restaurant detail page', () => {
  it('supports direct loading, phone, location, and published relations', async () => {
    getRestaurant.mockResolvedValueOnce({ id: 601, name: '西昌火盆烧烤', summary: '本地风味', description: '围炉而坐', category: { id: 61, name: '烧烤' }, address: '西昌市海滨路', latitude: 27.85, longitude: 102.26, coordinate_system: 'GCJ-02', map_eligible: true, map_ineligible_reason: null, cover: null, gallery: [{ url: '/food-1.jpg' }, { url: '/food-2.jpg' }], phone: '0834-1234567', opening_hours: '10:00-22:00', average_price: 68, signature_dishes: ['小猪肉'], attraction: { id: 101, name: '邛海泸山景区' }, scenic_spot: null })
    const previewImage = vi.fn()
    Object.assign(uni, { previewImage })
    const wrapper = mountPage()
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ id: '601' })
    await flushPromises()
    expect(getRestaurant).toHaveBeenCalledWith(601)
    expect(wrapper.get('.detail-category').text()).toBe('烧烤')
    expect(wrapper.getComponent(PublicContentBody).props('content')).toBe('围炉而坐')
    expect(wrapper.text()).toContain('小猪肉')
    await wrapper.findAll('.action')[0].trigger('click')
    expect(uni.makePhoneCall).toHaveBeenCalledWith({ phoneNumber: '0834-1234567' })
    await wrapper.findAll('.action')[1].trigger('click')
    expect(uni.openLocation).toHaveBeenCalledWith({ latitude: 27.85, longitude: 102.26, name: '西昌火盆烧烤', address: '西昌市海滨路' })
    await wrapper.get('.related').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/attractions/detail?id=101' })
    await wrapper.get('.swiper-preview').trigger('click')
    expect(previewImage).toHaveBeenCalledWith({ current: '/food-2.jpg', urls: ['/food-1.jpg', '/food-2.jpg'] })
  })

  it('shows an unavailable state for missing or unpublished records', async () => {
    getRestaurant.mockRejectedValueOnce(Object.assign(new Error('missing'), { statusCode: 404 }))
    const wrapper = mountPage()
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ id: '999' })
    await flushPromises()
    expect(wrapper.text()).toContain('不存在或已停止展示')
    await wrapper.get('button').trigger('click')
    expect(uni.redirectTo).toHaveBeenCalledWith({ url: '/pages/restaurants/index' })
  })
})
