import { z } from 'zod'
import { LIMITE } from './limites'
import type { ManutencaoProgramada, ManutencaoProgramadaRequest } from './types'

const selecione = (msg: string) => z.string({ error: msg }).min(1, msg)
const inteiro = (min: number, max: number, msg: string) =>
  z.number({ error: msg }).int(msg).min(min, msg).max(max, msg)

export const programadaSchema = z
  .object({
    equipamentoId: selecione('Selecione o equipamento.'),
    checklistId: selecione('Selecione o modelo de checklist.'),
    equipeId: selecione('Selecione a equipe.'),
    frequencia: z.enum(['UNICA', 'DIARIA', 'SEMANAL', 'MENSAL'], { error: 'Selecione a frequência.' }),
    intervalo: inteiro(LIMITE.intervalo.min, LIMITE.intervalo.max, `Informe de ${LIMITE.intervalo.min} a ${LIMITE.intervalo.max}.`),
    dataInicio: z.string().min(1, 'Informe a data de início.'),
    horario: z.string().regex(/^\d{2}:\d{2}$/, 'Informe o horário.'),
    duracaoMinutos: inteiro(LIMITE.duracao.min, LIMITE.duracao.max, `Informe de ${LIMITE.duracao.min} a ${LIMITE.duracao.max} minutos.`),
    dataFim: z.string(),
    observacoes: z.string().max(LIMITE.observacoes, `Use até ${LIMITE.observacoes} caracteres.`),
  })
  .superRefine((p, ctx) => {
    if (p.frequencia !== 'UNICA' && p.dataFim && p.dataInicio && p.dataFim < p.dataInicio) {
      ctx.addIssue({ code: 'custom', path: ['dataFim'], message: 'O término não pode ser antes do início.' })
    }
  })

export type ProgramadaFormValores = z.infer<typeof programadaSchema>

export function paraFormulario(p?: ManutencaoProgramada): ProgramadaFormValores {
  return {
    equipamentoId: p?.equipamento.id ?? '',
    checklistId: p?.checklist.id ?? '',
    equipeId: p?.equipe.id ?? '',
    frequencia: p?.frequencia ?? 'SEMANAL',
    intervalo: p?.intervalo ?? 1,
    dataInicio: p?.dataInicio ?? '',
    horario: p?.horario ?? '08:00',
    duracaoMinutos: p?.duracaoMinutos ?? 60,
    dataFim: p?.dataFim ?? '',
    observacoes: p?.observacoes ?? '',
  }
}

export function paraRequisicao(f: ProgramadaFormValores): ManutencaoProgramadaRequest {
  const unica = f.frequencia === 'UNICA'
  return {
    ...f,
    intervalo: unica ? 1 : f.intervalo,
    dataFim: unica || !f.dataFim ? null : f.dataFim,
    observacoes: f.observacoes.trim() || null,
  }
}
