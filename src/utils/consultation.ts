import type { Consultation } from '@/api/consultations'

export const consultationStatus: Record<
  Consultation['status'],
  { label: string, type: 'warning' | 'primary' | 'success' | 'default' }
> = {
  pending: { label: '待受理', type: 'warning' },
  processing: { label: '处理中', type: 'primary' },
  replied: { label: '已回复', type: 'success' },
  closed: { label: '已关闭', type: 'default' },
}

export function formatConsultationTime(value: string | null) {
  if (!value)
    return '-'
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}
