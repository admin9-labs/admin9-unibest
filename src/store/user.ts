import type { Member } from '@/api/member'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMember } from '@/api/member'
import { getSessionGeneration, isSessionGenerationCurrent } from '@/http/session'

export const useUserStore = defineStore('user', () => {
  const member = ref<Member | null>(null)

  function setMember(value: Member, expectedGeneration = getSessionGeneration()) {
    if (!isSessionGenerationCurrent(expectedGeneration))
      return false
    member.value = value
    return true
  }

  function clearMember() {
    member.value = null
    uni.removeStorageSync('user')
  }

  async function fetchMember() {
    const generation = getSessionGeneration()
    const value = await getMember()
    return setMember(value, generation) ? value : undefined
  }

  return { member, setMember, clearMember, fetchMember }
})
