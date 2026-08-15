export interface ApiProblem {
  type: string
  title: string
  status: number
  detail: string
  code: string
  fieldErrors?: Record<string, string[]>
  requestId?: string
}
