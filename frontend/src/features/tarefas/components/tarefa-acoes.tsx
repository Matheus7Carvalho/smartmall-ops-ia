import { BanIcon, RotateCcwIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { mensagemDeErro } from '@/lib/cadastro'
import { formatar } from '@/lib/datas'
import { useAgora } from '@/lib/use-agora'
import { faixaHorario } from '../formatos'
import { useCancelarTarefa, useRestaurarTarefa } from '../hooks'
import { tituloTarefa, type Tarefa } from '../types'

/** Cancelar (agendada) e restaurar (cancelada e futura). Só para quem pode gerenciar tarefas. */
export function TarefaAcoes({ tarefa: t }: { tarefa: Tarefa }) {
  const [confirmando, setConfirmando] = useState(false)
  const cancelar = useCancelarTarefa()
  const restaurar = useRestaurarTarefa()
  const agora = useAgora()
  const futura = new Date(t.dataHoraPrevista) > agora
  const titulo = tituloTarefa(t)
  const quando = `${formatar.data(t.dataHoraPrevista)}, ${faixaHorario(t.dataHoraPrevista, t.duracaoMinutos)}`

  const executar = (acao: typeof cancelar, sucesso: string) =>
    acao.mutate(t.id, {
      onSuccess: () => toast.success(sucesso),
      onError: (e) => toast.error(mensagemDeErro(e, 'Não foi possível concluir.')),
    })

  return (
    <>
      {t.status === 'AGENDADA' && (
        <Button variant="ghost" size="icon-sm" className="relative z-10" aria-label={`Cancelar tarefa de ${formatar.data(t.dataHoraPrevista)}`} onClick={() => setConfirmando(true)}>
          <BanIcon aria-hidden />
        </Button>
      )}
      {t.status === 'CANCELADA' && futura && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative z-10"
          aria-label={`Restaurar tarefa de ${formatar.data(t.dataHoraPrevista)}`}
          disabled={restaurar.isPending}
          onClick={() => executar(restaurar, 'Tarefa restaurada.')}
        >
          <RotateCcwIcon aria-hidden />
        </Button>
      )}
      <ConfirmDialog
        open={confirmando}
        onOpenChange={setConfirmando}
        title="Cancelar esta tarefa?"
        description={`${titulo} — ${quando}. O cancelamento afeta apenas esta tarefa.`}
        confirmLabel="Cancelar tarefa"
        destructive
        onConfirm={() => executar(cancelar, 'Tarefa cancelada.')}
      />
    </>
  )
}
