import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { LimitedTextarea } from '@/components/shared/limited-textarea'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { mensagemDeErro } from '@/lib/cadastro'
import { useArquivarChamado } from '../hooks'
import { LIMITE_CHAMADO } from '../limites'
import type { Chamado } from '../types'

export function ChamadoArquivar({ chamado }: { chamado: Chamado }) {
  const [motivo, setMotivo] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const arquivar = useArquivarChamado(chamado.id)

  const aoConfirmar = () => {
    const motivoConfirmado = motivo.trim()
    setConfirmando(false)
    arquivar.mutate({ motivo: motivoConfirmado }, {
      onSuccess: () => { setMotivo(''); toast.success('Chamado arquivado.') },
      onError: (erro) => toast.error(mensagemDeErro(erro, 'Não foi possível arquivar o chamado.')),
    })
  }

  return (
    <section aria-labelledby="titulo-arquivar" className="rounded-lg border p-4 sm:p-5">
      <h2 id="titulo-arquivar" className="text-lg font-semibold">Arquivar chamado</h2>
      <p className="mt-1 text-sm text-muted-foreground">Use quando o relato não deve gerar tarefa. Registre o motivo para a equipe interna.</p>
      <Field className="mt-4 gap-1.5">
        <FieldLabel htmlFor="chamado-motivo">Motivo do arquivamento</FieldLabel>
        <LimitedTextarea id="chamado-motivo" maxLength={LIMITE_CHAMADO.motivoArquivamento} length={motivo.length} rows={3} value={motivo} onChange={(evento) => setMotivo(evento.target.value)} />
      </Field>
      <Button type="button" variant="outline" className="mt-4" disabled={!motivo.trim() || arquivar.isPending} onClick={() => setConfirmando(true)}>{arquivar.isPending ? 'Arquivando...' : 'Revisar arquivamento'}</Button>
      <ConfirmDialog
        open={confirmando}
        onOpenChange={setConfirmando}
        title="Arquivar este chamado?"
        description="O relato ficará registrado e não criará uma tarefa."
        confirmLabel="Arquivar"
        destructive
        onConfirm={aoConfirmar}
      />
    </section>
  )
}
