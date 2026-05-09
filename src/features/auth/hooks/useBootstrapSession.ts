import { useEffect } from 'react'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/auth/store'
import { tokenStorage } from '@/lib/auth/tokens'

export function useBootstrapSession() {
  const hydrated = useAuthStore((s) => s.hydrated)
  const setAuth = useAuthStore((s) => s.setAuth)
  const setUser = useAuthStore((s) => s.setUser)
  const setHydrated = useAuthStore((s) => s.setHydrated)
  const clear = useAuthStore((s) => s.clear)

  useEffect(() => {
    if (hydrated) return
    let cancelled = false

    const run = async () => {
      const refreshToken = tokenStorage.getRefresh()
      if (!refreshToken) {
        if (!cancelled) setHydrated(true)
        return
      }

      try {
        const refreshed = await authApi.refresh(refreshToken)
        if (cancelled) return
        setAuth(refreshed)
        const me = await authApi.me()
        if (cancelled) return
        setUser(me)
      } catch {
        if (!cancelled) clear()
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [hydrated, setAuth, setUser, setHydrated, clear])

  return hydrated
}
