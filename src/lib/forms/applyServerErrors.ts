import { toast } from 'sonner'
import { ApiError, NetworkError } from '@/lib/types/api'

interface Options {
  setError: (field: string, error: { message: string }) => void
  knownFields: readonly string[]
}

export function applyServerErrors(error: unknown, { setError, knownFields }: Options): void {
  if (error instanceof NetworkError) {
    toast.error('No se pudo conectar al servidor', {
      description: 'Verifica que el backend esté corriendo y permita este origen (CORS).',
    })
    return
  }

  if (!(error instanceof ApiError)) {
    toast.error('No se pudo guardar', {
      description: error instanceof Error ? error.message : undefined,
    })
    return
  }

  const knownSet = new Set<string>(knownFields)
  const fieldErrors = error.errors ?? []
  const unmapped: string[] = []
  let mappedAny = false

  for (const fe of fieldErrors) {
    if (knownSet.has(fe.field)) {
      setError(fe.field, { message: fe.message })
      mappedAny = true
    } else {
      unmapped.push(`${fe.field}: ${fe.message}`)
    }
  }

  const description =
    error.detail ??
    (unmapped.length > 0 ? unmapped.join(' · ') : undefined) ??
    error.title
  if (!mappedAny || unmapped.length > 0) {
    toast.error(error.title, { description })
  }
}
