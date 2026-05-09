import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/lib/auth/store'
import type { UserRole } from '@/lib/types/user'

interface Props {
  requireRole?: UserRole
}

export function ProtectedRoute({ requireRole }: Props) {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (requireRole && user.role !== requireRole && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
