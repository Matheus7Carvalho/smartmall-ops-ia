import { useParams } from 'react-router'
import { PageHeader } from '@/components/shared/page-header'
import { RegistroLoader } from '@/components/shared/registro-loader'
import { StatusBadge } from '@/components/shared/status-badge'
import { ManutencaoProgramadaForm } from '@/features/manutencao-programada/components/manutencao-programada-form'
import { ProximasTarefas } from '@/features/manutencao-programada/components/proximas-tarefas'
import { useManutencaoProgramada, useSalvarManutencaoProgramada } from '@/features/manutencao-programada/hooks'
import { paraFormulario, paraRequisicao } from '@/features/manutencao-programada/schemas'
import { useAcoesCadastro } from '@/lib/cadastro'

export const LISTA_PROGRAMADAS = '/planejamento/manutencoes-programadas'

export function ManutencaoProgramadaFormPage() {
  const { id } = useParams()
  const programada = useManutencaoProgramada(id)
  const encerrada = programada.data?.ativo === false
  const acoes = useAcoesCadastro({
    id,
    lista: LISTA_PROGRAMADAS,
    mutacao: useSalvarManutencaoProgramada(id),
    paraRequisicao,
    paraFormulario,
    mensagemSucesso: 'Manutenção programada salva.',
  })

  const titulo = !id ? 'Programar manutenção' : encerrada ? 'Manutenção programada' : 'Editar manutenção programada'

  return (
    <>
      <PageHeader title={titulo} actions={encerrada && <StatusBadge tom="neutro">Encerrada</StatusBadge>} />
      <RegistroLoader edicao={!!id} consulta={programada} naoEncontrado="Manutenção programada não encontrada.">
        {/* Em edição, as próximas tarefas ocupam a coluna da direita em telas largas. */}
        <div className={id ? 'grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]' : undefined}>
          <ManutencaoProgramadaForm
            key={programada.data?.id ?? 'nova'}
            defaultValues={paraFormulario(programada.data)}
            novo={!id}
            somenteLeitura={encerrada}
            {...acoes}
          />
          {id && programada.data && <ProximasTarefas manutencaoProgramadaId={id} />}
        </div>
      </RegistroLoader>
    </>
  )
}
