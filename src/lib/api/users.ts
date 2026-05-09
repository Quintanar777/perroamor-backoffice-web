import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/client'
import type { CreateUserInput, UpdateUserInput, User } from '@/lib/types/user'

export const usersApi = {
  list: (): Promise<User[]> => apiGet<User[]>('/users'),
  get: (id: number): Promise<User> => apiGet<User>(`/users/${id}`),
  create: (body: CreateUserInput): Promise<User> => apiPost<User>('/users', body),
  update: (id: number, body: UpdateUserInput): Promise<User> =>
    apiPut<User>(`/users/${id}`, body),
  remove: (id: number): Promise<void> => apiDelete<void>(`/users/${id}`),
}

export const userKeys = {
  all: () => ['users'] as const,
  detail: (id: number) => ['users', id] as const,
}
