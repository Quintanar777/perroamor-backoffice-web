import { z } from 'zod'

const intString = (label: string, opts: { min?: number } = {}) =>
  z
    .string()
    .min(1, 'Requerido')
    .refine((v) => /^-?\d+$/.test(v.trim()), { message: `${label} debe ser entero` })
    .refine((v) => Number(v) >= (opts.min ?? 0), {
      message: `${label} debe ser mayor o igual a ${opts.min ?? 0}`,
    })

const decimalString = (label: string) =>
  z
    .string()
    .min(1, 'Requerido')
    .refine((v) => /^-?\d+(\.\d+)?$/.test(v.trim()), { message: `${label} inválido` })

export const variantSchema = z.object({
  variantName: z.string().min(1, 'Requerido').max(160),
  color: z.string().max(120),
  size: z.string().max(120),
  design: z.string().max(120),
  material: z.string().max(120),
  sku: z.string().min(1, 'Requerido').max(60),
  stock: intString('Stock', { min: 0 }),
  priceAdjustment: decimalString('Ajuste de precio'),
  isActive: z.boolean().optional(),
})

export type VariantFormInput = z.infer<typeof variantSchema>
