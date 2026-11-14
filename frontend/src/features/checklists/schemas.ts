import { z } from 'zod'
import { LIMITE } from './limites'
import { MAX_CARACTERES_TEXTO, MAX_ITENS, type Checklist, type ChecklistRequest } from './types'

const itemSchema = z
  .object({
    pergunta: z.string().trim().min(1, 'Informe a pergunta.').max(LIMITE.pergunta, `Use até ${LIMITE.pergunta} caracteres.`),
    tipoResposta: z.enum(['SIM_NAO', 'TEXTO', 'NUMERO'], { error: 'Selecione o tipo.' }),
    obrigatorio: z.boolean(),
    maxCaracteres: z.number().int().max(MAX_CARACTERES_TEXTO).optional(),
  })
  .superRefine((item, ctx) => {
    if (item.tipoResposta !== 'TEXTO') return
    const max = item.maxCaracteres
    if (max === undefined || Number.isNaN(max) || max < 1 || max > MAX_CARACTERES_TEXTO) {
      ctx.addIssue({ code: 'custom', path: ['maxCaracteres'], message: `Informe de 1 a ${MAX_CARACTERES_TEXTO}.` })
    }
  })

export const checklistSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome.').max(LIMITE.nome, `Use até ${LIMITE.nome} caracteres.`),
  itens: z.array(itemSchema).min(1, 'Adicione pelo menos um item.').max(MAX_ITENS, `Use até ${MAX_ITENS} itens.`),
})

export type ChecklistForm = z.infer<typeof checklistSchema>
export type ChecklistItemForm = ChecklistForm['itens'][number]

export function novoItem(): ChecklistItemForm {
  return { pergunta: '', tipoResposta: 'SIM_NAO', obrigatorio: true, maxCaracteres: undefined }
}

export function paraFormulario(checklist?: Checklist): ChecklistForm {
  if (!checklist) return { nome: '', itens: [novoItem()] }
  return {
    nome: checklist.nome,
    itens: checklist.itens.map((item) => ({
      pergunta: item.pergunta,
      tipoResposta: item.tipoResposta,
      obrigatorio: item.obrigatorio,
      maxCaracteres: item.maxCaracteres ?? undefined,
    })),
  }
}

export function paraRequisicao(form: ChecklistForm): ChecklistRequest {
  return {
    nome: form.nome,
    itens: form.itens.map((item) => ({
      ...item,
      maxCaracteres: item.tipoResposta === 'TEXTO' ? item.maxCaracteres : undefined,
    })),
  }
}
