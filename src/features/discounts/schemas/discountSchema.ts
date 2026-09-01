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

const discountSlotOptionSchema = z.object({
  productId: z.string().min(1, 'Seleccioná un producto'),
  finalUnitPrice: decimalString('Precio final', { min: 0 }),
})

// Backend rule (DiscountService.validateSlots/validateTotal): a FIXED slot
// has exactly one option, a GROUP slot has quantity === 1, and every option
// inside the same slot must share one final price.
const discountSlotSchema = z
  .object({
    slotType: z.enum(['FIXED', 'GROUP']),
    quantity: intString('Cantidad', { min: 1 }),
    options: z.array(discountSlotOptionSchema).min(1, 'Agregá al menos un producto'),
  })
  .superRefine((slot, ctx) => {
    if (slot.slotType === 'FIXED' && slot.options.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Un slot fijo debe tener exactamente un producto',
        path: ['options'],
      })
    }
    if (slot.slotType === 'GROUP' && slot.options.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Un slot de grupo necesita al menos un producto',
        path: ['options'],
      })
    }
    if (slot.slotType === 'GROUP' && Number(slot.quantity) !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Un slot de grupo debe tener cantidad igual a 1',
        path: ['quantity'],
      })
    }
    const prices = new Set(
      slot.options
        .map((o) => o.finalUnitPrice.trim())
        .filter((p) => p.length > 0 && /^-?\d+(\.\d+)?$/.test(p))
        .map((p) => Number(p).toFixed(2)),
    )
    if (prices.size > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Todas las opciones del slot deben compartir el mismo precio final',
        path: ['options'],
      })
    }
  })

export const discountSchema = z
  .object({
    name: z.string().min(2, 'Mínimo 2 caracteres').max(150),
    description: z.string().max(500),
    totalPrice: decimalString('Precio total', { min: 0 }),
    isActive: z.boolean().optional(),
    slots: z.array(discountSlotSchema).min(1, 'Agregá al menos un slot'),
  })
  .superRefine((data, ctx) => {
    let sum = 0
    let computable = true
    for (const slot of data.slots) {
      const price = Number(slot.options[0]?.finalUnitPrice)
      const quantity = Number(slot.quantity)
      if (!Number.isFinite(price) || !Number.isFinite(quantity)) {
        computable = false
        break
      }
      sum += price * quantity
    }
    const total = Number(data.totalPrice)
    if (computable && Number.isFinite(total) && Math.abs(sum - total) > 0.005) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `La suma de los slots (${sum.toFixed(2)}) no coincide con el precio total declarado (${total.toFixed(2)})`,
        path: ['totalPrice'],
      })
    }
  })

export type DiscountFormInput = z.infer<typeof discountSchema>

export const emptyDiscountOption = { productId: '', finalUnitPrice: '' }

export const emptyDiscountSlot = {
  slotType: 'FIXED' as const,
  quantity: '1',
  options: [emptyDiscountOption],
}
