import { ArrowLeftIcon } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { PageHeader } from '@/components/shared/page-header'
import { RegistroLoader } from '@/components/shared/registro-loader'
import { Button } from '@/components/ui/button'
import { useSessao } from '@/features/auth/hooks'
import { temPerfil } from '@/features/auth/permissoes'
import { AvisoReprovacao } from '@/features/tarefas/components/aviso-reprovacao'
import { AssumirTarefa } from '@/features/tarefas/components/assumir-tarefa'
import { AvaliacaoTarefa } from '@/features/tarefas/components/avaliacao-tarefa'
import { ChecklistRespostas } from '@/features/tarefas/components/checklist-respostas'
import { ExecucaoForm } from '@/features/tarefas/components/execucao-form'
import { HistoricoTarefa } from '@/features/tarefas/components/historico-tarefa'
import { TarefaResumo } from '@/features/tarefas/components/tarefa-resumo'
import { useTarefa } from '@/features/tarefas/hooks'
import { tituloTarefa } from '@/features/tarefas/types'
import { useVoltarPara } from '@/lib/navegacao'

/** Tarefa: dados, execução pelo responsável, avaliação pela gestão e histórico. */
export function TarefaPage() {
  const { id = '' } = useParams()
  const consulta = useTarefa(id)
  const { data: usuario } = useSessao()
  const gestao = temPerfil(usuario?.perfil, ['ADMINISTRADOR', 'SUPERVISOR'])
  const navigate = useNavigate()
  const voltarPara = useVoltarPara('/tarefas')
  const voltar = () => navigate(voltarPara)
  const detalhe = consulta.data
  const titulo = detalhe ? tituloTarefa(detalhe.tarefa) : 'Tarefa'

  return (
    <>
      <PageHeader
        title={titulo}
        actions={
          <>
            {detalhe?.acoes.assumir && <AssumirTarefa tarefaId={id} />}
            {!detalhe?.acoes.executar && (
              <Button variant="outline" onClick={voltar}>
                <ArrowLeftIcon aria-hidden />
                Voltar
              </Button>
            )}
          </>
        }
      />
      <RegistroLoader edicao consulta={consulta} naoEncontrado="Tarefa não encontrada.">
        {detalhe && (
          <div className="grid max-w-6xl gap-6">
            <TarefaResumo tarefa={detalhe.tarefa} podeGerenciar={gestao} />
            <AvisoReprovacao detalhe={detalhe} />
            {detalhe.acoes.executar ? (
              <ExecucaoForm key={detalhe.tarefa.id} detalhe={detalhe} onCancel={voltar} />
            ) : (detalhe.itens.length > 0 || detalhe.observacao ? (
              <ChecklistRespostas itens={detalhe.itens} observacao={detalhe.observacao} />
            ) : null)}
            <HistoricoTarefa detalhe={detalhe} />
            {detalhe.acoes.avaliar && <AvaliacaoTarefa tarefaId={id} onAvaliada={voltar} />}
          </div>
        )}
      </RegistroLoader>
    </>
  )
}
