import { describe, expect, it } from 'vitest'
import complaintDetailSource from '@/pages/complaints/detail.vue?raw'
import complaintMemberDetailSource from '@/pages/complaints/member-detail.vue?raw'
import consultationDetailSource from '@/pages/consultations/detail.vue?raw'
import consultationMemberDetailSource from '@/pages/consultations/member-detail.vue?raw'
import { currentH5Ticket } from './h5-route-ticket'

describe('h5 consultation route ticket', () => {
  it('reads only the ticket parameter from the history query', () => {
    window.history.replaceState({}, '', '/pages/consultations/detail?ticket=ZX-1&other=value')
    expect(currentH5Ticket()).toBe('ZX-1')
  })

  it('returns an empty value when the history query has no ticket', () => {
    window.history.replaceState({}, '', '/pages/consultations/detail?other=value')
    expect(currentH5Ticket()).toBe('')
  })

  it('decodes an encoded ticket once through URLSearchParams', () => {
    window.history.replaceState({}, '', '/pages/complaints/detail?ticket=TS%2F2026%2B01')
    expect(currentH5Ticket()).toBe('TS/2026+01')
  })

  it('reads history tickets on load without retaining Hash route listeners', () => {
    for (const source of [
      consultationDetailSource,
      consultationMemberDetailSource,
      complaintDetailSource,
      complaintMemberDetailSource,
    ]) {
      expect(source).toContain('currentH5Ticket()')
      expect(source).not.toContain('hashchange')
      expect(source).not.toContain('window.location.hash')
    }
  })
})
