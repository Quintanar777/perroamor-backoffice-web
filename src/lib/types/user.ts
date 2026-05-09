export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE'

export interface User {
  id: number
  username: string
  fullName: string
  email?: string
  role: UserRole
  isActive: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: User
}
