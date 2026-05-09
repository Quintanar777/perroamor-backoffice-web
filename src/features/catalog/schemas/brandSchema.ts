import { z } from 'zod'

export const brandSchema = z.object({
  name: z.string().min(1, 'Requerido').max(120),
  description: z.string().max(500, 'Máximo 500 caracteres'),
  isActive: z.boolean().optional(),
})

export type BrandFormInput = z.infer<typeof brandSchema>
