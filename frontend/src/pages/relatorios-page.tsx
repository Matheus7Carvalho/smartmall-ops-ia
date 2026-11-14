import { BarraFiltros, FiltroData, FiltroSelect } from '@/components/shared/filtros'
import { PageHeader } from '@/components/shared/page-header'
import { useEquipes } from '@/features/equipes/hooks'
import { RelatorioTarefas } from '@/features/relatorios/components/relatorio-tarefas'
import { MAX_DIAS_RELATORIO } from '@/features/relatorios/types'
import { deIsoData, fimDoMes, inicioDoMes, paraIsoData } from '@/lib/datas'
import { useFiltrosUrl } from '@/lib/filtros'
import { useAgora } from '@/lib/use-agora'

const FILTROS = ['de', 'ate', 'equipe'] as const
const DIA_MS = 24 * 60 * 60 * 1000

/** Mensagem do período inválido, ou nulo. As mesmas regras do servidor. */
function erroDoPeriodo(de: string, ate: string) {
  if (ate < de) return 'A data final não pode ser antes da inicial.'
  if (Math.round((deIsoData(ate).getTime() - deIsoData(de).getTime()) / DIA_MS) >= MAX_DIAS_RELATORIO) return `Consulte no máximo ${MAX_DIAS_RELATORIO} dias por vez.`
  return null
}

export function RelatoriosPage() {
  const agora = useAgora()
  const filtros = useFiltrosUrl(FILTROS)
  const equipes = useEquipes()
  // Sem período na URL: o mês corrente.
  const de = filtros.valores.de || paraIsoData(inicioDoMes(agora))
  const ate = filtros.valores.ate || paraIsoData(fimDoMes(agora))
  const equipe = filtros.valores.equipe
  const erro = erroDoPeriodo(de, ate)

  return (
    <>
      <PageHeader title="Relatórios" />
      <BarraFiltros ativos={filtros.ativos} onLimpar={() => filtros.limpar()}>
        <FiltroData id="filtro-de" label="De" valor={de} onChange={(v) => filtros.definir('de', v)} max={ate} />
        <FiltroData id="filtro-ate" label="Até" valor={ate} onChange={(v) => filtros.definir('ate', v)} min={de} />
        <FiltroSelect
          id="filtro-equipe"
          label="Equipe"
          valor={equipe}
          onChange={(v) => filtros.definir('equipe', v)}
          opcoes={(equipes.data ?? []).map((e) => ({ valor: e.id, rotulo: e.nome }))}
          todos="Todas"
          className="sm:w-52"
        />
      </BarraFiltros>
      {erro && (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      )}
      <RelatorioTarefas filtro={{ de, ate, equipeId: equipe || undefined }} valido={!erro} />
    </>
  )
}
