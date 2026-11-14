import { ArrowLeftIcon, FileQuestionIcon } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChamadoAprovacaoForm } from '@/features/chamados/components/chamado-aprovacao-form'
import { ChamadoArquivar } from '@/features/chamados/components/chamado-arquivar'
import { ChamadoMidia } from '@/features/chamados/components/chamado-midia'
import { useChamado } from '@/features/chamados/hooks'
import { prioridadeChamadoLabel, statusChamadoInfo, tipoChamadoLabel, type Chamado } from '@/features/chamados/types'
import { useEquipes } from '@/features/equipes/hooks'
import { ApiError } from '@/lib/api'
import { formatar } from '@/lib/datas'
import { useVoltarPara } from '@/lib/navegacao'

function Dado({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm">{children}</dd></div>
}

function DetalheChamado({ chamado }: { chamado: Chamado }) {
  const equipes = useEquipes()
  const equipeSugerida = equipes.data?.find((e) => e.id === chamado.equipeSugeridaId)?.nome
  const equipeConfirmada = equipes.data?.find((e) => e.id === chamado.equipeConfirmadaId)?.nome
  const emTriagem = chamado.status === 'REGISTRADA' || chamado.status === 'EM_ANALISE'
  const podeDecidir = chamado.status === 'EM_ANALISE'

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tom={statusChamadoInfo[chamado.status].tom}>{statusChamadoInfo[chamado.status].rotulo}</StatusBadge>
        <span className="text-sm text-muted-foreground">Recebido em {formatar.data(chamado.criadoEm)} às {formatar.hora(chamado.criadoEm)}</span>
      </div>
      <section aria-labelledby="titulo-relato" className="space-y-4 rounded-lg border p-4 sm:p-5">
        <h2 id="titulo-relato" className="text-lg font-semibold">Relato recebido</h2>
        <p className="whitespace-pre-wrap break-words text-sm">{chamado.descricao}</p>
        <dl className="grid gap-4 border-t pt-4 sm:grid-cols-2">
          <Dado label="Local informado">{chamado.localInformado || 'Não informado'}</Dado>
          <Dado label="Local do QR Code">{chamado.localQrNome || chamado.localQrCodigo || 'QR Code sem local cadastrado'}{chamado.localQrCodigo && chamado.localQrNome && <span className="text-muted-foreground"> · {chamado.localQrCodigo}</span>}</Dado>
          <Dado label="Contato para retorno">{chamado.contato || 'Não informado'}</Dado>
        </dl>
      </section>
      <section aria-labelledby="titulo-midia" className="space-y-3 rounded-lg border p-4 sm:p-5">
        <h2 id="titulo-midia" className="text-lg font-semibold">Foto ou vídeo</h2>
        <ChamadoMidia key={chamado.id} chamado={chamado} />
      </section>
      <section aria-labelledby="titulo-classificacao" className="space-y-3 rounded-lg border p-4 sm:p-5">
        <h2 id="titulo-classificacao" className="text-lg font-semibold">Classificação</h2>
        {emTriagem && <p className="text-sm text-muted-foreground">As sugestões ajudam na triagem e precisam de confirmação humana.</p>}
        <dl className="grid gap-4 sm:grid-cols-3">
          <Dado label={emTriagem ? 'Tipo sugerido' : 'Tipo confirmado'}>{emTriagem ? (chamado.tipoSugerido ? tipoChamadoLabel[chamado.tipoSugerido] : 'Sem sugestão') : (chamado.tipoConfirmado ? tipoChamadoLabel[chamado.tipoConfirmado] : 'Não informado')}</Dado>
          <Dado label={emTriagem ? 'Prioridade sugerida' : 'Prioridade confirmada'}>{emTriagem ? (chamado.prioridadeSugerida ? prioridadeChamadoLabel[chamado.prioridadeSugerida] : 'Sem sugestão') : (chamado.prioridadeConfirmada ? prioridadeChamadoLabel[chamado.prioridadeConfirmada] : 'Não informada')}</Dado>
          <Dado label={emTriagem ? 'Equipe sugerida' : 'Equipe confirmada'}>{emTriagem ? (equipeSugerida || (chamado.equipeSugeridaId ? 'Equipe não encontrada' : 'Sem sugestão')) : (equipeConfirmada || 'Não informada')}</Dado>
        </dl>
      </section>
      {podeDecidir && <div className="grid gap-5 xl:grid-cols-2"><ChamadoAprovacaoForm chamado={chamado} /><ChamadoArquivar chamado={chamado} /></div>}
      {chamado.status === 'REGISTRADA' && <p className="rounded-lg border p-4 text-sm text-muted-foreground">Aguardando triagem automática.</p>}
      {chamado.status === 'APROVADA' && chamado.tarefaId && <Button asChild variant="outline"><Link to={`/tarefas/${chamado.tarefaId}`}>Abrir tarefa criada</Link></Button>}
      {chamado.status === 'ARQUIVADA' && <section className="rounded-lg border p-4 sm:p-5"><h2 className="font-semibold">Motivo do arquivamento</h2><p className="mt-2 whitespace-pre-wrap break-words text-sm">{chamado.motivoArquivamento || 'Não informado'}</p></section>}
      {chamado.historico.length > 0 && (
        <section aria-labelledby="titulo-historico" className="rounded-lg border p-4 sm:p-5">
          <h2 id="titulo-historico" className="text-lg font-semibold">Histórico</h2>
          <ol className="mt-3 space-y-3">
            {chamado.historico.map((item, indice) => (
              <li key={`${item.dataHora}-${indice}`} className="border-l-2 pl-3 text-sm">
                <p className="font-medium">{item.acao === 'TRIADA' ? 'Sugestões geradas' : statusChamadoInfo[item.statusResultante].rotulo}</p>
                <p className="text-xs text-muted-foreground">{formatar.data(item.dataHora)} · {formatar.hora(item.dataHora)}</p>
                {item.detalhe && <p className="mt-1 whitespace-pre-wrap break-words">{item.detalhe}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}

export function ChamadoPage() {
  const { id } = useParams()
  const consulta = useChamado(id)
  const voltarPara = useVoltarPara('/chamados')

  return (
    <>
      <PageHeader title={consulta.data ? `Chamado ${consulta.data.protocolo}` : 'Chamado externo'} actions={<Button asChild variant="outline" size="sm"><Link to={voltarPara}><ArrowLeftIcon aria-hidden /> Voltar à fila</Link></Button>} />
      {consulta.isPending && <Skeleton className="h-72 w-full" />}
      {consulta.isError && (consulta.error instanceof ApiError && consulta.error.status === 404 ? <EmptyState title="Chamado não encontrado" icon={FileQuestionIcon} /> : <ErrorState onRetry={() => consulta.refetch()} />)}
      {consulta.data && <DetalheChamado chamado={consulta.data} />}
    </>
  )
}
