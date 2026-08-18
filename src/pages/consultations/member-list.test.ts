import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import MemberConsultations from './member-list.vue'

const { getMemberConsultations } = vi.hoisted(() => ({ getMemberConsultations: vi.fn() }))
vi.mock('@/api/consultations', () => ({ getMemberConsultations }))

const WdButton = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' })
const WdTag = defineComponent({ template: '<span><slot /></span>' })

function mountPage() {
  return mount(MemberConsultations, { global: { stubs: { WdButton, WdTag, WdLoading: true, WdIcon: true } } })
}

describe('member consultation list', () => {
  it('uses a flat record flow without repeating the native page title', async () => {
    getMemberConsultations.mockResolvedValueOnce([{
      ticket_no: 'ZX-202608-0021',
      subject: '火把节行程应该提前准备哪些事项',
      status: 'replied',
      created_at: '2026-08-05T11:45:00Z',
    }])
    const wrapper = mountPage()
    await vi.mocked(onShow).mock.calls.at(-1)?.[0]?.()
    await flushPromises()

    expect(wrapper.text()).toContain('1 条记录')
    expect(wrapper.text()).not.toContain('我的咨询')
    expect(wrapper.get('.record').attributes('role')).toBe('link')
    await wrapper.get('.record').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/consultations/member-detail?ticket=ZX-202608-0021' })
  })

  it('keeps retry and initial-empty actions available', async () => {
    getMemberConsultations.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce([])
    const wrapper = mountPage()
    await vi.mocked(onShow).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    expect(wrapper.text()).toContain('咨询记录暂时无法加载')
    await wrapper.get('.public-state button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('暂无咨询记录')
  })
})
