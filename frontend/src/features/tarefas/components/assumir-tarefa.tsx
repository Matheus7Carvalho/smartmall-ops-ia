import { HandIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { mensagemDeErro } from '@/lib/cadastro'
import { useAssumirTarefa } from '../hooks'

/** Membro da equipe assume a tarefa e passa a ser o responsável. */
export function AssumirTarefa({ tarefaId }: { tarefaId: string }) {
  const [confirmando, setConfirmando] = useState(false)
  const assumir = useAssumirTarefa(tarefaId)

  return (
    <>
      <Button disabled={assumir.isPending} onClick={() => setConfirmando(true)}>
        <HandIcon aria-hidden />
        Assumir tarefa
      </Button>
      <ConfirmDialog
        open={confirmando}
        onOpenChange={setConfirmando}
        title="Assumir esta tarefa?"
        description="Você será o responsável pela execução."
        confirmLabel="Assumir"
        onConfirm={() =>
          assumir.mutate(undefined, {
            onSuccess: () => toast.success('Tarefa assumida.'),
            onError: (e) => toast.error(mensagemDeErro(e, 'Não foi possível assumir a tarefa.')),
          })
        }
      />
    </>
  )
}
