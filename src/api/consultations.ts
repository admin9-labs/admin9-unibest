import type {
  ConsultationCategoryResource,
  ConsultationProgressResource,
  StoreConsultationRequest,
} from '@/service/types'
import {
  consultationsConsultationUsingGet,
  consultationsUsingGet,
  consultationsUsingPost,
  publicConsultationCategoriesUsingGet,
  publicConsultationsQueryUsingPost,
  publicConsultationsUsingPost,
} from '@/service/consultation'

export type Consultation = ConsultationProgressResource
export type ConsultationCategory = ConsultationCategoryResource
export type ConsultationInput = StoreConsultationRequest

export async function getConsultationCategories() {
  const response = await publicConsultationCategoriesUsingGet({
    options: { auth: 'public', hideErrorToast: true },
  })
  return response.data
}

export async function createGuestConsultation(input: ConsultationInput) {
  const response = await publicConsultationsUsingPost({
    body: input,
    options: { auth: 'public', hideErrorToast: true },
  })
  return response.data
}

export async function queryGuestConsultation(
  ticketNo: string,
  credential: string,
) {
  const response = await publicConsultationsQueryUsingPost({
    body: { ticket_no: ticketNo, query_credential: credential },
    options: { auth: 'public', hideErrorToast: true },
  })
  return response.data
}

export async function createMemberConsultation(input: ConsultationInput) {
  const response = await consultationsUsingPost({
    body: input,
    options: { hideErrorToast: true },
  })
  return response.data.consultation
}

export async function getMemberConsultations() {
  const response = await consultationsUsingGet({
    options: { hideErrorToast: true },
  })
  return response.data
}

export async function getMemberConsultation(ticketNo: string) {
  const response = await consultationsConsultationUsingGet({
    params: { consultation: ticketNo },
    options: { hideErrorToast: true },
  })
  return response.data.consultation
}
