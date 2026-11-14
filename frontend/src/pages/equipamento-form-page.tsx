import { useParams } from 'react-router'
import { PageHeader } from '@/components/shared/page-header'
import { RegistroLoader } from '@/components/shared/registro-loader'
import { EquipamentoForm } from '@/features/equipamentos/components/equipamento-form'
import { useEquipamento, useSalvarEquipamento } from '@/features/equipamentos/hooks'
import { paraFormulario, paraRequisicao } from '@/features/equipamentos/schemas'
import { useAcoesCadastro } from '@/lib/cadastro'

export function EquipamentoFormPage() {
  const { id } = useParams()
  const equipamento = useEquipamento(id)
  const acoes = useAcoesCadastro({
    id,
    lista: '/cadastros/equipamentos',
    mutacao: useSalvarEquipamento(id),
    paraRequisicao,
    paraFormulario,
    mensagemSucesso: 'Equipamento salvo.',
  })

  return (
    <>
      <PageHeader title={id ? 'Editar equipamento' : 'Novo equipamento'} />
      <RegistroLoader edicao={!!id} consulta={equipamento} naoEncontrado="Equipamento não encontrado.">
        <EquipamentoForm key={equipamento.data?.id ?? 'novo'} defaultValues={paraFormulario(equipamento.data)} {...acoes} />
      </RegistroLoader>
    </>
  )
}
