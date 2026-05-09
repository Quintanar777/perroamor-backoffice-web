export interface FieldError {
  field: string
  message: string
}

export interface ProblemDetail {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  errors?: FieldError[]
  [key: string]: unknown
}

export class ApiError extends Error {
  status: number
  title: string
  detail?: string
  errors?: FieldError[]
  raw?: ProblemDetail

  constructor(args: {
    status: number
    title: string
    detail?: string
    errors?: FieldError[]
    raw?: ProblemDetail
  }) {
    super(args.detail ?? args.title)
    this.name = 'ApiError'
    this.status = args.status
    this.title = args.title
    this.detail = args.detail
    this.errors = args.errors
    this.raw = args.raw
  }
}

export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export class NetworkError extends Error {
  constructor(message = 'No se pudo conectar al servidor') {
    super(message)
    this.name = 'NetworkError'
  }
}
