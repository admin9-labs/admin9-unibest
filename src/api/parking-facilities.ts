import type { ParkingFacilityResource } from '@/service/types'
import { publicParkingFacilitiesParkingFacilityUsingGet, publicParkingFacilitiesUsingGet } from '@/service/parkingFacility'

export type ParkingFacility = ParkingFacilityResource

export async function getParkingFacilities(keyword = '', type?: ParkingFacilityResource['type'], page = 1) {
  const response = await publicParkingFacilitiesUsingGet({
    params: { keyword: keyword || undefined, type, page, page_size: 20 },
    options: { auth: 'public', hideErrorToast: true },
  })
  return {
    records: response.data as ParkingFacility[],
    meta: response.meta,
  }
}

export async function getParkingFacility(id: number) {
  const response = await publicParkingFacilitiesParkingFacilityUsingGet({
    params: { parkingFacility: id },
    options: { auth: 'public', hideErrorToast: true },
  })
  return response.data.parking_facility as ParkingFacility
}
