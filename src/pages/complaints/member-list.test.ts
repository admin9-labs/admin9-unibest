import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import MemberComplaints from './member-list.vue'

const { getMemberComplaints } = vi.hoisted(() => ({ getMemberComplaints: vi.fn() }))
vi.mock('@/api/complaints', () => ({ getMemberComplaints }))

const WdButton = defineComponent({ emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' })
const WdTag = defineComponent({ template: '<span><slot /></span>' })

function mountPage() {
  return mount(MemberComplaints, { global: { stubs: { WdButton, WdTag, WdLoading: true, WdIcon: true } } })
}

describe('member complaint list', () => {
  it('uses a flat record flow without repeating the native page title', async () => {
    getMemberComplaints.mockResolvedValueOnce([{
      ticket_no: 'TS-202608-0013',
      title: '外围停车场离场指引不明确',
      target_name: '建昌古城外围停车区',
      status: 'pending',
      created_at: '2026-08-01T09:39:00Z',
    }])
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()

    expect(wrapper.text()).toContain('1 条记录')
    expect(wrapper.text()).not.toContain('我的投诉')
    expect(wrapper.text()).not.toContain('仅显示当前会员本人提交的记录')
    await wrapper.get('.record').trigger('click')
    expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/complaints/member-detail?ticket=TS-202608-0013' })
  })

  it('keeps retry and initial-empty actions available', async () => {
    getMemberComplaints.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce([])
    const wrapper = mountPage()
    await vi.mocked(onLoad).mock.calls.at(-1)?.[0]?.()
    await flushPromises()
    expect(wrapper.text()).toContain('投诉记录暂时无法加载')
    await wrapper.get('.public-state button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('暂无投诉记录')
  })
})
