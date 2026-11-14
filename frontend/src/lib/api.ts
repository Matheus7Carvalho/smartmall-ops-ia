/** Espelha ResponseError do backend. */
export type ApiErrorBody = {
  status: number
  message: string
  errors?: { field: string; message: string }[]
}

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: ApiErrorBody['errors']

  constructor(body: ApiErrorBody) {
    super(body.message)
    this.status = body.status
    this.fieldErrors = body.errors
  }
}

/** Espelha Page serializado via DTO (Spring Data). */
export type Page<T> = {
  content: T[]
  page: { size: number; number: number; totalElements: number; totalPages: number }
}

type QueryParams = Record<string, string | number | boolean | undefined>

function buildUrl(path: string, params?: QueryParams) {
  const url = new URL(`/api${path}`, window.location.origin)
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value))
  })
  return url
}

async function request<T>(method: string, path: string, body?: unknown, params?: QueryParams, extraHeaders?: Record<string, string>): Promise<T> {
  let response: Response
  // FormData (upload): o navegador define o Content-Type com o boundary do multipart.
  const formulario = body instanceof FormData
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers: { ...(body && !formulario ? { 'Content-Type': 'application/json' } : {}), ...extraHeaders },
      body: formulario ? body : body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError({ status: 0, message: 'Servidor indisponível.' })
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new ApiError(data ?? { status: response.status, message: 'Falha na requisição.' })
  }

  return response.status === 204 ? (undefined as T) : response.json()
}

export const api = {
  get: <T>(path: string, params?: QueryParams) => request<T>('GET', path, undefined, params),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  delete: <T = void>(path: string) => request<T>('DELETE', path),
  upload: <T>(path: string, dados: FormData, headers?: Record<string, string>) => request<T>('POST', path, dados, undefined, headers),
}
