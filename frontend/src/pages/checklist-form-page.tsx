import { useParams } from 'react-router'
import { PageHeader } from '@/components/shared/page-header'
import { RegistroLoader } from '@/components/shared/registro-loader'
import { ChecklistForm } from '@/features/checklists/components/checklist-form'
import { useChecklist, useSalvarChecklist } from '@/features/checklists/hooks'
import { paraFormulario, paraRequisicao } from '@/features/checklists/schemas'
import { useAcoesCadastro } from '@/lib/cadastro'

export function ChecklistFormPage() {
  const { id } = useParams()
  const checklist = useChecklist(id)
  const acoes = useAcoesCadastro({
    id,
    lista: '/planejamento/modelos-checklist',
    mutacao: useSalvarChecklist(id),
    paraRequisicao,
    paraFormulario,
    mensagemSucesso: 'Modelo de checklist salvo.',
  })

  return (
    <>
      <PageHeader title={id ? 'Editar modelo de checklist' : 'Novo modelo de checklist'} />
      <RegistroLoader edicao={!!id} consulta={checklist} naoEncontrado="Modelo de checklist não encontrado.">
        <ChecklistForm key={checklist.data?.id ?? 'novo'} defaultValues={paraFormulario(checklist.data)} {...acoes} />
      </RegistroLoader>
    </>
  )
}
