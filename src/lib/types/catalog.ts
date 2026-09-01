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
  code: string | null
  brandId: number
  brandName: string
  brandColor: string | null
  category: string
  price: number
  wholesalePrice: number
  stock: number
  description: string | null
  canBePersonalized: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductInput {
  name: string
  code?: string | null
  brandId: number
  category: string
  price: number
  wholesalePrice: number
  stock: number
  description?: string | null
  canBePersonalized: boolean
  isActive?: boolean
}

export interface CatalogLookupResult {
  matchType: 'PRODUCT'
  product: Product
}

export interface ProductFilters {
  page?: number
  size?: number
  brandId?: number
  category?: string
  q?: string
  isActive?: boolean
}
