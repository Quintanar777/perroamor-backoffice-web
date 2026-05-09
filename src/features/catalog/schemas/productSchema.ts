import { z } from 'zod'

const decimalString = (label: string, opts: { min?: number } = {}) =>
  z
    .string()
    .min(1, 'Requerido')
    .refine((v) => /^-?\d+(\.\d+)?$/.test(v.trim()), { message: `${label} inválido` })
    .refine((v) => Number(v) >= (opts.min ?? -Infinity), {
      message: `${label} debe ser mayor o igual a ${opts.min ?? 0}`,
    })

const intString = (label: string, opts: { min?: number } = {}) =>
  z
    .string()
    .min(1, 'Requerido')
    .refine((v) => /^-?\d+$/.test(v.trim()), { message: `${label} debe ser entero` })
    .refine((v) => Number(v) >= (opts.min ?? 0), {
      message: `${label} debe ser mayor o igual a ${opts.min ?? 0}`,
    })

export const productSchema = z.object({
  name: z.string().min(1, 'Requerido').max(200),
  brandId: z.string().min(1, 'Seleccioná una marca'),
  category: z.string().min(1, 'Requerido').max(120),
  price: decimalString('Precio', { min: 0 }),
  wholesalePrice: decimalString('Precio mayoreo', { min: 0 }),
  stock: intString('Stock', { min: 0 }),
  description: z.string().max(2000),
  canBePersonalized: z.boolean(),
  hasVariants: z.boolean(),
  isActive: z.boolean().optional(),
})

export type ProductFormInput = z.infer<typeof productSchema>
