import type { DiningPlaceResource } from '@/service/types'
import { publicRestaurantsRestaurantUsingGet, publicRestaurantsUsingGet } from '@/service/restaurant'

export type Restaurant = DiningPlaceResource

export async function getRestaurants(keyword = '', categoryId?: number) {
  const response = await publicRestaurantsUsingGet({
    params: {
      keyword: keyword || undefined,
      category_id: categoryId,
      page_size: 50,
    },
    options: { auth: 'public', hideErrorToast: true },
  })
  return response.data as Restaurant[]
}

export async function getRestaurant(id: number) {
  const response = await publicRestaurantsRestaurantUsingGet({
    params: { restaurant: id },
    options: { auth: 'public', hideErrorToast: true },
  })
  return response.data.restaurant as Restaurant
}
