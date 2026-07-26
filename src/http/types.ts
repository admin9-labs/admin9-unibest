export type AuthStrategy = 'public' | 'required' | 'refresh'

export type CustomRequestOptions = UniApp.RequestOptions & {
  query?: Record<string, unknown>
  auth?: AuthStrategy
  hideErrorToast?: boolean
  replayed?: boolean
}

export type OpenApiRequestOptions = Omit<CustomRequestOptions, 'url'> & {
  params?: Record<string, unknown>
  headers?: Record<string, string>
}

export interface ApiEnvelope<T> {
  success: boolean
  code: number
  message: string
  data: T
  request_id: string
  error_code?: string
  errors?: unknown
  meta?: PaginationMeta
}

export interface PaginationMeta {
  pagination: {
    page: number
    page_size: number
    has_more: boolean
    total: number
  }
}

export type HttpError<T = unknown> = Error & {
  type: 'business' | 'auth' | 'http' | 'network'
  code?: number
  errorCode?: string
  statusCode?: number
  message: string
  requestId?: string
  data?: T
  errors?: unknown
  raw?: unknown
}
