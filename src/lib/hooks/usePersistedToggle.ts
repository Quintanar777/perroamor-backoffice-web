import { useCallback, useState } from 'react'

const readStored = (key: string, fallback: boolean): boolean => {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return raw === 'true'
  } catch {
    return fallback
  }
}

const writeStored = (key: string, value: boolean): void => {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // ignore quota / disabled storage
  }
}

export function usePersistedToggle(
  key: string,
  defaultValue: boolean,
): [boolean, (value: boolean) => void, () => void] {
  const [value, setValue] = useState<boolean>(() => readStored(key, defaultValue))

  const set = useCallback(
    (next: boolean) => {
      setValue(next)
      writeStored(key, next)
    },
    [key],
  )

  const toggle = useCallback(() => {
    setValue((prev) => {
      const next = !prev
      writeStored(key, next)
      return next
    })
  }, [key])

  return [value, set, toggle]
}
