export interface ConsultationCredential {
  ticketNo: string
  credential: string
  expiresAt: string
}

const STORAGE_KEY = 'guest-consultation-credentials'

function readAll(): ConsultationCredential[] {
  const value = uni.getStorageSync(STORAGE_KEY)
  if (!Array.isArray(value))
    return []
  return value.filter(
    item =>
      item
      && typeof item.ticketNo === 'string'
      && typeof item.credential === 'string'
      && typeof item.expiresAt === 'string',
  )
}

export function saveConsultationCredential(value: ConsultationCredential) {
  const current = readAll().filter(
    item =>
      item.ticketNo !== value.ticketNo
      && Date.parse(item.expiresAt) > Date.now(),
  )
  uni.setStorageSync(STORAGE_KEY, [value, ...current].slice(0, 20))
}

export function getConsultationCredential(ticketNo: string) {
  const value = readAll().find(item => item.ticketNo === ticketNo)
  return value && Date.parse(value.expiresAt) > Date.now()
    ? value.credential
    : null
}
