import { describe, expect, it, vi } from 'vitest'
import { getMapPoints } from './map-points'

const sources = vi.hoisted(() => ({
  getAttractions: vi.fn(),
  getScenicSpots: vi.fn(),
  getRestaurants: vi.fn(),
  getAccommodations: vi.fn(),
}))
vi.mock('@/api/attractions', () => ({ getAttractions: sources.getAttractions }))
vi.mock('@/api/scenic-spots', () => ({ getScenicSpots: sources.getScenicSpots }))
vi.mock('@/api/restaurants', () => ({ getRestaurants: sources.getRestaurants }))
vi.mock('@/api/accommodations', () => ({ getAccommodations: sources.getAccommodations }))

describe('map point adapter', () => {
  it('combines valid real content coordinates and tolerates one failed source', async () => {
    sources.getAttractions.mockResolvedValue([{ id: 101, name: '邛海', address: '海滨路', latitude: 27.86, longitude: 102.27 }])
    sources.getScenicSpots.mockResolvedValue([{ id: 201, name: '无坐标', latitude: null, longitude: null }])
    sources.getRestaurants.mockRejectedValue(new Error('network'))
    sources.getAccommodations.mockResolvedValue([{ id: 701, name: '湖畔酒店', latitude: 27.87, longitude: 102.28 }])

    const points = await getMapPoints()

    expect(points).toHaveLength(2)
    expect(points[0]).toMatchObject({ id: 'attraction:101', contentId: 101, typeName: '景区', detailUrl: '/pages/attractions/detail?id=101' })
    expect(points[1]).toMatchObject({ id: 'accommodation:701', contentId: 701, address: null })
  })

  it('fails only when every public content source fails', async () => {
    Object.values(sources).forEach(source => source.mockRejectedValue(new Error('network')))
    await expect(getMapPoints()).rejects.toThrow('All map point sources failed')
  })
})
