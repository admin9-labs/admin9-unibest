import type { VisitorServiceResource } from '@/service/types'
import { publicServiceInformationServiceInformationUsingGet, publicServiceInformationUsingGet } from '@/service/serviceInformation'

export type ServiceInformation = VisitorServiceResource

export async function getServiceInformation(keyword = '') {
  const response = await publicServiceInformationUsingGet({
    params: { keyword: keyword || undefined, page_size: 50 },
    options: { auth: 'public', hideErrorToast: true },
  })
  return response.data as ServiceInformation[]
}

export async function getServiceInformationDetail(id: number) {
  const response = await publicServiceInformationServiceInformationUsingGet({
    params: { serviceInformation: id },
    options: { auth: 'public', hideErrorToast: true },
  })
  return response.data.service_information as ServiceInformation
}
