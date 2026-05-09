import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/auth/store'
import { tokenStorage } from '@/lib/auth/tokens'
import { queryClient } from '@/lib/query'

export function useLogout() {
  const clear = useAuthStore((s) => s.clear)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      const refreshToken = tokenStorage.getRefresh()
      if (refreshToken) {
        try {
          await authApi.logout(refreshToken)
        } catch {
          // server-side invalidation is best-effort; we still clear locally
        }
      }
    },
    onSettled: () => {
      clear()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })
}
