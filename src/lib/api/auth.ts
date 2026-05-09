import { apiGet, apiPost } from '@/lib/api/client'
import type { AuthResponse, User } from '@/lib/types/user'

export interface LoginCredentials {
  username: string
  password: string
}

export const authApi = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    apiPost<AuthResponse>('/auth/login', credentials, {
      skipAuth: true,
      skipRefresh: true,
    }),

  refresh: (refreshToken: string): Promise<AuthResponse> =>
    apiPost<AuthResponse>(
      '/auth/refresh',
      { refreshToken },
      { skipAuth: true, skipRefresh: true },
    ),

  me: (): Promise<User> => apiGet<User>('/auth/me'),

  logout: (refreshToken: string): Promise<void> =>
    apiPost<void>('/auth/logout', { refreshToken }, { skipRefresh: true }),
}
