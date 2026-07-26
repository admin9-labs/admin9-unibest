import type { ApiEnvelope, AuthStrategy, CustomRequestOptions, HttpError } from './types'
import type { SessionIdentity } from './session'
import { getEnvBaseUrl } from '@/utils/baseUrl'
import {
  clearSessionIfGenerationCurrent,
  clearSessionIfIdentityCurrent,
  getSessionGeneration,
  getSessionIdentity,
  isSessionGenerationCurrent,
  isSessionIdentityCurrent,
  rotateSession,
} from './session'
import { stringifyQuery } from './tools/queryString'

interface RefreshFlight {
  identity: SessionIdentity
  promise: Promise<void>
}

export class StaleSessionError extends Error {
  constructor() {
    super('Session changed while the request was in flight')
    this.name = 'StaleSessionError'
  }
}

let refreshFlight: RefreshFlight | null = null
let authFailureShown = false

function resolveUrl(url: string, query?: Record<string, unknown>) {
  let resolved = url
  if (query && Object.keys(query).length)
    resolved += `${resolved.includes('?') ? '&' : '?'}${stringifyQuery(query)}`
  if (resolved.startsWith('http'))
    return resolved
  // #ifdef H5
  if (import.meta.env.DEV)
    return resolved
  // #endif
  return `${getEnvBaseUrl()}${resolved}`
}

function asHttpError(res: UniApp.RequestSuccessCallbackResult, fallback: string): HttpError {
  const body = (res.data || {}) as Partial<ApiEnvelope<unknown>>
  const type: HttpError['type'] = res.statusCode === 401 ? 'auth' : res.statusCode >= 400 ? 'http' : 'business'
  return Object.assign(new Error(body.message || fallback), {
    type,
    code: body.code,
    errorCode: body.error_code,
    statusCode: res.statusCode,
    requestId: body.request_id,
    data: body.data,
    errors: body.errors,
    raw: res,
  })
}

function rawRequest<T>(options: CustomRequestOptions, token?: string) {
  return new Promise<ApiEnvelope<T>>((resolve, reject) => {
    uni.request({
      ...options,
      url: resolveUrl(options.url, options.query),
      dataType: 'json',
      // #ifndef MP-WEIXIN
      responseType: 'json',
      // #endif
      header: {
        ...options.header,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      timeout: options.timeout || 60000,
      success(res) {
        const body = res.data as ApiEnvelope<T>
        if (res.statusCode >= 200 && res.statusCode < 300 && body?.success && body.code === 0)
          return resolve(body)
        reject(asHttpError(res, `请求失败 (${res.statusCode})`))
      },
      fail(error) {
        const networkError = new Error('网络连接失败，请稍后重试') as HttpError
        networkError.type = 'network'
        networkError.raw = error
        reject(networkError)
      },
    })
  })
}

async function refreshSession(identity: SessionIdentity) {
  if (refreshFlight && refreshFlight.identity.generation === identity.generation && refreshFlight.identity.accessToken === identity.accessToken)
    return refreshFlight.promise
  if (!isSessionIdentityCurrent(identity))
    throw new StaleSessionError()

  const promise = rawRequest<{ access_token: string, expires_in: number }>({
    url: '/api/auth/refresh',
    method: 'POST',
    auth: 'refresh',
    hideErrorToast: true,
  }, identity.accessToken).then(({ data }) => {
    if (!rotateSession(identity, data.access_token, data.expires_in))
      throw new StaleSessionError()
  }).finally(() => {
    if (refreshFlight?.promise === promise)
      refreshFlight = null
  })
  refreshFlight = { identity, promise }
  return promise
}

function showError(error: HttpError) {
  uni.showToast({ icon: 'none', title: error.message })
}

function showAuthExpired() {
  if (authFailureShown)
    return
  authFailureShown = true
  uni.showToast({ icon: 'none', title: '登录已过期，请重新登录' })
  setTimeout(() => {
    authFailureShown = false
  }, 0)
}

function isTerminalMemberAuthError(error: HttpError) {
  return error.statusCode === 403 && error.code === 403 && error.errorCode === 'account_inactive'
}

export async function http<T>(options: CustomRequestOptions): Promise<ApiEnvelope<T>> {
  const auth: AuthStrategy = options.auth || 'required'
  const requestGeneration = getSessionGeneration()
  const requestIdentity = auth === 'public' ? null : getSessionIdentity()
  try {
    const response = await rawRequest<T>(options, requestIdentity?.accessToken)
    if (auth === 'required' && !isSessionGenerationCurrent(requestGeneration))
      throw new StaleSessionError()
    return response
  }
  catch (error) {
    if (error instanceof StaleSessionError)
      throw error

    if (auth === 'required' && !isSessionGenerationCurrent(requestGeneration))
      throw new StaleSessionError()

    const httpError = error as HttpError
    if (auth !== 'public' && isTerminalMemberAuthError(httpError))
      clearSessionIfGenerationCurrent(requestGeneration)

    if (httpError.statusCode === 401 && auth === 'required' && !options.replayed) {
      let recoveryIdentity = requestIdentity
      try {
        if (!isSessionGenerationCurrent(requestGeneration))
          throw new StaleSessionError()
        if (!requestIdentity)
          throw httpError
        if (isSessionIdentityCurrent(requestIdentity))
          await refreshSession(requestIdentity)

        recoveryIdentity = getSessionIdentity()
        if (!recoveryIdentity || recoveryIdentity.generation !== requestGeneration)
          throw new StaleSessionError()
        const response = await rawRequest<T>({ ...options, replayed: true }, recoveryIdentity.accessToken)
        if (!isSessionGenerationCurrent(requestGeneration))
          throw new StaleSessionError()
        return response
      }
      catch (recoveryError) {
        if (recoveryError instanceof StaleSessionError)
          throw recoveryError
        if (!isSessionGenerationCurrent(requestGeneration))
          throw new StaleSessionError()
        const recoveryHttpError = recoveryError as HttpError
        const isExpired = recoveryHttpError.statusCode === 401
        const isTerminal = isExpired || isTerminalMemberAuthError(recoveryHttpError)
        if (!isTerminal) {
          if (!options.hideErrorToast)
            showError(recoveryHttpError)
          throw recoveryError
        }
        const cleared = isTerminalMemberAuthError(recoveryHttpError)
          ? clearSessionIfGenerationCurrent(requestGeneration)
          : recoveryIdentity
            ? clearSessionIfIdentityCurrent(recoveryIdentity)
            : clearSessionIfGenerationCurrent(requestGeneration)
        if (!cleared)
          throw new StaleSessionError()
        if (isExpired)
          showAuthExpired()
        else if (!options.hideErrorToast)
          showError(recoveryHttpError)
        throw recoveryError
      }
    }
    if (!options.hideErrorToast)
      showError(httpError)
    throw httpError
  }
}
