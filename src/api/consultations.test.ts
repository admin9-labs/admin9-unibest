import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createGuestConsultation, getMemberConsultations, queryGuestConsultation } from './consultations'

const mocks = vi.hoisted(() => ({ guestCreate: vi.fn(), guestQuery: vi.fn(), memberList: vi.fn() }))
vi.mock('@/service/consultation', () => ({
  publicConsultationsUsingPost: mocks.guestCreate,
  publicConsultationsQueryUsingPost: mocks.guestQuery,
  consultationsUsingGet: mocks.memberList,
}))

describe('consultation API adapter', () => {
  beforeEach(() => vi.clearAllMocks())

  it('keeps guest credentials in request bodies and uses public auth', async () => {
    mocks.guestCreate.mockResolvedValue({ data: { consultation: { ticket_no: 'ZX-1' }, query_credential: 'a'.repeat(64), query_credential_expires_at: '2026-09-12' } })
    mocks.guestQuery.mockResolvedValue({ data: { consultation: { ticket_no: 'ZX-1' } } })
    const input = { category_code: 'travel-consultation', contact_name: '游客', contact_mobile: '13800138000', subject: '路线咨询', content: '咨询内容' }

    await createGuestConsultation(input)
    await queryGuestConsultation('ZX-1', 'a'.repeat(64))

    expect(mocks.guestCreate).toHaveBeenCalledWith({ body: input, options: { auth: 'public', hideErrorToast: true } })
    expect(mocks.guestQuery).toHaveBeenCalledWith({ body: { ticket_no: 'ZX-1', query_credential: 'a'.repeat(64) }, options: { auth: 'public', hideErrorToast: true } })
  })

  it('uses required member authentication for own records', async () => {
    mocks.memberList.mockResolvedValue({ data: [] })
    await getMemberConsultations()
    expect(mocks.memberList).toHaveBeenCalledWith({ options: { hideErrorToast: true } })
  })
})
