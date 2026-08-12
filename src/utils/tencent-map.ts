interface TencentLatLng {
  lat: number
  lng: number
}

interface TencentMapInstance {
  setCenter: (position: TencentLatLng) => void
  setZoom: (zoom: number) => void
  destroy?: () => void
}

interface TencentMarkerInstance {
  on: (event: 'click', listener: (event: { geometry?: { id?: string } }) => void) => void
  setGeometries: (geometries: TencentMarkerGeometry[]) => void
  setMap: (map: TencentMapInstance | null) => void
}

export interface TencentMarkerGeometry {
  id: string
  position: TencentLatLng
  properties?: { title: string }
}

export interface TencentMapApi {
  LatLng: new (latitude: number, longitude: number) => TencentLatLng
  Map: new (container: HTMLElement, options: { center: TencentLatLng, zoom: number }) => TencentMapInstance
  MultiMarker: new (options: { map: TencentMapInstance, geometries: TencentMarkerGeometry[] }) => TencentMarkerInstance
}

declare global {
  interface Window {
    TMap?: TencentMapApi
    __xichangTencentMapReady?: () => void
  }
}

let loadingPromise: Promise<TencentMapApi> | null = null

export function loadTencentMap(key: string, documentRef: Document = document): Promise<TencentMapApi> {
  if (window.TMap)
    return Promise.resolve(window.TMap)
  if (!key.trim())
    return Promise.reject(new Error('Tencent map key is not configured'))
  if (loadingPromise)
    return loadingPromise

  loadingPromise = new Promise<TencentMapApi>((resolve, reject) => {
    const existingScript = documentRef.querySelector<HTMLScriptElement>('#xichang-tencent-map-sdk')
    const finish = () => {
      if (window.TMap)
        resolve(window.TMap)
      else
        reject(new Error('Tencent map SDK did not initialize'))
    }

    window.__xichangTencentMapReady = finish
    if (existingScript) {
      existingScript.addEventListener('load', finish, { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Tencent map SDK failed to load')), { once: true })
      return
    }

    const script = documentRef.createElement('script')
    script.id = 'xichang-tencent-map-sdk'
    script.async = true
    script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${encodeURIComponent(key)}&callback=__xichangTencentMapReady`
    script.addEventListener('error', () => reject(new Error('Tencent map SDK failed to load')), { once: true })
    documentRef.head.appendChild(script)
  }).catch((error) => {
    loadingPromise = null
    throw error
  }).finally(() => {
    delete window.__xichangTencentMapReady
  })

  return loadingPromise
}

export function createTencentRouteUrl(point: { name: string, address: string | null, latitude: number, longitude: number }): string {
  const target = encodeURIComponent(point.name)
  const address = encodeURIComponent(point.address ?? point.name)
  return `https://apis.map.qq.com/uri/v1/routeplan?type=drive&to=${target}&tocoord=${point.latitude},${point.longitude}&toaddress=${address}&policy=0&referer=xichang-travel`
}

export function openTencentRoute(point: { name: string, address: string | null, latitude: number, longitude: number }): void {
  window.location.assign(createTencentRouteUrl(point))
}

export type { TencentMapInstance, TencentMarkerInstance }
