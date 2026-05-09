const REFRESH_TOKEN_KEY = 'perroamor.refreshToken'

export const tokenStorage = {
  getRefresh(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY)
    } catch {
      return null
    }
  },
  setRefresh(token: string): void {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, token)
    } catch {
      // ignore quota / disabled storage
    }
  },
  clearRefresh(): void {
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    } catch {
      // ignore
    }
  },
}
