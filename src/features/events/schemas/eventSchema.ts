import { z } from 'zod'

const isoDate = z
  .string()
  .min(1, 'Requerido')
  .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), {
    message: 'Fecha inválida',
  })

export const eventSchema = z
  .object({
    name: z.string().min(1, 'Requerido').max(200),
    location: z.string().min(1, 'Requerido').max(200),
    description: z.string().max(2000),
    startDate: isoDate,
    endDate: isoDate,
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'La fecha de fin debe ser igual o posterior al inicio',
      })
    }
  })

export type EventFormInput = z.infer<typeof eventSchema>
