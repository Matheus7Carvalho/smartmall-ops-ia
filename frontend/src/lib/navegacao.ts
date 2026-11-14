import { useLocation, type Location } from 'react-router'

/**
 * Origem da navegação: telas de cadastro voltam para onde o usuário estava
 * (agenda, lista com filtros etc.), não para uma rota fixa.
 */
export type EstadoOrigem = { voltarPara?: string }

/** Estado a passar em <Link state={...}> / navigate(..., { state }) a partir da tela atual. */
export function origemDe(location: Pick<Location, 'pathname' | 'search'>): EstadoOrigem {
  return { voltarPara: `${location.pathname}${location.search}` }
}

/** Estado para links que saem da tela atual (preserva filtros na volta). */
export function useOrigemAtual(): EstadoOrigem {
  return origemDe(useLocation())
}

/** Para onde voltar a partir da tela atual; `padrao` quando o usuário chegou por URL direta. */
export function useVoltarPara(padrao: string) {
  const estado = useLocation().state as EstadoOrigem | null
  return estado?.voltarPara ?? padrao
}
