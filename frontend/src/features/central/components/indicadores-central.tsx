import { BellRingIcon, ListChecksIcon, UsersIcon, WrenchIcon } from 'lucide-react'
import { Link } from 'react-router'
import { ErrorState } from '@/components/shared/error-state'
import { Medidor } from '@/components/shared/medidor'
import { StatusBadge } from '@/components/shared/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrigemAtual } from '@/lib/navegacao'
import { useResumoCentral } from '../hooks'
import { CartaoIndicador } from './cartao-indicador'

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`

/** Visão geral da operação: tarefas, equipes, equipamentos e alertas. */
export function IndicadoresCentral() {
  const { data, isPending, isError, refetch } = useResumoCentral()
  const origem = useOrigemAtual()

  return (
    <section aria-labelledby="visao-geral-titulo" className="grid gap-3">
      <h2 id="visao-geral-titulo" className="text-lg font-semibold">
        Visão geral
      </h2>

      {isPending && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {data && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <CartaoIndicador id="tarefas" titulo="Tarefas ativas" valor={data.tarefas.ativas} icone={ListChecksIcon} link={{ to: '/tarefas?visao=kanban', rotulo: 'Ver no Kanban' }}>
            <p className="text-muted-foreground">
              {data.tarefas.emExecucao} em execução ·{' '}
              <Link to="/analise" state={origem} className="underline-offset-4 hover:underline">
                {data.tarefas.emAnalise} em análise
              </Link>
            </p>
          </CartaoIndicador>

          <CartaoIndicador id="equipes" titulo="Equipes em operação" valor={data.equipes.emOperacao} sufixo={`de ${data.equipes.total}`} icone={UsersIcon} link={{ to: '/cadastros/equipes', rotulo: 'Ver equipes' }}>
            <p className="text-muted-foreground">Com tarefa em execução</p>
          </CartaoIndicador>

          <CartaoIndicador id="equipamentos" titulo="Equipamentos monitorados" valor={data.equipamentos.total} icone={WrenchIcon} link={{ to: '/cadastros/equipamentos', rotulo: 'Ver equipamentos' }}>
            <p className="text-muted-foreground">{data.equipamentos.operando} operando normalmente</p>
            <Medidor rotulo="Equipamentos ativos" percentual={data.equipamentos.percentualOperando} legenda={`${data.equipamentos.percentualOperando}% ativos`} />
          </CartaoIndicador>

          <CartaoIndicador
            id="alertas"
            titulo="Alertas"
            valor={data.alertas.total}
            icone={BellRingIcon}
            destaque={data.alertas.urgentes > 0}
            link={{ to: '/tarefas?situacao=ATRASADA', rotulo: 'Ver tarefas atrasadas' }}
          >
            <div>
              {data.alertas.urgentes > 0 ? (
                <StatusBadge tom="perigo">{plural(data.alertas.urgentes, 'urgente', 'urgentes')}</StatusBadge>
              ) : (
                <StatusBadge tom="neutro">Nenhum urgente</StatusBadge>
              )}
            </div>
            <ul className="grid gap-0.5 text-xs text-muted-foreground" aria-label="Origem dos alertas">
              <li>{plural(data.alertas.equipamentosInoperantes, 'equipamento inoperante', 'equipamentos inoperantes')}</li>
              <li>{plural(data.alertas.equipamentosEmAtencao, 'equipamento em atenção', 'equipamentos em atenção')}</li>
              <li>{plural(data.alertas.tarefasAtrasadas, 'tarefa atrasada', 'tarefas atrasadas')}</li>
            </ul>
          </CartaoIndicador>
        </div>
      )}
    </section>
  )
}
