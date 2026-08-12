import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createGuestComplaint, getMemberComplaints, queryGuestComplaint, uploadComplaintEvidence } from './complaints'

const mocks = vi.hoisted(() => ({ upload: vi.fn(), guestCreate: vi.fn(), guestQuery: vi.fn(), memberList: vi.fn() }))
vi.mock('@/service/complaint', () => ({
  publicComplaintEvidenceUsingPost: mocks.upload,
  publicComplaintsUsingPost: mocks.guestCreate,
  publicComplaintsQueryUsingPost: mocks.guestQuery,
  complaintsUsingGet: mocks.memberList,
}))

describe('complaint API adapter', () => {
  beforeEach(() => vi.clearAllMocks())

  it('keeps upload and guest credentials in public request bodies', async () => {
    const file = new File(['evidence'], 'evidence.jpg', { type: 'image/jpeg' })
    const input = { category_code: 'service-quality', contact_name: '游客', contact_mobile: '13800138000', target_name: '邛海景区', title: '服务投诉', content: '投诉内容' }
    mocks.upload.mockResolvedValue({ data: {} })
    mocks.guestCreate.mockResolvedValue({ data: {} })
    mocks.guestQuery.mockResolvedValue({ data: {} })

    await uploadComplaintEvidence(file)
    await createGuestComplaint(input)
    await queryGuestComplaint('TS-1', 'a'.repeat(64))

    expect(mocks.upload).toHaveBeenCalledWith({ body: { file }, options: { auth: 'public', hideErrorToast: true } })
    expect(mocks.guestCreate).toHaveBeenCalledWith({ body: input, options: { auth: 'public', hideErrorToast: true } })
    expect(mocks.guestQuery).toHaveBeenCalledWith({ body: { ticket_no: 'TS-1', query_credential: 'a'.repeat(64) }, options: { auth: 'public', hideErrorToast: true } })
  })

  it('uses required member authentication for own records', async () => {
    mocks.memberList.mockResolvedValue({ data: [] })
    await getMemberComplaints()
    expect(mocks.memberList).toHaveBeenCalledWith({ options: { hideErrorToast: true } })
  })
})
