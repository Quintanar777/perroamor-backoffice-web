const requireEnv = (key: keyof ImportMetaEnv): string => {
  const value = import.meta.env[key]
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Missing env var: ${key}`)
  }
  return value
}

export const env = {
  apiBaseUrl: requireEnv('VITE_API_BASE_URL'),
  isDev: import.meta.env.DEV,
}
