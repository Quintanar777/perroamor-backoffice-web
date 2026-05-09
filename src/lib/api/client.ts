import { env } from '@/lib/env'
import { useAuthStore } from '@/lib/auth/store'
import { tokenStorage } from '@/lib/auth/tokens'
import { ApiError, type FieldError, type ProblemDetail } from '@/lib/types/api'
import type { AuthResponse } from '@/lib/types/user'

interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined | null>
  body?: unknown
  signal?: AbortSignal
  headers?: Record<string, string>
  skipAuth?: boolean
  skipRefresh?: boolean
}

const buildUrl = (path: string, query?: RequestOptions['query']): string => {
  const url = new URL(
    path.startsWith('http') ? path : `${env.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`,
  )
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

const parseProblem = async (response: Response): Promise<ApiError> => {
  let raw: ProblemDetail | undefined
  let title = response.statusText || 'Request failed'
  let detail: string | undefined
  let errors: FieldError[] | undefined

  try {
    const ct = response.headers.get('content-type') ?? ''
    if (ct.includes('application/json') || ct.includes('application/problem+json')) {
      raw = (await response.json()) as ProblemDetail
      title = raw.title ?? title
      detail = raw.detail
      errors = raw.errors
    }
  } catch {
    // body might be empty / invalid JSON — fall through with defaults
  }

  return new ApiError({ status: response.status, title, detail, errors, raw })
}

let refreshInFlight: Promise<string | null> | null = null

const performRefresh = async (): Promise<string | null> => {
  const refreshToken = tokenStorage.getRefresh()
  if (!refreshToken) return null

  try {
    const response = await fetch(buildUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!response.ok) {
      useAuthStore.getState().clear()
      return null
    }
    const data = (await response.json()) as AuthResponse
    useAuthStore.getState().setAuth(data)
    return data.accessToken
  } catch {
    useAuthStore.getState().clear()
    return null
  }
}

const refreshAccessToken = (): Promise<string | null> => {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

const request = async <T>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const url = buildUrl(path, options.query)
  const headers = new Headers(options.headers ?? {})

  if (!options.skipAuth) {
    const token = useAuthStore.getState().accessToken
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  let bodyPayload: BodyInit | undefined
  if (options.body !== undefined && options.body !== null) {
    headers.set('Content-Type', 'application/json')
    bodyPayload = JSON.stringify(options.body)
  }

  const response = await fetch(url, {
    method,
    headers,
    body: bodyPayload,
    signal: options.signal,
  })

  if (response.status === 401 && !options.skipAuth && !options.skipRefresh) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      const retryHeaders = new Headers(headers)
      retryHeaders.set('Authorization', `Bearer ${newToken}`)
      const retry = await fetch(url, {
        method,
        headers: retryHeaders,
        body: bodyPayload,
        signal: options.signal,
      })
      return handleResponse<T>(retry)
    }
  }

  return handleResponse<T>(response)
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) throw await parseProblem(response)
  if (response.status === 204) return undefined as T
  const ct = response.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) return undefined as T
  return (await response.json()) as T
}

export const apiGet = <T>(path: string, options?: RequestOptions): Promise<T> =>
  request<T>('GET', path, options)

export const apiPost = <T>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> => request<T>('POST', path, { ...options, body })

export const apiPut = <T>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> => request<T>('PUT', path, { ...options, body })

export const apiPatch = <T>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> => request<T>('PATCH', path, { ...options, body })

export const apiDelete = <T>(path: string, options?: RequestOptions): Promise<T> =>
  request<T>('DELETE', path, options)
