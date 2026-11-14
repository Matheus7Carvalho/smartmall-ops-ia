import { z } from 'zod'
import { deIsoData } from '@/lib/datas'
import { DIAS_MAXIMOS_AUSENCIA, MOTIVOS_AUSENCIA, type AusenciaRequest, type MotivoAusencia } from './disponibilidade'
import { LIMITE } from './limites'
import type { Equipe, EquipeRequest } from './types'

export const equipeSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome.').max(LIMITE.nome, `Use até ${LIMITE.nome} caracteres.`),
  membrosIds: z.array(z.string()).max(LIMITE.membros, `Use até ${LIMITE.membros} membros.`),
})

export type EquipeForm = z.infer<typeof equipeSchema>

export function paraFormulario(e?: Equipe): EquipeForm {
  // Ordenado para que a ordem de marcação não conte como alteração.
  return { nome: e?.nome ?? '', membrosIds: (e?.membros ?? []).map((m) => m.id).sort() }
}

export function paraRequisicao(form: EquipeForm): EquipeRequest {
  return { nome: form.nome, membrosIds: form.membrosIds }
}

const DIA_MS = 24 * 60 * 60 * 1000

/** Mesmas regras do servidor (DisponibilidadeService); a data mínima ("hoje") fica no campo. */
export const ausenciaSchema = z
  .object({
    inicio: z.string().min(1, 'Informe a data inicial.'),
    fim: z.string().min(1, 'Informe a data final.'),
    motivo: z.string().refine((v) => (MOTIVOS_AUSENCIA as string[]).includes(v), 'Informe o motivo.'),
  })
  .refine((d) => !d.inicio || !d.fim || d.fim >= d.inicio, { path: ['fim'], message: 'A data final deve ser igual ou posterior à inicial.' })
  .refine((d) => !d.inicio || !d.fim || Math.round((deIsoData(d.fim).getTime() - deIsoData(d.inicio).getTime()) / DIA_MS) < DIAS_MAXIMOS_AUSENCIA, {
    path: ['fim'],
    message: 'O período máximo é de um ano.',
  })

export type AusenciaForm = z.infer<typeof ausenciaSchema>

export function ausenciaParaRequisicao(usuarioId: string, form: AusenciaForm): AusenciaRequest {
  return { usuarioId, inicio: form.inicio, fim: form.fim, motivo: form.motivo as MotivoAusencia }
}
