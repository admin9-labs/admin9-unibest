import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import ServiceDetail from './detail.vue'

const mocks = vi.hoisted(() => ({ getServiceInformationDetail: vi.fn(), openExternalLink: vi.fn() }))
vi.mock('@/api/service-information', () => ({ getServiceInformationDetail: mocks.getServiceInformationDetail }))
vi.mock('@/utils/external-link', () => ({ openExternalLink: mocks.openExternalLink }))
const WdButton = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\', $event)"><slot /></button>' })
function mountPage() {
  return mount(ServiceDetail, { global: { stubs: { WdButton, WdLoading: true, WdEmpty: { props: ['tip'], template: '<div>{{ tip }}<slot name="bottom" /></div>' }, WdImg: true, WdIcon: true, WdTag: { template: '<span><slot /></span>' } } } })
}

describe('service information detail page', () => {
  it('shows plain text details and connects phone, location and safe attachments', async () => {
    mocks.getServiceInformationDetail.mockResolvedValueOnce({ code: 'visitor-center', title: '邛海游客服务', type: { code: 'visitor-center', name: '游客中心' }, provider: '旅享西昌', service_area: '邛海', summary: '便民协助', content: '<script>alert(1)</script>', address: '海滨路', latitude: 27.86, longitude: 102.27, phone: '0834-000101', service_hours: '09:00-17:30', cover: null, attachments: [{ name: '服务指南', url: 'https://example.com/guide' }] })
    const wrapper = mountPage()
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ code: 'visitor-center' })
    await flushPromises()
    expect(wrapper.text()).toContain('<script>alert(1)</script>')
    expect(wrapper.find('script').exists()).toBe(false)
    await wrapper.find('.fact.action').trigger('click')
    expect(uni.makePhoneCall).toHaveBeenCalledWith({ phoneNumber: '0834-000101' })
    await wrapper.findAll('.fact.action')[1].trigger('click')
    expect(uni.openLocation).toHaveBeenCalledWith({ latitude: 27.86, longitude: 102.27, name: '邛海游客服务', address: '海滨路' })
    await wrapper.get('.attachment').trigger('click')
    expect(mocks.openExternalLink).toHaveBeenCalledWith('https://example.com/guide')
  })

  it('handles missing and retryable details', async () => {
    mocks.getServiceInformationDetail.mockRejectedValueOnce({ statusCode: 404 })
    const wrapper = mountPage()
    vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.({ code: 'missing' })
    await flushPromises()
    expect(wrapper.text()).toContain('不存在或已停止展示')
  })
})
