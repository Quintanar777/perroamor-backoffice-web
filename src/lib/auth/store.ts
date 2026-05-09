import { create } from 'zustand'
import type { AuthResponse, User, UserRole } from '@/lib/types/user'
import { tokenStorage } from '@/lib/auth/tokens'

interface AuthState {
  accessToken: string | null
  user: User | null
  hydrated: boolean
}

interface AuthActions {
  setAuth: (data: AuthResponse) => void
  setAccessToken: (token: string) => void
  setUser: (user: User) => void
  setHydrated: (value: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  accessToken: null,
  user: null,
  hydrated: false,
  setAuth: ({ accessToken, refreshToken, user }) => {
    tokenStorage.setRefresh(refreshToken)
    set({ accessToken, user, hydrated: true })
  },
  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  setHydrated: (hydrated) => set({ hydrated }),
  clear: () => {
    tokenStorage.clearRefresh()
    set({ accessToken: null, user: null, hydrated: true })
  },
}))

export const getAccessToken = (): string | null =>
  useAuthStore.getState().accessToken

export const hasRole = (role: UserRole): boolean => {
  const user = useAuthStore.getState().user
  return user?.role === role
}
