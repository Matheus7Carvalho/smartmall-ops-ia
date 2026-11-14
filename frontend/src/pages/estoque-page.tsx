import { HistoryIcon, PackageIcon } from 'lucide-react'
import { AlternarVisao, type OpcaoVisao } from '@/components/shared/alternar-visao'
import { BotaoNovo } from '@/components/shared/botao-novo'
import { PageHeader } from '@/components/shared/page-header'
import { useSessao } from '@/features/auth/hooks'
import { temPerfil } from '@/features/auth/permissoes'
import { ItensVisao } from '@/features/estoque/components/itens-visao'
import { MovimentacoesVisao } from '@/features/estoque/components/movimentacoes-visao'
import { inicioDoMes, paraIsoData } from '@/lib/datas'
import { useFiltrosUrl } from '@/lib/filtros'
import { useAgora } from '@/lib/use-agora'

type Visao = 'itens' | 'movimentacoes'

const VISOES: readonly OpcaoVisao<Visao>[] = [
  { valor: 'itens', rotulo: 'Itens', icone: PackageIcon },
  { valor: 'movimentacoes', rotulo: 'Movimentações', icone: HistoryIcon },
]

const FILTROS_ITENS = ['busca', 'categoria', 'saldo'] as const
const FILTROS_MOVIMENTACOES = ['de', 'ate', 'tipo', 'item', 'equipamento'] as const
const FILTROS = ['visao', ...FILTROS_ITENS, ...FILTROS_MOVIMENTACOES] as const

export function EstoquePage() {
  const { data: usuario } = useSessao()
  const gestao = temPerfil(usuario?.perfil, ['ADMINISTRADOR', 'SUPERVISOR'])
  const agora = useAgora()
  const filtros = useFiltrosUrl(FILTROS)
  const f = filtros.valores
  const visao: Visao = f.visao === 'movimentacoes' ? 'movimentacoes' : 'itens'
  const novo = <BotaoNovo para="novo">Novo item</BotaoNovo>

  // Trocar de visão limpa os filtros da outra; a visão padrão (Itens) não fica na URL.
  const trocarVisao = (v: Visao) => filtros.atualizar(Object.fromEntries(FILTROS.map((k) => [k, k === 'visao' && v !== 'itens' ? v : ''])))
  const ativos = (chaves: readonly (typeof FILTROS)[number][]) => chaves.filter((k) => !!f[k]).length

  return (
    <>
      <PageHeader
        title="Estoque"
        actions={
          <>
            <AlternarVisao opcoes={VISOES} valor={visao} onChange={trocarVisao} />
            {gestao && novo}
          </>
        }
      />
      {visao === 'itens' ? (
        <ItensVisao
          gestao={gestao}
          filtros={{ busca: f.busca, categoria: f.categoria, saldo: f.saldo }}
          ativos={ativos(FILTROS_ITENS)}
          onFiltro={(chave, valor) => filtros.definir(chave, valor)}
          onLimpar={() => filtros.limpar([...FILTROS_ITENS])}
          novo={novo}
        />
      ) : (
        <MovimentacoesVisao
          // Sem período na URL: do início do mês até hoje.
          filtros={{ de: f.de || paraIsoData(inicioDoMes(agora)), ate: f.ate || paraIsoData(agora), tipo: f.tipo, item: f.item, equipamento: f.equipamento }}
          ativos={ativos(FILTROS_MOVIMENTACOES)}
          onFiltro={(chave, valor) => filtros.definir(chave, valor)}
          onLimpar={() => filtros.limpar([...FILTROS_MOVIMENTACOES])}
        />
      )}
    </>
  )
}
