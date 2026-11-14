import { useParams } from 'react-router'
import { PageHeader } from '@/components/shared/page-header'
import { RegistroLoader } from '@/components/shared/registro-loader'
import { EquipeForm } from '@/features/equipes/components/equipe-form'
import { useEquipe, useSalvarEquipe } from '@/features/equipes/hooks'
import { paraFormulario, paraRequisicao } from '@/features/equipes/schemas'
import { useAcoesCadastro } from '@/lib/cadastro'

export function EquipeFormPage() {
  const { id } = useParams()
  const equipe = useEquipe(id)
  const acoes = useAcoesCadastro({
    id,
    lista: '/cadastros/equipes',
    mutacao: useSalvarEquipe(id),
    paraRequisicao,
    paraFormulario,
    mensagemSucesso: 'Equipe salva.',
  })

  return (
    <>
      <PageHeader title={id ? 'Editar equipe' : 'Nova equipe'} />
      <RegistroLoader edicao={!!id} consulta={equipe} naoEncontrado="Equipe não encontrada.">
        <EquipeForm key={equipe.data?.id ?? 'nova'} defaultValues={paraFormulario(equipe.data)} {...acoes} />
      </RegistroLoader>
    </>
  )
}
