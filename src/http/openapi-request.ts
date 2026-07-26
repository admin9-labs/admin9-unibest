import type { OpenApiRequestOptions } from './types'
import { http } from './http'

export default function request<T extends { data: unknown }>(url: string, options: OpenApiRequestOptions) {
  const { params, headers, ...rest } = options
  return http<T['data']>({
    ...rest,
    url,
    query: params,
    header: headers,
  }) as unknown as Promise<T>
}
