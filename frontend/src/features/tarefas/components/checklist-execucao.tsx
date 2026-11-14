import type { KeyboardEvent } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { LimitedInput } from '@/components/shared/limited-input'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { LIMITE } from '../limites'
import { maxCaracteres, type ExecucaoValores } from '../schemas'
import type { ItemTarefa } from '../types'

const linha = 'grid gap-1.5 px-4 py-2 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] md:items-center md:gap-4'

/** Enter avança para o próximo campo, sem enviar o formulário. */
function avancarComEnter(e: KeyboardEvent<HTMLDivElement>) {
  const alvo = e.target as HTMLElement
  if (e.key !== 'Enter' || !(alvo instanceof HTMLInputElement)) return
  e.preventDefault()
  const campos = [...e.currentTarget.querySelectorAll<HTMLElement>('input:not([type=radio]), input[type=radio]:checked, textarea')]
  const atual = alvo.type === 'radio' ? campos.findIndex((c) => (c as HTMLInputElement).name === alvo.name) : campos.indexOf(alvo)
  campos[atual + 1]?.focus()
}

/** Preenchimento do checklist da tarefa: uma linha por item (pergunta | resposta). */
export function ChecklistExecucao({ itens }: { itens: ItemTarefa[] }) {
  const form = useFormContext<ExecucaoValores>()
  const { errors } = form.formState
  const respostas = useWatch({ control: form.control, name: 'respostas' })

  return (
    <section aria-labelledby="checklist-titulo" className="grid gap-3">
      <h2 id="checklist-titulo" className="text-lg font-semibold">
        Checklist
      </h2>
      <div className="divide-y rounded-lg border" onKeyDown={avancarComEnter}>
        {itens.map((item, i) => {
          const nome = `respostas.${i}.resposta` as const
          const erro = errors.respostas?.[i]?.resposta?.message
          const id = `item-${item.id}`
          const rotulo = (
            <>
              {item.pergunta}
              {item.obrigatorio && (
                <span className="text-destructive" aria-hidden>
                  {' '}
                  *
                </span>
              )}
            </>
          )
          const mensagem = erro && (
            <p id={`${id}-erro`} className="text-sm text-destructive md:col-start-2">
              {erro}
            </p>
          )

          if (item.tipoResposta === 'SIM_NAO') {
            return (
              // A legend fica só para leitores de tela: num fieldset em grade, o navegador a tira do fluxo.
              <fieldset key={item.id} aria-describedby={erro ? `${id}-erro` : undefined}>
                <legend className="sr-only">
                  {item.pergunta}
                  {item.obrigatorio && ' (obrigatório)'}
                </legend>
                <div className={linha}>
                <span className="text-sm" aria-hidden>
                  {rotulo}
                </span>
                <div className="flex gap-2">
                  {(['SIM', 'NAO'] as const).map((valor) => (
                    <label
                      key={valor}
                      className={cn(
                        'flex h-9 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border text-sm has-checked:border-primary has-checked:bg-primary/10 has-focus-visible:ring-2 has-focus-visible:ring-ring',
                        erro && 'border-destructive',
                      )}
                    >
                      <input type="radio" value={valor} className="sr-only" {...form.register(nome)} />
                      {valor === 'SIM' ? 'Sim' : 'Não'}
                    </label>
                  ))}
                </div>
                {mensagem}
                </div>
              </fieldset>
            )
          }

          return (
            <div key={item.id} className={linha}>
              <label htmlFor={id} className="text-sm">
                {rotulo}
              </label>
              {item.tipoResposta === 'NUMERO' ? (
                <Input
                  id={id}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={-LIMITE.numero}
                  max={LIMITE.numero}
                  aria-required={item.obrigatorio}
                  aria-invalid={!!erro}
                  aria-describedby={erro ? `${id}-erro` : undefined}
                  {...form.register(nome)}
                />
              ) : (
                <LimitedInput
                  id={id}
                  maxLength={maxCaracteres(item)}
                  length={respostas?.[i]?.resposta.length ?? 0}
                  aria-required={item.obrigatorio}
                  aria-invalid={!!erro}
                  {...form.register(nome)}
                />
              )}
              {mensagem}
            </div>
          )
        })}
      </div>
    </section>
  )
}
