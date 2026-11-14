import { UndoIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { formatar } from '@/lib/datas'
import type { TarefaDetalhe } from '../types'

/** Tarefa devolvida pela avaliação: o motivo fica no topo, à vista de quem vai corrigir. */
export function AvisoReprovacao({ detalhe }: { detalhe: TarefaDetalhe }) {
  const ultimo = detalhe.historico.at(-1)
  if (detalhe.tarefa.status !== 'EM_EXECUCAO' || ultimo?.acao !== 'REPROVADA') return null
  return (
    <Alert className="border-destructive/40 bg-destructive/5" aria-label="Reprovação">
      <UndoIcon aria-hidden className="text-destructive" />
      <AlertTitle>
        Reprovada por {ultimo.usuario.nome} em {formatar.data(ultimo.dataHora)} {formatar.hora(ultimo.dataHora)}
      </AlertTitle>
      <AlertDescription className="whitespace-pre-line text-foreground">Motivo: {ultimo.observacao}</AlertDescription>
    </Alert>
  )
}
