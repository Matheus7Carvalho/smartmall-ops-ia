import { z } from 'zod'
import { LIMITE } from './limites'
import type { ExecucaoRequest, ItemTarefa, TarefaDetalhe } from './types'

export type ExecucaoValores = {
  observacao: string
  /** Mesma ordem de `itens`. SIM_NAO: "SIM"/"NAO"/""; NUMERO e TEXTO: texto do campo. */
  respostas: { itemId: string; resposta: string }[]
}

/** Valida o tipo e o tamanho de cada resposta. Obrigatórios só são exigidos ao enviar (faltandoParaEnviar). */
export function execucaoSchema(itens: ItemTarefa[]) {
  return z
    .object({
      observacao: z.string().max(LIMITE.observacao, `No máximo ${LIMITE.observacao} caracteres.`),
      respostas: z.array(z.object({ itemId: z.string(), resposta: z.string() })).max(itens.length),
    })
    .superRefine((valores, ctx) => {
      valores.respostas.forEach(({ resposta }, i) => {
        const item = itens[i]
        const valor = resposta.trim()
        if (!item || !valor) return
        const caminho = ['respostas', i, 'resposta']
        if (item.tipoResposta === 'NUMERO') {
          const numero = Number(valor.replace(',', '.'))
          if (!Number.isFinite(numero)) ctx.addIssue({ code: 'custom', path: caminho, message: 'Informe um número.' })
          else if (Math.abs(numero) > LIMITE.numero) ctx.addIssue({ code: 'custom', path: caminho, message: 'Número fora do limite.' })
        }
        const max = maxCaracteres(item)
        if (item.tipoResposta === 'TEXTO' && valor.length > max) {
          ctx.addIssue({ code: 'custom', path: caminho, message: `No máximo ${max} caracteres.` })
        }
      })
    })
}

export function maxCaracteres(item: ItemTarefa) {
  return item.maxCaracteres ?? LIMITE.respostaTexto
}

/** Índices dos itens obrigatórios sem resposta. */
export function faltandoParaEnviar(itens: ItemTarefa[], valores: ExecucaoValores) {
  return itens.flatMap((item, i) => (item.obrigatorio && !valores.respostas[i]?.resposta.trim() ? [i] : []))
}

export function paraFormulario(detalhe: TarefaDetalhe): ExecucaoValores {
  return {
    observacao: detalhe.observacao ?? '',
    respostas: detalhe.itens.map((item) => ({ itemId: item.id, resposta: item.resposta ?? '' })),
  }
}

export function paraRequisicao(valores: ExecucaoValores): ExecucaoRequest {
  return {
    observacao: valores.observacao.trim(),
    respostas: valores.respostas.map(({ itemId, resposta }) => ({ itemId, resposta: resposta.trim() })),
  }
}
