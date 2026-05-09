import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi, type LoginCredentials } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/auth/store'
import { ApiError, NetworkError } from '@/lib/types/api'

interface LocationState {
  from?: { pathname?: string }
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const location = useLocation()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (response) => {
      setAuth(response)
      const from = (location.state as LocationState | null)?.from?.pathname ?? '/'
      navigate(from, { replace: true })
    },
    onError: (error) => {
      if (error instanceof NetworkError) {
        toast.error('No se pudo conectar al servidor', {
          description:
            'Verifica que el backend esté corriendo y permita este origen (CORS).',
        })
        return
      }
      if (error instanceof ApiError) {
        toast.error(error.title, { description: error.detail })
        return
      }
      toast.error('No se pudo iniciar sesión', {
        description: error.message,
      })
    },
  })
}
