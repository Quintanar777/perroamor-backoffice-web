import { z } from 'zod'

const ROLES = ['ADMIN', 'MANAGER', 'EMPLOYEE'] as const

const baseUser = {
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  email: z.string().email('Email inválido').max(255),
  fullName: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(150, 'Máximo 150 caracteres'),
  role: z.enum(ROLES, { message: 'Rol inválido' }),
}

export const createUserSchema = z.object({
  ...baseUser,
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .max(100, 'Máximo 100 caracteres'),
})

export const updateUserSchema = z.object({
  ...baseUser,
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .or(z.literal(''))
    .optional(),
  isActive: z.boolean().optional(),
})

export type CreateUserFormInput = z.infer<typeof createUserSchema>
export type UpdateUserFormInput = z.infer<typeof updateUserSchema>
