import { z } from 'zod'
import { LIMITE } from './limites'
import type { Equipamento, EquipamentoRequest } from './types'

const obrigatorio = (msg: string) => z.string({ error: msg }).min(1, msg)

export const equipamentoSchema = z.object({
  codigo: z.string().trim().min(1, 'Informe o código.').max(LIMITE.codigo, `Use até ${LIMITE.codigo} caracteres.`),
  nome: z.string().trim().min(1, 'Informe o nome.').max(LIMITE.nome, `Use até ${LIMITE.nome} caracteres.`),
  categoria: obrigatorio('Selecione a categoria.'),
  pisoId: obrigatorio('Selecione o piso.'),
  localizacao: z.string().trim().min(1, 'Informe a localização.').max(LIMITE.localizacao, `Use até ${LIMITE.localizacao} caracteres.`),
  condicao: obrigatorio('Selecione a condição.'),
})

export type EquipamentoForm = z.infer<typeof equipamentoSchema>

export function paraFormulario(e?: Equipamento): EquipamentoForm {
  return {
    codigo: e?.codigo ?? '',
    nome: e?.nome ?? '',
    categoria: e?.categoria ?? '',
    pisoId: e?.pisoId ?? '',
    localizacao: e?.localizacao ?? '',
    condicao: e?.condicao ?? 'OPERANDO',
  }
}

export function paraRequisicao(form: EquipamentoForm): EquipamentoRequest {
  return { ...form, codigo: form.codigo.toUpperCase() } as EquipamentoRequest
}
