import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { BotaoNovo } from '@/components/shared/botao-novo'
import { ErrorState } from '@/components/shared/error-state'
import { BarraFiltros, FiltroSelect } from '@/components/shared/filtros'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSessao } from '@/features/auth/hooks'
import { temPerfil } from '@/features/auth/permissoes'
import { useEquipes } from '@/features/equipes/hooks'
import { CalendarioMes } from '@/features/tarefas/components/calendario-mes'
import { DiaPainel } from '@/features/tarefas/components/dia-painel'
import { LegendaSituacoes } from '@/features/tarefas/components/legenda-situacoes'
import { IndicadoresTarefas } from '@/features/tarefas/components/indicadores-tarefas'
import { KanbanTarefas } from '@/features/tarefas/components/kanban-tarefas'
import { VisaoTarefas, type Visao } from '@/features/tarefas/components/visao-tarefas'
import { useTarefas } from '@/features/tarefas/hooks'
import { situacoes, type Situacao } from '@/features/tarefas/types'
import { deIsoData, formatar, gradeDoMes, inicioDoMes, mesmoDia, paraIsoData } from '@/lib/datas'
import { useFiltrosUrl } from '@/lib/filtros'
import { useAgora } from '@/lib/use-agora'

/** Dia, filtros e visualização ficam na URL: voltar de uma manutenção programada reabre Tarefas no mesmo ponto. */
const PARAMETROS = ['dia', 'equipe', 'situacao', 'visao'] as const

export function TarefasPage() {
  const { data: usuario } = useSessao()
  const gestao = temPerfil(usuario?.perfil, ['ADMINISTRADOR', 'SUPERVISOR'])
  const hoje = useAgora()
  const parametros = useFiltrosUrl(PARAMETROS)
  const { dia, equipe, situacao } = parametros.valores
  const visao: Visao = parametros.valores.visao === 'kanban' ? 'kanban' : 'calendario'

  const selecionado = /^\d{4}-\d{2}-\d{2}$/.test(dia) ? deIsoData(dia) : hoje
  const selecionar = (data: Date) => parametros.definir('dia', mesmoDia(data, hoje) ? '' : paraIsoData(data))

  const mes = inicioDoMes(selecionado)
  const grade = gradeDoMes(mes)
  const consulta = useTarefas({
    de: paraIsoData(grade[0]),
    ate: paraIsoData(grade[grade.length - 1]),
    equipeId: equipe || undefined,
    situacao: (situacao || undefined) as Situacao | undefined,
  })
  const equipes = useEquipes(gestao)

  const mudarMes = (delta: number) => selecionar(new Date(mes.getFullYear(), mes.getMonth() + delta, 1))
  const tarefas = consulta.data ?? []
  const doDia = tarefas.filter((t) => mesmoDia(new Date(t.dataHoraPrevista), selecionado))
  const doMes = tarefas.filter((t) => new Date(t.dataHoraPrevista).getMonth() === mes.getMonth())
  const filtrosAtivos = (equipe ? 1 : 0) + (situacao ? 1 : 0)

  return (
    <>
      <PageHeader
        title="Tarefas"
        actions={
          <>
            {/* Calendário é o padrão e não aparece na URL. */}
            <VisaoTarefas valor={visao} onChange={(v) => parametros.definir('visao', v === 'kanban' ? v : '')} />
            {gestao && <BotaoNovo para="/planejamento/manutencoes-programadas/nova">Programar manutenção</BotaoNovo>}
          </>
        }
      />

      <IndicadoresTarefas />

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" aria-label="Mês anterior" onClick={() => mudarMes(-1)}>
            <ChevronLeftIcon aria-hidden />
          </Button>
          <h2 className="w-44 text-center text-base font-semibold" aria-live="polite">
            {formatar.mes(mes)}
          </h2>
          <Button variant="outline" size="icon" aria-label="Próximo mês" onClick={() => mudarMes(1)}>
            <ChevronRightIcon aria-hidden />
          </Button>
          <Button variant="ghost" onClick={() => selecionar(hoje)}>
            Hoje
          </Button>
        </div>

        <div className="ml-auto">
          {/* Limpa só os filtros; o dia selecionado continua. */}
          <BarraFiltros ativos={filtrosAtivos} onLimpar={() => parametros.limpar(['equipe', 'situacao'])}>
            {gestao && (
              <FiltroSelect
                id="filtro-equipe"
                label="Equipe"
                valor={equipe}
                onChange={(v) => parametros.definir('equipe', v)}
                opcoes={(equipes.data ?? []).map((e) => ({ valor: e.id, rotulo: e.nome }))}
                todos="Todas"
                className="sm:w-48"
              />
            )}
            <FiltroSelect
              id="filtro-situacao"
              label="Situação"
              valor={situacao}
              onChange={(v) => parametros.definir('situacao', v)}
              opcoes={situacoes}
              todos="Todas"
              className="sm:w-40"
            />
          </BarraFiltros>
        </div>
      </div>

      {consulta.isError ? (
        <ErrorState onRetry={() => consulta.refetch()} />
      ) : visao === 'kanban' ? (
        consulta.isPending ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <KanbanTarefas tarefas={doMes} situacao={(situacao || undefined) as Situacao | undefined} podeGerenciar={gestao} />
        )
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          {consulta.isPending ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <div className="grid gap-2">
              <CalendarioMes mes={mes} selecionado={selecionado} tarefas={tarefas} onSelecionar={selecionar} />
              <LegendaSituacoes />
            </div>
          )}
          <DiaPainel dia={selecionado} tarefas={doDia} podeGerenciar={gestao} />
        </div>
      )}
    </>
  )
}
