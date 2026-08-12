import type {
  ComplaintCategoryResource,
  ComplaintEvidenceResource,
  ComplaintProgressResource,
  StoreComplaintRequest,
} from '@/service/types'
import {
  complaintsComplaintUsingGet,
  complaintsUsingGet,
  complaintsUsingPost,
  publicComplaintCategoriesUsingGet,
  publicComplaintEvidenceUsingPost,
  publicComplaintsQueryUsingPost,
  publicComplaintsUsingPost,
} from '@/service/complaint'

export type Complaint = ComplaintProgressResource
export type ComplaintCategory = ComplaintCategoryResource
export type ComplaintInput = StoreComplaintRequest
export type ComplaintEvidence = ComplaintEvidenceResource

export async function getComplaintCategories() {
  const response = await publicComplaintCategoriesUsingGet({
    options: { auth: 'public', hideErrorToast: true },
  })
  return response.data
}

export async function uploadComplaintEvidence(file: File) {
  const response = await publicComplaintEvidenceUsingPost({
    body: { file: file as unknown as string },
    options: { auth: 'public', hideErrorToast: true },
  })
  return response.data
}

export async function createGuestComplaint(input: ComplaintInput) {
  const response = await publicComplaintsUsingPost({
    body: input,
    options: { auth: 'public', hideErrorToast: true },
  })
  return response.data
}

export async function queryGuestComplaint(ticketNo: string, credential: string) {
  const response = await publicComplaintsQueryUsingPost({
    body: { ticket_no: ticketNo, query_credential: credential },
    options: { auth: 'public', hideErrorToast: true },
  })
  return response.data
}

export async function createMemberComplaint(input: ComplaintInput) {
  const response = await complaintsUsingPost({ body: input, options: { hideErrorToast: true } })
  return response.data.complaint
}

export async function getMemberComplaints() {
  const response = await complaintsUsingGet({ options: { hideErrorToast: true } })
  return response.data
}

export async function getMemberComplaint(ticketNo: string) {
  const response = await complaintsComplaintUsingGet({
    params: { complaint: ticketNo },
    options: { hideErrorToast: true },
  })
  return response.data.complaint
}
