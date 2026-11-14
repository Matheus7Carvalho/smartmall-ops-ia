import { useEffect, useRef, type KeyboardEvent } from 'react'
import { formatar, gradeDoMes, mesmoDia, paraIsoData, somarDias } from '@/lib/datas'
import { useAgora } from '@/lib/use-agora'
import { cn } from '@/lib/utils'
import { marcadorDoTom, pontoDoTom } from '@/lib/tons'
import { situacaoDe, situacaoInfo, type Tarefa } from '../types'

type CalendarioMesProps = {
  mes: Date
  selecionado: Date
  tarefas: Tarefa[]
  onSelecionar: (dia: Date) => void
}

const SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MAX_ROTULOS = 2

/**
 * Grade do mês em <table>. Um único dia recebe Tab (o selecionado); as setas movem a seleção
 * (±1 dia, ±7 dias), como em um grid de calendário acessível.
 */
export function CalendarioMes({ mes, selecionado, tarefas, onSelecionar }: CalendarioMesProps) {
  const dias = gradeDoMes(mes)
  const hoje = useAgora()
  const porDia = new Map<string, Tarefa[]>()
  for (const m of tarefas) {
    const chave = m.dataHoraPrevista.slice(0, 10)
    porDia.set(chave, [...(porDia.get(chave) ?? []), m])
  }

  const tabela = useRef<HTMLTableElement>(null)
  const focarSelecionado = useRef(false)
  useEffect(() => {
    if (!focarSelecionado.current) return
    focarSelecionado.current = false
    tabela.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus()
  }, [selecionado])

  const aoTeclar = (e: KeyboardEvent) => {
    const passos: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    if (!(e.key in passos)) return
    e.preventDefault()
    focarSelecionado.current = true
    onSelecionar(somarDias(selecionado, passos[e.key]))
  }

  return (
    <table ref={tabela} className="w-full table-fixed border-collapse" aria-label={formatar.mes(mes)} onKeyDown={aoTeclar}>
      <thead>
        <tr>
          {SEMANA.map((d) => (
            <th key={d} scope="col" className="pb-2 text-xs font-medium text-muted-foreground">
              {d}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 6 }, (_, semana) => (
          <tr key={semana}>
            {dias.slice(semana * 7, semana * 7 + 7).map((dia) => {
              const itens = porDia.get(paraIsoData(dia)) ?? []
              const atrasadas = itens.filter((m) => situacaoDe(m) === 'ATRASADA').length
              const doMes = dia.getMonth() === mes.getMonth()
              const ehSelecionado = mesmoDia(dia, selecionado)
              const ehHoje = mesmoDia(dia, hoje)
              const descricao = [
                formatar.diaLongo(dia),
                itens.length === 0 ? 'sem tarefas' : `${itens.length} tarefa${itens.length === 1 ? '' : 's'}`,
                atrasadas > 0 ? `${atrasadas} atrasada${atrasadas > 1 ? 's' : ''}` : '',
              ]
                .filter(Boolean)
                .join(', ')

              return (
                <td key={dia.toISOString()} className="h-16 border p-0 align-top sm:h-24">
                  <button
                    type="button"
                    tabIndex={ehSelecionado ? 0 : -1}
                    aria-label={descricao}
                    aria-pressed={ehSelecionado}
                    aria-current={ehHoje ? 'date' : undefined}
                    onClick={() => onSelecionar(dia)}
                    className={cn(
                      'flex size-full flex-col items-stretch gap-0.5 p-1 text-left outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset sm:p-1.5',
                      !doMes && 'bg-muted/30 text-muted-foreground',
                      ehSelecionado && 'bg-primary/10 ring-2 ring-primary ring-inset',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-6 items-center justify-center rounded-full text-xs tabular-nums',
                        ehHoje && 'bg-primary font-semibold text-primary-foreground',
                      )}
                    >
                      {dia.getDate()}
                    </span>
                    {/* Celular: só marcadores. Desktop: código e hora das primeiras tarefas. */}
                    {itens.length > 0 && (
                      <span className="flex gap-1 sm:hidden" aria-hidden>
                        {[...new Set(itens.map((m) => situacaoInfo[situacaoDe(m)].tom))].slice(0, 3).map((tom) => (
                          <span key={tom} className={cn('size-1.5 rounded-full', pontoDoTom[tom])} />
                        ))}
                        {itens.length > 1 && <span className="text-[10px] leading-none text-muted-foreground">{itens.length}</span>}
                      </span>
                    )}
                    <span className="hidden min-w-0 flex-col gap-0.5 sm:flex" aria-hidden>
                      {itens.slice(0, MAX_ROTULOS).map((m) => (
                        <span
                          key={m.id}
                          className={cn(
                            'truncate rounded-r border-l-2 px-1 text-[11px] leading-4',
                            marcadorDoTom[situacaoInfo[situacaoDe(m)].tom],
                            m.status === 'CANCELADA' && 'line-through',
                          )}
                        >
                          {formatar.hora(m.dataHoraPrevista)} {m.equipamento?.codigo ?? 'Chamado'}
                        </span>
                      ))}
                      {itens.length > MAX_ROTULOS && <span className="px-1 text-[11px] text-muted-foreground">+{itens.length - MAX_ROTULOS}</span>}
                    </span>
                  </button>
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
