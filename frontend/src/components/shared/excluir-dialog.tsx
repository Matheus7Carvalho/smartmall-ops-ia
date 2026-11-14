import type { UseMutationResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mensagemDeErro } from '@/lib/cadastro'
import { ConfirmDialog } from './confirm-dialog'

type ExcluirDialogProps = {
  /** Registro a excluir; null fecha o diálogo. */
  registro: { id: string; nome: string } | null
  titulo: string
  mensagemSucesso: string
  mutacao: UseMutationResult<void, Error, string>
  onClose: () => void
}

/** Confirmação de exclusão com o nome do registro; mostra o erro do servidor (ex.: registro em uso). */
export function ExcluirDialog({ registro, titulo, mensagemSucesso, mutacao, onClose }: ExcluirDialogProps) {
  const confirmar = () => {
    if (!registro) return
    mutacao.mutate(registro.id, {
      onSuccess: () => toast.success(mensagemSucesso),
      onError: (e) => toast.error(mensagemDeErro(e, 'Não foi possível excluir.')),
    })
    onClose()
  }

  return (
    <ConfirmDialog
      open={!!registro}
      onOpenChange={(open) => !open && onClose()}
      title={titulo}
      description={registro?.nome}
      confirmLabel="Excluir"
      destructive
      onConfirm={confirmar}
    />
  )
}
