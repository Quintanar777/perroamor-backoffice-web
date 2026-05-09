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
      message: `${label} debe ser mayor o igual a ${opts.min ?? 1}`,
    })

export const comboItemSchema = z.object({
  productId: z.string().min(1, 'Seleccioná un producto'),
  variantId: z.string(),
  quantity: intString('Cantidad', { min: 1 }),
})

export const comboSchema = z.object({
  name: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(150, 'Máximo 150 caracteres'),
  description: z.string().max(2000),
  brandId: z.string().min(1, 'Seleccioná una marca'),
  price: decimalString('Precio', { min: 0 }),
  wholesalePrice: decimalString('Precio mayoreo', { min: 0 }),
  isActive: z.boolean().optional(),
  items: z
    .array(comboItemSchema)
    .min(1, 'Agrega al menos un componente'),
})

export type ComboItemFormInput = z.infer<typeof comboItemSchema>
export type ComboFormInput = z.infer<typeof comboSchema>

export function findDuplicateItemIndices(items: ComboItemFormInput[]): number[] {
  const seen = new Map<string, number>()
  const dupes: number[] = []
  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    if (!it.productId) continue
    const key = `${it.productId}::${it.variantId || ''}`
    if (seen.has(key)) {
      dupes.push(i)
    } else {
      seen.set(key, i)
    }
  }
  return dupes
}
