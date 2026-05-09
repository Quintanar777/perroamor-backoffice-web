export interface ProblemDetail {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  errors?: Record<string, string[]>
  [key: string]: unknown
}

export class ApiError extends Error {
  status: number
  title: string
  detail?: string
  errors?: Record<string, string[]>
  raw?: ProblemDetail

  constructor(args: {
    status: number
    title: string
    detail?: string
    errors?: Record<string, string[]>
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
  totalElements: number
  totalPages: number
  number: number
  size: number
}
