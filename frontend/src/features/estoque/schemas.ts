import { z } from 'zod'
import { LIMITE } from './limites'
import type { ItemEstoque, ItemEstoqueRequest, MovimentacaoRequest } from './types'

const selecione = (msg: string) => z.string({ error: msg }).min(1, msg)
const inteiro = (min: number, max: number, msg: string) => z.number({ error: msg }).int(msg).min(min, msg).max(max, msg)

export const itemSchema = z.object({
  codigo: z.string().trim().min(1, 'Informe o código.').max(LIMITE.codigo, `Use até ${LIMITE.codigo} caracteres.`),
  nome: z.string().trim().min(1, 'Informe o nome.').max(LIMITE.nome, `Use até ${LIMITE.nome} caracteres.`),
  descricao: z.string().max(LIMITE.descricao, `Use até ${LIMITE.descricao} caracteres.`),
  categoria: selecione('Selecione a categoria.'),
  unidade: selecione('Selecione a unidade.'),
  estoqueMinimo: inteiro(LIMITE.minimo.min, LIMITE.minimo.max, `Informe de ${LIMITE.minimo.min} a ${LIMITE.minimo.max}.`),
  localizacao: z.string().max(LIMITE.localizacao, `Use até ${LIMITE.localizacao} caracteres.`),
})

export type ItemForm = z.infer<typeof itemSchema>

export function paraFormulario(i?: ItemEstoque): ItemForm {
  return {
    codigo: i?.codigo ?? '',
    nome: i?.nome ?? '',
    descricao: i?.descricao ?? '',
    categoria: i?.categoria ?? '',
    unidade: i?.unidade ?? 'UN',
    estoqueMinimo: i?.estoqueMinimo ?? 0,
    localizacao: i?.localizacao ?? '',
  }
}

export function paraRequisicao(form: ItemForm): ItemEstoqueRequest {
  return { ...form, codigo: form.codigo.toUpperCase() } as ItemEstoqueRequest
}

/** A quantidade da retirada não pode passar do saldo (o servidor confere de novo, com bloqueio). */
export function movimentacaoSchema(saldoMaximo?: number) {
  const max = saldoMaximo ?? LIMITE.quantidade.max
  return z.object({
    quantidade: z
      .number({ error: 'Informe a quantidade.' })
      .int('Informe um número inteiro.')
      .min(LIMITE.quantidade.min, 'A quantidade deve ser maior que zero.')
      .max(max, saldoMaximo === undefined ? `Use até ${max}.` : `Saldo insuficiente: há ${saldoMaximo} disponível.`),
    equipamentoId: z.string(),
    observacao: z.string().max(LIMITE.observacao, `Use até ${LIMITE.observacao} caracteres.`),
  })
}

export type MovimentacaoForm = z.infer<ReturnType<typeof movimentacaoSchema>>

export function movimentacaoParaRequisicao(form: MovimentacaoForm): MovimentacaoRequest {
  return { quantidade: form.quantidade, equipamentoId: form.equipamentoId || undefined, observacao: form.observacao.trim() || undefined }
}
