import type { MapPoint } from '@/api/map-points'

export interface MapMarkerGroup {
  id: string
  latitude: number
  longitude: number
  title: string
  pointKey: string | null
  count: number
}

export function clusterMapPoints(points: MapPoint[], scale: number): MapMarkerGroup[] {
  if (points.length <= 100) {
    return points.map(point => ({
      id: point.key,
      latitude: point.latitude,
      longitude: point.longitude,
      title: point.name,
      pointKey: point.key,
      count: 1,
    }))
  }

  const cellSize = scale >= 16 ? 0.002 : scale >= 14 ? 0.006 : 0.02
  const groups = new Map<string, MapPoint[]>()
  points.forEach((point) => {
    const key = `${Math.floor(point.latitude / cellSize)}:${Math.floor(point.longitude / cellSize)}`
    groups.set(key, [...(groups.get(key) ?? []), point])
  })

  return Array.from(groups.entries()).map(([cell, members]) => ({
    id: members.length === 1 ? members[0].key : `cluster:${cell}`,
    latitude: members.reduce((sum, point) => sum + point.latitude, 0) / members.length,
    longitude: members.reduce((sum, point) => sum + point.longitude, 0) / members.length,
    title: members.length === 1 ? members[0].name : `${members.length} 处点位`,
    pointKey: members.length === 1 ? members[0].key : null,
    count: members.length,
  }))
}
