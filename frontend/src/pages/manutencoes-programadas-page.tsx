import { RepeatIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { BotaoNovo } from '@/components/shared/botao-novo'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { ExcluirDialog } from '@/components/shared/excluir-dialog'
import { BarraFiltros, FiltroData, FiltroSelect } from '@/components/shared/filtros'
import { PageHeader } from '@/components/shared/page-header'
import { SemResultado } from '@/components/shared/sem-resultado'
import { Skeleton } from '@/components/ui/skeleton'
import { ManutencaoProgramadaTable } from '@/features/manutencao-programada/components/manutencao-programada-table'
import { useEncerrarManutencaoProgramada, useExcluirManutencaoProgramada, useManutencoesProgramadas } from '@/features/manutencao-programada/hooks'
import { nomeDaProgramada, type ManutencaoProgramada } from '@/features/manutencao-programada/types'
import { mensagemDeErro } from '@/lib/cadastro'
import { useFiltrosUrl } from '@/lib/filtros'

const FILTROS = ['equipamento', 'equipe', 'de', 'ate', 'situacao'] as const

/** A vigência cruza o período [de, ate]? Sem término = vigente indefinidamente. */
function vigenteNoPeriodo(p: ManutencaoProgramada, de: string, ate: string) {
  const fim = p.frequencia === 'UNICA' ? p.dataInicio : p.dataFim
  return (!ate || p.dataInicio <= ate) && (!de || !fim || fim >= de)
}

/** Opções únicas (id → nome) entre as manutenções programadas, ordenadas pelo rótulo. */
function opcoesDe(programadas: ManutencaoProgramada[], campo: 'equipamento' | 'equipe') {
  const mapa = new Map(programadas.map((p) => [p[campo].id, campo === 'equipamento' ? nomeDaProgramada(p) : p.equipe.nome]))
  return [...mapa].map(([valor, rotulo]) => ({ valor, rotulo })).sort((a, b) => a.rotulo.localeCompare(b.rotulo))
}

export function ManutencoesProgramadasPage() {
  const { data: programadas, isPending, isError, refetch } = useManutencoesProgramadas()
  const encerrar = useEncerrarManutencaoProgramada()
  const excluir = useExcluirManutencaoProgramada()
  const [encerrando, setEncerrando] = useState<ManutencaoProgramada | null>(null)
  const [excluindo, setExcluindo] = useState<ManutencaoProgramada | null>(null)
  const filtros = useFiltrosUrl(FILTROS)
  const f = filtros.valores

  const todas = programadas ?? []
  const visiveis = todas.filter(
    (p) =>
      (!f.equipamento || p.equipamento.id === f.equipamento) &&
      (!f.equipe || p.equipe.id === f.equipe) &&
      (!f.situacao || (f.situacao === 'ATIVA') === p.ativo) &&
      vigenteNoPeriodo(p, f.de, f.ate),
  )
  const nova = <BotaoNovo para="nova">Programar manutenção</BotaoNovo>
  const temCadastro = todas.length > 0

  return (
    <>
      <PageHeader title="Manutenções programadas" actions={temCadastro && nova} />
      {temCadastro && (
        <BarraFiltros ativos={filtros.ativos} onLimpar={() => filtros.limpar()}>
          <FiltroSelect
            id="filtro-equipamento"
            label="Equipamento"
            valor={f.equipamento}
            onChange={(v) => filtros.definir('equipamento', v)}
            opcoes={opcoesDe(todas, 'equipamento')}
            className="sm:w-60"
          />
          <FiltroSelect id="filtro-equipe" label="Equipe" valor={f.equipe} onChange={(v) => filtros.definir('equipe', v)} opcoes={opcoesDe(todas, 'equipe')} todos="Todas" />
          <FiltroData id="filtro-de" label="Vigente de" valor={f.de} max={f.ate} onChange={(v) => filtros.definir('de', v)} />
          <FiltroData id="filtro-ate" label="Até" valor={f.ate} min={f.de} onChange={(v) => filtros.definir('ate', v)} />
          <FiltroSelect
            id="filtro-situacao"
            label="Situação"
            valor={f.situacao}
            onChange={(v) => filtros.definir('situacao', v)}
            opcoes={[
              { valor: 'ATIVA', rotulo: 'Ativa' },
              { valor: 'ENCERRADA', rotulo: 'Encerrada' },
            ]}
            todos="Todas"
            className="sm:w-36"
          />
        </BarraFiltros>
      )}
      {isPending && <Skeleton className="h-48 w-full" />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {programadas?.length === 0 && <EmptyState title="Nenhuma manutenção programada" icon={RepeatIcon} action={nova} />}
      {temCadastro && visiveis.length === 0 && <SemResultado onLimpar={() => filtros.limpar()} />}
      {visiveis.length > 0 && <ManutencaoProgramadaTable programadas={visiveis} onEncerrar={setEncerrando} onExcluir={setExcluindo} />}

      <ConfirmDialog
        open={!!encerrando}
        onOpenChange={(open) => !open && setEncerrando(null)}
        title="Encerrar manutenção programada?"
        description={encerrando && `${nomeDaProgramada(encerrando)}. As tarefas futuras serão canceladas.`}
        confirmLabel="Encerrar"
        destructive
        onConfirm={() =>
          encerrando &&
          encerrar.mutate(encerrando.id, {
            onSuccess: () => toast.success('Manutenção programada encerrada.'),
            onError: (e) => toast.error(mensagemDeErro(e, 'Não foi possível encerrar.')),
          })
        }
      />
      <ExcluirDialog
        registro={excluindo && { id: excluindo.id, nome: nomeDaProgramada(excluindo) }}
        titulo="Excluir manutenção programada?"
        mensagemSucesso="Manutenção programada excluída."
        mutacao={excluir}
        onClose={() => setExcluindo(null)}
      />
    </>
  )
}
