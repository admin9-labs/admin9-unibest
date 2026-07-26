import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useUserStore } from '@/store/user'
import Me from './me.vue'

const { changePassword, getMember, logout, tokenStore } = vi.hoisted(() => ({
  changePassword: vi.fn(),
  getMember: vi.fn(),
  logout: vi.fn(),
  tokenStore: { hasLogin: true, changePassword: vi.fn(), logout: vi.fn() },
}))
tokenStore.changePassword = changePassword
tokenStore.logout = logout
vi.mock('@/api/member', () => ({ getMember }))
vi.mock('@/store/token', () => ({
  useTokenStore: () => tokenStore,
}))
vi.mock('@/router/config', () => ({ LOGIN_PAGE: '/pages/auth/login' }))

const WdInput = defineComponent({
  name: 'WdInput',
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)">',
})
const WdButton = defineComponent({
  name: 'WdButton',
  props: ['loading'],
  emits: ['click'],
  template: '<button :data-loading="String(loading)" @click="$emit(\'click\')"><slot /></button>',
})

function mountPage() {
  useUserStore().setMember({ id: 1, name: 'Member', email: null, mobile: null, is_active: true, last_login_at: null })
  return mount(Me, {
    global: {
      stubs: {
        WdButton,
        WdInput,
        WdForm: { template: '<form><slot /></form>' },
        WdFormItem: { template: '<label><slot /></label>' },
        WdCellGroup: { template: '<section><slot /></section>' },
        WdCell: true,
        WdTag: { template: '<span><slot /></span>' },
      },
    },
  })
}

function mountPageWithoutMember() {
  useUserStore().clearMember()
  return mount(Me, {
    global: {
      stubs: {
        WdButton,
        WdInput,
        WdForm: { template: '<form><slot /></form>' },
        WdFormItem: { template: '<label><slot /></label>' },
        WdCellGroup: { template: '<section><slot /></section>' },
        WdCell: true,
        WdTag: { template: '<span><slot /></span>' },
      },
    },
  })
}

describe('me page expected failures', () => {
  it('shows a retry state instead of login when member loading fails for an active session', async () => {
    tokenStore.hasLogin = true
    getMember.mockRejectedValueOnce(new Error('expected request failure'))
      .mockResolvedValueOnce({ id: 2, name: 'Recovered', email: null, mobile: null, is_active: true, last_login_at: null })
    const wrapper = mountPageWithoutMember()
    const show = vi.mocked(onShow).mock.calls.at(-1)?.[0]
    show?.()
    await flushPromises()

    expect(wrapper.text()).toContain('会员资料暂时无法加载')
    expect(wrapper.text()).not.toContain('登录')

    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Recovered')
  })

  it('clears the invalidated session and returns to login after password change', async () => {
    changePassword.mockResolvedValueOnce(true)
    const wrapper = mountPage()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('old-password')
    await inputs[1].setValue('new-password')
    await inputs[2].setValue('new-password')
    await wrapper.findAll('button')[0].trigger('click')
    await flushPromises()

    expect(changePassword).toHaveBeenCalledTimes(1)
    expect(uni.showToast).toHaveBeenCalledTimes(1)
    expect(uni.showToast).toHaveBeenCalledWith({ icon: 'success', title: '密码已更新，请重新登录' })
    expect(uni.reLaunch).toHaveBeenCalledWith({ url: '/pages/auth/login' })
  })

  it('catches password failure and restores saving state', async () => {
    changePassword.mockRejectedValueOnce(new Error('expected request failure'))
    const wrapper = mountPage()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('old-password')
    await inputs[1].setValue('new-password')
    await inputs[2].setValue('new-password')
    await wrapper.findAll('button')[0].trigger('click')
    await flushPromises()

    expect(changePassword).toHaveBeenCalled()
    expect(wrapper.findAll('button')[0].attributes('data-loading')).toBe('false')
    expect(uni.reLaunch).not.toHaveBeenCalled()
    expect(uni.showToast).not.toHaveBeenCalled()
  })

  it('ignores a stale password success after the identity changes', async () => {
    changePassword.mockResolvedValueOnce(false)
    const wrapper = mountPage()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('old-password')
    await inputs[1].setValue('new-password')
    await inputs[2].setValue('new-password')
    await wrapper.findAll('button')[0].trigger('click')
    await flushPromises()

    expect(uni.showToast).not.toHaveBeenCalled()
    expect(uni.reLaunch).not.toHaveBeenCalled()
  })

  it('catches logout failure after local cleanup without success toast', async () => {
    logout.mockRejectedValueOnce(new Error('expected request failure'))
    vi.mocked(uni.showModal).mockImplementation(({ success }) => {
      success?.({ confirm: true, cancel: false, content: '' })
    })
    const wrapper = mountPage()
    await wrapper.findAll('button')[1].trigger('click')
    await flushPromises()

    expect(logout).toHaveBeenCalledTimes(1)
    expect(uni.showToast).not.toHaveBeenCalled()
  })
})
