import { UserXIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { BarraFiltros, FiltroSelect, FiltroTexto } from '@/components/shared/filtros'
import { SemResultado } from '@/components/shared/sem-resultado'
import { Skeleton } from '@/components/ui/skeleton'
import { mensagemDeErro } from '@/lib/cadastro'
import { formatar } from '@/lib/datas'
import { contem } from '@/lib/filtros'
import { motivoAusenciaRotulo, SITUACOES_FUNCIONARIO, situacaoFuncionarioInfo, type Disponibilidade } from '../disponibilidade'
import { useDisponibilidade, useEncerrarAusencia } from '../hooks'
import type { Equipe } from '../types'
import { AusenciaSheet } from './ausencia-sheet'
import { FuncionariosTable } from './funcionarios-table'
import { IndicadoresDisponibilidade } from './indicadores-disponibilidade'

type Filtros = { funcionario: string; situacao: string; equipe: string }

type FuncionariosVisaoProps = {
  equipes: Equipe[]
  filtros: Filtros
  ativos: number
  onFiltro: (chave: keyof Filtros, valor: string) => void
  onLimpar: () => void
}

const SITUACOES = SITUACOES_FUNCIONARIO.map((s) => ({ valor: s, rotulo: situacaoFuncionarioInfo[s].rotulo }))

/** Quem está presente, disponível, ocupado ou indisponível hoje, com a atividade atual e as ausências. */
export function FuncionariosVisao({ equipes, filtros, ativos, onFiltro, onLimpar }: FuncionariosVisaoProps) {
  const { data: funcionarios, isPending, isError, refetch } = useDisponibilidade()
  const encerrar = useEncerrarAusencia()
  const [registrando, setRegistrando] = useState<Disponibilidade | null>(null)
  const [encerrando, setEncerrando] = useState<Disponibilidade | null>(null)

  const visiveis = (funcionarios ?? []).filter(
    (f) =>
      contem(f.nome, filtros.funcionario) &&
      (!filtros.situacao || f.situacao === filtros.situacao) &&
      (!filtros.equipe || f.equipes.some((e) => e.id === filtros.equipe)),
  )

  const confirmarEncerramento = () => {
    const ausencia = encerrando?.ausencia
    if (!ausencia) return
    encerrar.mutate(ausencia.id, {
      onSuccess: () => toast.success('Ausência encerrada.'),
      onError: (e) => toast.error(mensagemDeErro(e, 'Não foi possível encerrar a ausência.')),
    })
  }

  return (
    <>
      <BarraFiltros ativos={ativos} onLimpar={onLimpar}>
        <FiltroTexto id="filtro-funcionario" label="Funcionário" valor={filtros.funcionario} onChange={(v) => onFiltro('funcionario', v)} className="sm:w-56" />
        <FiltroSelect id="filtro-situacao" label="Situação" valor={filtros.situacao} onChange={(v) => onFiltro('situacao', v)} opcoes={SITUACOES} todos="Todas" />
        <FiltroSelect
          id="filtro-equipe"
          label="Equipe"
          valor={filtros.equipe}
          onChange={(v) => onFiltro('equipe', v)}
          opcoes={equipes.map((e) => ({ valor: e.id, rotulo: e.nome }))}
          todos="Todas"
          className="sm:w-52"
        />
      </BarraFiltros>

      {isPending && <Skeleton className="h-64 w-full" />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {funcionarios && (
        <section aria-labelledby="disponibilidade-titulo" className="grid gap-3">
          <h2 id="disponibilidade-titulo" className="text-lg font-semibold">
            Disponibilidade hoje
          </h2>
          <IndicadoresDisponibilidade funcionarios={funcionarios} />
          {funcionarios.length === 0 && <EmptyState title="Nenhum funcionário ativo" icon={UserXIcon} />}
          {funcionarios.length > 0 && visiveis.length === 0 && <SemResultado onLimpar={onLimpar} />}
          {visiveis.length > 0 && <FuncionariosTable funcionarios={visiveis} onRegistrarAusencia={setRegistrando} onEncerrarAusencia={setEncerrando} />}
        </section>
      )}

      <AusenciaSheet funcionario={registrando} onClose={() => setRegistrando(null)} />
      <ConfirmDialog
        open={!!encerrando}
        onOpenChange={(aberto) => !aberto && setEncerrando(null)}
        title="Encerrar ausência?"
        description={
          encerrando?.ausencia &&
          `${encerrando.nome} — ${motivoAusenciaRotulo[encerrando.ausencia.motivo]} de ${formatar.data(encerrando.ausencia.inicio)} a ${formatar.data(encerrando.ausencia.fim)}. Volta a ficar disponível a partir de hoje.`
        }
        confirmLabel="Encerrar ausência"
        onConfirm={confirmarEncerramento}
      />
    </>
  )
}
