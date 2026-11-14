import type { Tom } from '@/components/shared/status-badge'

export type StatusChamado = 'REGISTRADA' | 'EM_ANALISE' | 'APROVADA' | 'EM_EXECUCAO' | 'ENCERRADA' | 'ARQUIVADA'
export type TipoChamado = 'PESQUISA' | 'RECLAMACAO' | 'MANUTENCAO' | 'OUTRO'
export type PrioridadeChamado = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA'

export const statusChamado: { valor: StatusChamado; rotulo: string; tom: Tom }[] = [
  { valor: 'REGISTRADA', rotulo: 'Registrada', tom: 'info' },
  { valor: 'EM_ANALISE', rotulo: 'Em análise', tom: 'atencao' },
  { valor: 'APROVADA', rotulo: 'Aprovada', tom: 'sucesso' },
  { valor: 'EM_EXECUCAO', rotulo: 'Em execução', tom: 'andamento' },
  { valor: 'ENCERRADA', rotulo: 'Encerrada', tom: 'sucesso' },
  { valor: 'ARQUIVADA', rotulo: 'Arquivada', tom: 'neutro' },
]
export const tiposChamado: { valor: TipoChamado; rotulo: string }[] = [
  { valor: 'PESQUISA', rotulo: 'Pesquisa' },
  { valor: 'RECLAMACAO', rotulo: 'Reclamação' },
  { valor: 'MANUTENCAO', rotulo: 'Manutenção' },
  { valor: 'OUTRO', rotulo: 'Outro' },
]
export const prioridadesChamado: { valor: PrioridadeChamado; rotulo: string }[] = [
  { valor: 'BAIXA', rotulo: 'Baixa' },
  { valor: 'MEDIA', rotulo: 'Média' },
  { valor: 'ALTA', rotulo: 'Alta' },
  { valor: 'CRITICA', rotulo: 'Crítica' },
]

export const statusChamadoInfo = Object.fromEntries(statusChamado.map((s) => [s.valor, s])) as Record<StatusChamado, (typeof statusChamado)[number]>
export const tipoChamadoLabel = Object.fromEntries(tiposChamado.map((t) => [t.valor, t.rotulo])) as Record<TipoChamado, string>
export const prioridadeChamadoLabel = Object.fromEntries(prioridadesChamado.map((p) => [p.valor, p.rotulo])) as Record<PrioridadeChamado, string>

/** Espelha ChamadoResponse nas listagens e no detalhe. */
export type Chamado = {
  id: string
  protocolo: string
  status: StatusChamado
  descricao: string
  localQrCodigo: string | null
  localQrNome: string | null
  localInformado: string
  contato: string | null
  tipoSugerido: TipoChamado | null
  prioridadeSugerida: PrioridadeChamado | null
  equipeSugeridaId: string | null
  tipoConfirmado: TipoChamado | null
  prioridadeConfirmada: PrioridadeChamado | null
  equipeConfirmadaId: string | null
  criadoEm: string
  midia: { id: string; nome: string; tipo: string; tamanhoBytes: number } | null
  tarefaId: string | null
  motivoArquivamento: string | null
  historico: { acao: string; usuarioId: string | null; dataHora: string; statusResultante: StatusChamado; detalhe: string | null }[]
}

export type AprovarChamadoRequest = {
  tipo: TipoChamado
  prioridade: PrioridadeChamado
  equipeId: string
  equipamentoId?: string
  checklistId?: string
  dataHoraPrevista: string
  duracaoMinutos: number
}

export type ArquivarChamadoRequest = { motivo: string }

export function localChamado(chamado: Chamado) {
  return chamado.localInformado || chamado.localQrNome || chamado.localQrCodigo || 'Não informado'
}
