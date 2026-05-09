export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE'

export interface User {
  id: number
  username: string
  fullName: string
  email?: string
  role: UserRole
  isActive: boolean
  createdAt?: string
  lastLogin?: string | null
}

export interface CreateUserInput {
  username: string
  email: string
  fullName: string
  password: string
  role: UserRole
}

export interface UpdateUserInput {
  username: string
  email: string
  fullName: string
  password?: string
  role: UserRole
  isActive?: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: User
}
