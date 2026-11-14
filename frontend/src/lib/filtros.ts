import { useSearchParams } from 'react-router'

/**
 * Filtros de listagem guardados na URL (?nome=…&categoria=…):
 * sobrevivem ao recarregar e ao voltar de um cadastro (a origem inclui a query string).
 * `limparAoAlterar` remove parâmetros dependentes, como a página atual de uma lista paginada.
 */
export function useFiltrosUrl<K extends string>(chaves: readonly K[], limparAoAlterar: readonly string[] = []) {
  const [params, setParams] = useSearchParams()
  const valores = Object.fromEntries(chaves.map((k) => [k, params.get(k) ?? ''])) as Record<K, string>

  /**
   * Aplica várias mudanças de uma vez. Parte da URL atual (window.location), e não do updater do
   * setSearchParams: este recebe os parâmetros da última renderização, e duas chamadas seguidas
   * antes de renderizar fariam a segunda desfazer a primeira.
   */
  const atualizar = (mudancas: Partial<Record<K, string>>) => {
    const proximo = new URLSearchParams(window.location.search)
    for (const [chave, valor] of Object.entries(mudancas) as [K, string | undefined][]) {
      if (valor) proximo.set(chave, valor)
      else proximo.delete(chave)
    }
    for (const chave of limparAoAlterar) proximo.delete(chave)
    setParams(proximo, { replace: true })
  }

  const definir = (chave: K, valor: string) => atualizar({ [chave]: valor } as Partial<Record<K, string>>)

  /** Limpa as chaves informadas (padrão: todas deste hook). */
  const limpar = (somente: readonly K[] = chaves) => atualizar(Object.fromEntries(somente.map((k) => [k, ''])) as Partial<Record<K, string>>)

  return { valores, definir, atualizar, limpar, ativos: chaves.filter((k) => valores[k]).length }
}

/** Comparação de texto sem diferenciar maiúsculas nem acentos ("climatizacao" encontra "Climatização"). */
export function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

export function contem(texto: string | null | undefined, busca: string) {
  return !busca || normalizar(texto ?? '').includes(normalizar(busca))
}
