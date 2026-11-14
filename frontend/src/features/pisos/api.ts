import { api, type Page } from '@/lib/api'
import type { Piso } from './types'

export const pisosApi = {
  listar: () => api.get<Page<Piso>>('/piso', { sort: 'ordem', size: 50 }).then((page) => page.content),
}
