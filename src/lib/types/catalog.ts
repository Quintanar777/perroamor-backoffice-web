export interface Brand {
  id: number
  name: string
  description: string | null
  baseColor: string | null
  isActive: boolean
  createdAt: string
}

export interface BrandInput {
  name: string
  description?: string | null
  baseColor?: string | null
  isActive?: boolean
}

export interface Product {
  id: number
  name: string
  brandId: number
  brandName: string
  brandColor: string | null
  category: string
  price: number
  wholesalePrice: number
  stock: number
  description: string | null
  canBePersonalized: boolean
  hasVariants: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductInput {
  name: string
  brandId: number
  category: string
  price: number
  wholesalePrice: number
  stock: number
  description?: string | null
  canBePersonalized: boolean
  hasVariants: boolean
  isActive?: boolean
}

export interface ProductVariant {
  id: number
  productId: number
  variantName: string
  color: string | null
  size: string | null
  design: string | null
  material: string | null
  sku: string
  stock: number
  priceAdjustment: number
  isActive: boolean
  createdAt: string
}

export interface ProductVariantInput {
  variantName: string
  color?: string | null
  size?: string | null
  design?: string | null
  material?: string | null
  sku: string
  stock: number
  priceAdjustment: number
  isActive?: boolean
}

export interface ProductFilters {
  page?: number
  size?: number
  brandId?: number
  category?: string
  q?: string
}

export interface ComboItem {
  id: number
  productId: number
  productName: string
  variantId: number | null
  variantName: string | null
  quantity: number
}

export interface Combo {
  id: number
  name: string
  description: string | null
  brandId: number
  brandName: string
  brandColor: string | null
  price: number
  wholesalePrice: number
  isActive: boolean
  availableStock: number
  createdAt: string
  items: ComboItem[]
}

export interface ComboItemInput {
  productId: number
  variantId: number | null
  quantity: number
}

export interface ComboInput {
  name: string
  description?: string | null
  brandId: number
  price: number
  wholesalePrice: number
  isActive?: boolean
  items: ComboItemInput[]
}

export interface ComboFilters {
  page?: number
  size?: number
  brandId?: number
  q?: string
  isActive?: boolean
}
