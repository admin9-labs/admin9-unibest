import type { OpenApiRequestOptions } from './types'
import { http } from './http'

type OpenApiResponseData<T> = T extends { data: infer Data } ? Data : T

export default function request<T>(url: string, options: OpenApiRequestOptions) {
  const { params, headers, ...rest } = options
  return http<OpenApiResponseData<T>>({
    ...rest,
    url,
    query: params,
    header: headers,
  }) as unknown as Promise<T>
}
