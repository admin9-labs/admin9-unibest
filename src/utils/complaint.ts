import type { Complaint } from '@/api/complaints'

export const complaintStatus: Record<
  Complaint['status'],
  { label: string, type: 'warning' | 'primary' | 'success' | 'default' }
> = {
  pending: { label: '待受理', type: 'warning' },
  processing: { label: '处理中', type: 'primary' },
  resolved: { label: '已处理', type: 'success' },
  closed: { label: '已关闭', type: 'default' },
}

export function formatComplaintTime(value: string | null) {
  return value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '-'
}
