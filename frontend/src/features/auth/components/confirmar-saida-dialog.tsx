import { ConfirmDialog } from '@/components/shared/confirm-dialog'

type ConfirmarSaidaDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ConfirmarSaidaDialog(props: ConfirmarSaidaDialogProps) {
  return <ConfirmDialog {...props} title="Sair do sistema?" confirmLabel="Sair" />
}
