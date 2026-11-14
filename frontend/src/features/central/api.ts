import { api } from '@/lib/api'
import type { ResumoCentral } from './types'

export const centralApi = {
  resumo: () => api.get<ResumoCentral>('/central/resumo'),
}
