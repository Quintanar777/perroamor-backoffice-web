import { useSyncExternalStore } from 'react'

const subscribe = (query: string) => (callback: () => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mq = window.matchMedia(query)
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

const getSnapshot = (query: string) => () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(query).matches
}

const getServerSnapshot = () => false

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    subscribe(query),
    getSnapshot(query),
    getServerSnapshot,
  )
}

// iPad landscape ≥1024px wide. Use this to switch cart sidebar vs drawer.
export const useIsLandscapeWide = (): boolean =>
  useMediaQuery('(min-width: 1024px)')
