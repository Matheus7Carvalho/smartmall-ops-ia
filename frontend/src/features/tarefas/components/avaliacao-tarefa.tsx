import { CheckIcon, Loader2Icon, UndoIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { LimitedTextarea } from '@/components/shared/limited-textarea'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { mensagemDeErro } from '@/lib/cadastro'
import { useAprovarTarefa, useReprovarTarefa } from '../hooks'
import { LIMITE } from '../limites'

type Modo = 'aprovar' | 'reprovar'

const textos: Record<Modo, { titulo: string; descricao: string; campo: string; botao: string; sucesso: string }> = {
  aprovar: {
    titulo: 'Aprovar e concluir?',
    descricao: 'A tarefa será concluída.',
    campo: 'Observação',
    botao: 'Aprovar',
    sucesso: 'Tarefa aprovada e concluída.',
  },
  reprovar: {
    titulo: 'Reprovar tarefa?',
    descricao: 'A tarefa volta para execução com o mesmo responsável.',
    campo: 'Motivo',
    botao: 'Reprovar',
    sucesso: 'Tarefa reprovada.',
  },
}

type AvaliacaoTarefaProps = {
  tarefaId: string
  /** Depois de avaliar (ex.: voltar para a fila de análise). */
  onAvaliada: () => void
}

/** Barra fixa de avaliação (Administrador e Supervisor), com tarefa em análise. */
export function AvaliacaoTarefa({ tarefaId, onAvaliada }: AvaliacaoTarefaProps) {
  const [modo, setModo] = useState<Modo>()
  const [texto, setTexto] = useState('')
  const aprovar = useAprovarTarefa(tarefaId)
  const reprovar = useReprovarTarefa(tarefaId)
  const mutacao = modo === 'reprovar' ? reprovar : aprovar
  const t = modo && textos[modo]

  const abrir = (novo: Modo) => {
    setTexto('')
    mutacao.reset()
    setModo(novo)
  }

  const confirmar = (e: FormEvent) => {
    e.preventDefault()
    if (!modo) return
    mutacao.mutate(texto.trim(), {
      onSuccess: () => {
        toast.success(textos[modo].sucesso)
        setModo(undefined)
        onAvaliada()
      },
    })
  }

  return (
    <>
      <div className="sticky bottom-0 z-20 -mx-4 flex justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <Button type="button" variant="outline" onClick={() => abrir('reprovar')}>
          <UndoIcon aria-hidden />
          Reprovar
        </Button>
        <Button type="button" onClick={() => abrir('aprovar')}>
          <CheckIcon aria-hidden />
          Aprovar
        </Button>
      </div>

      <AlertDialog open={!!modo} onOpenChange={(aberto) => !aberto && setModo(undefined)}>
        <AlertDialogContent>
          {t && (
            <form onSubmit={confirmar} className="grid gap-4" aria-label={t.titulo}>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.titulo}</AlertDialogTitle>
                <AlertDialogDescription>{t.descricao}</AlertDialogDescription>
              </AlertDialogHeader>
              <Field className="gap-1.5">
                <FieldLabel htmlFor="avaliacao-texto">{t.campo}</FieldLabel>
                <LimitedTextarea
                  id="avaliacao-texto"
                  rows={3}
                  required={modo === 'reprovar'}
                  maxLength={LIMITE.observacao}
                  length={texto.length}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                />
              </Field>
              {mutacao.error && <p className="text-sm text-destructive">{mensagemDeErro(mutacao.error, 'Não foi possível concluir.')}</p>}
              <AlertDialogFooter>
                <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
                <Button type="submit" variant={modo === 'reprovar' ? 'destructive' : 'default'} disabled={mutacao.isPending}>
                  {mutacao.isPending && <Loader2Icon className="animate-spin" aria-hidden />}
                  {t.botao}
                </Button>
              </AlertDialogFooter>
            </form>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
