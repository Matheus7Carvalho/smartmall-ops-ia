import { useParams } from 'react-router'
import { PageHeader } from '@/components/shared/page-header'
import { RegistroLoader } from '@/components/shared/registro-loader'
import { UsuarioForm } from '@/features/usuarios/components/usuario-form'
import { useSalvarUsuario, useUsuario } from '@/features/usuarios/hooks'
import { paraFormulario, paraRequisicao } from '@/features/usuarios/schemas'
import { useAcoesCadastro } from '@/lib/cadastro'

export function UsuarioFormPage() {
  const { id } = useParams()
  const usuario = useUsuario(id)
  const acoes = useAcoesCadastro({
    id,
    lista: '/cadastros/usuarios',
    mutacao: useSalvarUsuario(id),
    paraRequisicao,
    paraFormulario,
    mensagemSucesso: 'Membro salvo.',
  })

  return (
    <>
      <PageHeader title={id ? 'Editar membro e permissões' : 'Novo membro'} />
      <RegistroLoader edicao={!!id} consulta={usuario} naoEncontrado="Membro não encontrado.">
        <UsuarioForm key={usuario.data?.id ?? 'novo'} edicao={!!id} defaultValues={paraFormulario(usuario.data)} {...acoes} />
      </RegistroLoader>
    </>
  )
}
