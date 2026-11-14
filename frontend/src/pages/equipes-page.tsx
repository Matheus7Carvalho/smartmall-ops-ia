import { ContactIcon, UsersIcon } from 'lucide-react'
import { useState } from 'react'
import { AlternarVisao, type OpcaoVisao } from '@/components/shared/alternar-visao'
import { BotaoNovo } from '@/components/shared/botao-novo'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { ExcluirDialog } from '@/components/shared/excluir-dialog'
import { BarraFiltros, FiltroTexto } from '@/components/shared/filtros'
import { PageHeader } from '@/components/shared/page-header'
import { SemResultado } from '@/components/shared/sem-resultado'
import { Skeleton } from '@/components/ui/skeleton'
import { EquipeTable } from '@/features/equipes/components/equipe-table'
import { FuncionariosVisao } from '@/features/equipes/components/funcionarios-visao'
import { useDisponibilidade, useEquipes, useExcluirEquipe } from '@/features/equipes/hooks'
import type { Equipe } from '@/features/equipes/types'
import { contem, useFiltrosUrl } from '@/lib/filtros'

type Visao = 'equipes' | 'funcionarios'

const VISOES: readonly OpcaoVisao<Visao>[] = [
  { valor: 'equipes', rotulo: 'Equipes', icone: UsersIcon },
  { valor: 'funcionarios', rotulo: 'Funcionários', icone: ContactIcon },
]

const FILTROS = ['nome', 'visao', 'funcionario', 'situacao', 'equipe'] as const
const FILTROS_FUNCIONARIOS = ['funcionario', 'situacao', 'equipe'] as const

export function EquipesPage() {
  const { data: equipes, isPending, isError, refetch } = useEquipes()
  const excluir = useExcluirEquipe()
  const [excluindo, setExcluindo] = useState<Equipe | null>(null)
  const filtros = useFiltrosUrl(FILTROS)
  const f = filtros.valores
  const visao: Visao = f.visao === 'funcionarios' ? 'funcionarios' : 'equipes'
  const disponibilidade = useDisponibilidade(visao === 'equipes')

  const visiveis = (equipes ?? []).filter((e) => contem(e.nome, f.nome))
  const nova = <BotaoNovo para="nova">Nova equipe</BotaoNovo>
  const temCadastro = !!equipes && equipes.length > 0
  const ativosFuncionarios = FILTROS_FUNCIONARIOS.filter((k) => !!f[k]).length

  // Trocar de visão limpa os filtros da outra; a visão padrão (Equipes) não fica na URL.
  const trocarVisao = (v: Visao) => filtros.atualizar({ visao: v === 'equipes' ? '' : v, nome: '', funcionario: '', situacao: '', equipe: '' })

  return (
    <>
      <PageHeader
        title="Equipes"
        actions={
          <>
            <AlternarVisao opcoes={VISOES} valor={visao} onChange={trocarVisao} />
            {temCadastro && nova}
          </>
        }
      />

      {visao === 'funcionarios' ? (
        <FuncionariosVisao
          equipes={equipes ?? []}
          filtros={{ funcionario: f.funcionario, situacao: f.situacao, equipe: f.equipe }}
          ativos={ativosFuncionarios}
          onFiltro={(chave, valor) => filtros.definir(chave, valor)}
          onLimpar={() => filtros.limpar([...FILTROS_FUNCIONARIOS])}
        />
      ) : (
        <>
          {temCadastro && (
            <BarraFiltros ativos={f.nome ? 1 : 0} onLimpar={() => filtros.limpar(['nome'])}>
              <FiltroTexto id="filtro-nome" label="Nome" valor={f.nome} onChange={(v) => filtros.definir('nome', v)} className="sm:w-64" />
            </BarraFiltros>
          )}
          {isPending && <Skeleton className="h-48 w-full" />}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {equipes?.length === 0 && <EmptyState title="Nenhuma equipe cadastrada" icon={UsersIcon} action={nova} />}
          {temCadastro && visiveis.length === 0 && <SemResultado onLimpar={() => filtros.limpar(['nome'])} />}
          {visiveis.length > 0 && <EquipeTable equipes={visiveis} disponibilidade={disponibilidade.data} onExcluir={setExcluindo} />}
        </>
      )}

      <ExcluirDialog
        registro={excluindo}
        titulo="Excluir equipe?"
        mensagemSucesso="Equipe excluída."
        mutacao={excluir}
        onClose={() => setExcluindo(null)}
      />
    </>
  )
}
