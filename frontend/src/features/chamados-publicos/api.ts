import { api } from '@/lib/api'
import type { ChamadoPublicoCriado, ChamadoPublicoDados, LocalPublico } from './types'

export const chamadosPublicosApi = {
  local: (codigo: string) => api.get<LocalPublico>(`/publico/local/${encodeURIComponent(codigo)}`),
  enviar: (dados: ChamadoPublicoDados, midia: File | null) => {
    const formulario = new FormData()
    formulario.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
    if (midia) formulario.append('midia', midia, midia.name)
    const headers = dados.codigoLocal ? { 'X-Local-Codigo': dados.codigoLocal } : undefined
    return api.upload<ChamadoPublicoCriado>('/publico/chamado', formulario, headers)
  },
}
