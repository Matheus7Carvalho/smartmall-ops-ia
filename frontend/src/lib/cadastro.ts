import type { UseMutationResult } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router'
import { useVoltarPara } from '@/lib/navegacao'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'

export function mensagemDeErro(erro: unknown, padrao: string) {
  if (!erro) return undefined
  return erro instanceof ApiError ? erro.message : padrao
}

type Opcoes<TForm, TReq, TRes extends { id: string }> = {
  /** Id do registro em edição; ausente em cadastro novo. */
  id: string | undefined
  /** Rota da listagem (Cancelar volta para ela). */
  lista: string
  mutacao: UseMutationResult<TRes, Error, TReq>
  paraRequisicao: (dados: TForm) => TReq
  paraFormulario: (salvo: TRes) => TForm
  mensagemSucesso: string
}

/**
 * Ações padrão de uma tela de cadastro/edição para o CadastroForm:
 * salvar e permanecer na tela; cadastro novo passa a ser edição do registro criado.
 */
export function useAcoesCadastro<TForm, TReq, TRes extends { id: string }>({
  id,
  lista,
  mutacao,
  paraRequisicao,
  paraFormulario,
  mensagemSucesso,
}: Opcoes<TForm, TReq, TRes>) {
  const navigate = useNavigate()
  const location = useLocation()
  // Cancelar/Voltar retorna para onde o usuário estava (agenda, lista filtrada…); sem origem, para a lista.
  const voltarPara = useVoltarPara(lista)

  return {
    salvando: mutacao.isPending,
    erro: mensagemDeErro(mutacao.error, 'Não foi possível salvar.'),
    onCancel: () => navigate(voltarPara),
    onSubmit: async (dados: TForm) => {
      try {
        return paraFormulario(await mutacao.mutateAsync(paraRequisicao(dados)))
      } catch {
        return undefined // o erro aparece no formulário
      }
    },
    onSalvo: () => {
      toast.success(mensagemSucesso)
      // Um cadastro novo passa a ser edição do registro criado, para o próximo Salvar não duplicar.
      // O estado (origem) é mantido, para o Cancelar continuar voltando ao mesmo lugar.
      if (!id && mutacao.data) navigate(`${lista}/${mutacao.data.id}`, { replace: true, state: location.state })
    },
  }
}
