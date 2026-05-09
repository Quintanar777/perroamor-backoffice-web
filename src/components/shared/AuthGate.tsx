import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { useBootstrapSession } from '@/features/auth/hooks/useBootstrapSession'

export function AuthGate({ children }: { children: ReactNode }) {
  const hydrated = useBootstrapSession()

  if (!hydrated) {
    return (
      <main className="bg-background flex min-h-[100dvh] flex-col items-center justify-center gap-3 p-6">
        <span className="text-4xl">🐕</span>
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
        <p className="text-muted-foreground text-sm">Cargando sesión...</p>
      </main>
    )
  }

  return <>{children}</>
}
