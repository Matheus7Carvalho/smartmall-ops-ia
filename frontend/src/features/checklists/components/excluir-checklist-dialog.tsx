import { ExcluirDialog } from '@/components/shared/excluir-dialog'
import { useExcluirChecklist } from '../hooks'
import type { Checklist } from '../types'

export function ExcluirChecklistDialog({ checklist, onClose }: { checklist: Checklist | null; onClose: () => void }) {
  return (
    <ExcluirDialog
      registro={checklist}
      titulo="Excluir modelo de checklist?"
      mensagemSucesso="Modelo de checklist excluído."
      mutacao={useExcluirChecklist()}
      onClose={onClose}
    />
  )
}
