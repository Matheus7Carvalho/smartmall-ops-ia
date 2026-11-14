import { WrenchIcon } from 'lucide-react'
import { useState } from 'react'
import { BotaoNovo } from '@/components/shared/botao-novo'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { ExcluirDialog } from '@/components/shared/excluir-dialog'
import { BarraFiltros, FiltroSelect, FiltroTexto } from '@/components/shared/filtros'
import { PageHeader } from '@/components/shared/page-header'
import { SemResultado } from '@/components/shared/sem-resultado'
import { Skeleton } from '@/components/ui/skeleton'
import { EquipamentoTable } from '@/features/equipamentos/components/equipamento-table'
import { useEquipamentos, useExcluirEquipamento } from '@/features/equipamentos/hooks'
import { categorias, condicoes, type Equipamento } from '@/features/equipamentos/types'
import { contem, useFiltrosUrl } from '@/lib/filtros'

const FILTROS = ['codigo', 'nome', 'categoria', 'local', 'condicao'] as const

export function EquipamentosPage() {
  const { data: equipamentos, isPending, isError, refetch } = useEquipamentos()
  const excluir = useExcluirEquipamento()
  const [excluindo, setExcluindo] = useState<Equipamento | null>(null)
  const filtros = useFiltrosUrl(FILTROS)
  const f = filtros.valores

  const visiveis = (equipamentos ?? []).filter(
    (e) =>
      contem(e.codigo, f.codigo) &&
      contem(e.nome, f.nome) &&
      contem(`${e.pisoNome} ${e.localizacao}`, f.local) &&
      (!f.categoria || e.categoria === f.categoria) &&
      (!f.condicao || e.condicao === f.condicao),
  )
  const novo = <BotaoNovo para="novo">Novo equipamento</BotaoNovo>
  const temCadastro = !!equipamentos && equipamentos.length > 0

  return (
    <>
      <PageHeader title="Equipamentos" actions={temCadastro && novo} />
      {temCadastro && (
        <BarraFiltros ativos={filtros.ativos} onLimpar={() => filtros.limpar()}>
          <FiltroTexto id="filtro-codigo" label="Código" valor={f.codigo} onChange={(v) => filtros.definir('codigo', v)} className="sm:w-32" />
          <FiltroTexto id="filtro-nome" label="Nome" valor={f.nome} onChange={(v) => filtros.definir('nome', v)} />
          <FiltroSelect id="filtro-categoria" label="Categoria" valor={f.categoria} onChange={(v) => filtros.definir('categoria', v)} opcoes={categorias} todos="Todas" />
          <FiltroTexto id="filtro-local" label="Local" valor={f.local} onChange={(v) => filtros.definir('local', v)} />
          <FiltroSelect id="filtro-condicao" label="Condição" valor={f.condicao} onChange={(v) => filtros.definir('condicao', v)} opcoes={condicoes} todos="Todas" />
        </BarraFiltros>
      )}
      {isPending && <Skeleton className="h-48 w-full" />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {equipamentos?.length === 0 && <EmptyState title="Nenhum equipamento cadastrado" icon={WrenchIcon} action={novo} />}
      {temCadastro && visiveis.length === 0 && <SemResultado onLimpar={() => filtros.limpar()} />}
      {visiveis.length > 0 && <EquipamentoTable equipamentos={visiveis} onExcluir={setExcluindo} />}
      <ExcluirDialog
        registro={excluindo}
        titulo="Excluir equipamento?"
        mensagemSucesso="Equipamento excluído."
        mutacao={excluir}
        onClose={() => setExcluindo(null)}
      />
    </>
  )
}
