import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import ComplaintProgressView from './ComplaintProgressView.vue'
import ConsultationProgressView from './ConsultationProgressView.vue'
import PublicState from './PublicState.vue'
import WorkOrderReceipt from './WorkOrderReceipt.vue'

const WdButton = defineComponent({
  emits: ['click'],
  template: '<button @click="$emit(\'click\')"><slot /></button>',
})

const global = { stubs: { WdButton, WdIcon: true, WdLoading: true } }

describe('travel and service presentation components', () => {
  it('keeps state actions explicit and optional', async () => {
    const retry = mount(PublicState, {
      props: { kind: 'network-error', title: '加载失败', description: '请检查网络', actionText: '重新加载' },
      global,
    })
    await retry.get('button').trigger('click')
    expect(retry.emitted('action')).toHaveLength(1)

    const loading = mount(PublicState, { props: { kind: 'loading', title: '正在加载' }, global })
    expect(loading.find('button').exists()).toBe(false)
    expect(loading.text()).toContain('正在加载')
  })

  it('emits receipt copy and view actions without owning routing', async () => {
    const wrapper = mount(WorkOrderReceipt, {
      props: { title: '咨询已提交', ticket: 'ZX-1', credential: 'a'.repeat(64) },
      global,
    })
    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')
    await buttons.at(-1)!.trigger('click')
    expect(wrapper.emitted('copy')?.[0]).toEqual(['ZX-1'])
    expect(wrapper.emitted('view')).toHaveLength(1)
  })

  it('builds consultation milestones only from real timestamps', () => {
    const item = {
      ticket_no: 'ZX-1',
      category: { id: 1, name: '行程咨询' },
      subject: '闭馆时间咨询',
      content: '请问开放时间',
      status: 'closed' as const,
      reply_content: null,
      close_reason: '信息重复',
      accepted_at: null,
      replied_at: null,
      closed_at: '2026-08-16T10:00:00+08:00',
      created_at: '2026-08-16T09:00:00+08:00',
      contact: { name: '游客', mobile: '13800000000', email: null },
    }
    const guest = mount(ConsultationProgressView, { props: { item }, global })
    expect(guest.text()).toContain('当前进度')
    expect(guest.text()).toContain('已提交')
    expect(guest.text()).toContain('已关闭')
    expect(guest.text()).not.toContain('已受理')
    expect(guest.text()).not.toContain('已回复')
    expect(guest.text()).not.toContain('13800000000')

    const member = mount(ConsultationProgressView, { props: { item, member: true }, global })
    expect(member.text()).toContain('13800000000')
  })

  it('builds complaint milestones without inventing a skipped resolution', () => {
    const item = {
      ticket_no: 'TS-1',
      category: { id: 2, name: '服务投诉' },
      target_type: null,
      target_name: '游客中心',
      title: '服务反馈',
      content: '现场说明不清楚',
      status: 'closed' as const,
      resolution_content: null,
      close_reason: '已撤回',
      accepted_at: null,
      resolved_at: null,
      closed_at: '2026-08-16T10:00:00+08:00',
      created_at: '2026-08-16T09:00:00+08:00',
      evidence: [],
      contact: null,
    }
    const wrapper = mount(ComplaintProgressView, { props: { item }, global })
    expect(wrapper.text()).toContain('当前进度')
    expect(wrapper.text()).toContain('已提交')
    expect(wrapper.text()).toContain('已关闭')
    expect(wrapper.text()).not.toContain('已受理')
    expect(wrapper.text()).not.toContain('已处理')
  })
})
