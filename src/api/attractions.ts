import type { TourismAreaResource } from '@/service/types'
import { publicAttractionsAttractionUsingGet, publicAttractionsUsingGet } from '@/service/attraction'

export type Attraction = TourismAreaResource

export async function getAttractions(keyword = '') {
  const response = await publicAttractionsUsingGet({
    params: { keyword: keyword || undefined, page_size: 50 },
    options: { auth: 'public', hideErrorToast: true },
  })
  return response.data as Attraction[]
}

export async function getAttraction(code: string) {
  const response = await publicAttractionsAttractionUsingGet({
    params: { attraction: code },
    options: { auth: 'public', hideErrorToast: true },
  })
  return response.data.attraction as Attraction
}
