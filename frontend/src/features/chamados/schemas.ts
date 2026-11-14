import { z } from 'zod'
import { LIMITE_CHAMADO } from './limites'
import type { AprovarChamadoRequest } from './types'

const selecione = (mensagem: string) => z.string({ error: mensagem }).min(1, mensagem)

export const aprovacaoSchema = z.object({
  tipo: z.enum(['PESQUISA', 'RECLAMACAO', 'MANUTENCAO', 'OUTRO'], { error: 'Selecione o tipo.' }),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'], { error: 'Selecione a prioridade.' }),
  equipeId: selecione('Selecione a equipe responsável.'),
  equipamentoId: z.string(),
  checklistId: z.string(),
  dataHoraPrevista: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Informe data e horário.').refine((v) => new Date(v).getTime() > Date.now(), 'Escolha um horário futuro.'),
  duracaoMinutos: z.number({ error: 'Informe a duração.' }).int('Informe minutos inteiros.').min(LIMITE_CHAMADO.duracao.min, `Mínimo de ${LIMITE_CHAMADO.duracao.min} minuto.`).max(LIMITE_CHAMADO.duracao.max, `Máximo de ${LIMITE_CHAMADO.duracao.max} minutos.`),
})

export type AprovacaoFormValores = z.infer<typeof aprovacaoSchema>

export function paraAprovacaoRequest(valores: AprovacaoFormValores): AprovarChamadoRequest {
  return {
    tipo: valores.tipo,
    prioridade: valores.prioridade,
    equipeId: valores.equipeId,
    ...(valores.equipamentoId && valores.equipamentoId !== '__nenhum__' ? { equipamentoId: valores.equipamentoId } : {}),
    ...(valores.checklistId && valores.checklistId !== '__nenhum__' ? { checklistId: valores.checklistId } : {}),
    dataHoraPrevista: valores.dataHoraPrevista,
    duracaoMinutos: valores.duracaoMinutos,
  }
}
