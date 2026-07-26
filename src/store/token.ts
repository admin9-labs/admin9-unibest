import type { LoginCredentials } from '@/api/member'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { changePassword as changeMemberPassword, login as loginMember, logout as logoutMember } from '@/api/member'
import {
  beginSessionTransition,
  clearSession,
  clearSessionIfGenerationCurrent,
  establishSession,
  getSessionGeneration,
  getSessionIdentity,
  hydrateSession,
  isSessionGenerationCurrent,
  onSessionChanged,
} from '@/http/session'
import { useUserStore } from './user'

export const useTokenStore = defineStore('token', () => {
  const hydratedSession = hydrateSession()
  const session = ref(hydratedSession)
  const hasLogin = computed(() => !!session.value?.accessToken)

  function clearLocalSession(expectedGeneration?: number) {
    if (expectedGeneration !== undefined)
      return clearSessionIfGenerationCurrent(expectedGeneration)
    clearSession()
    return true
  }

  onSessionChanged((value) => {
    session.value = value
    if (!value)
      useUserStore().clearMember()
  })

  if (!hydratedSession)
    useUserStore().clearMember()

  async function login(credentials: LoginCredentials) {
    const loginGeneration = beginSessionTransition()
    let result: Awaited<ReturnType<typeof loginMember>>
    try {
      result = await loginMember(credentials, true)
    }
    catch (error) {
      if (isSessionGenerationCurrent(loginGeneration))
        uni.showToast({ icon: 'none', title: (error as Error).message })
      throw error
    }
    const established = establishSession(result.access_token, result.expires_in, loginGeneration)
    if (!established)
      throw new Error('A newer session transition replaced this login')
    useUserStore().setMember(result.member, established.identity.generation)
    return result
  }

  async function logout() {
    const identity = getSessionIdentity()
    if (!identity) {
      clearLocalSession()
      return true
    }
    const logoutGeneration = beginSessionTransition()
    try {
      await logoutMember(identity.accessToken)
      return isSessionGenerationCurrent(logoutGeneration)
    }
    catch (error) {
      if (!isSessionGenerationCurrent(logoutGeneration))
        return false
      throw error
    }
  }

  async function changePassword(password: Parameters<typeof changeMemberPassword>[0]) {
    const generation = getSessionGeneration()
    await changeMemberPassword(password)
    return clearLocalSession(generation)
  }

  return { session, hasLogin, login, logout, changePassword, clearLocalSession }
})
