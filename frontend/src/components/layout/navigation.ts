import { ChartColumnIcon, ClipboardCheckIcon, ClipboardListIcon, ListChecksIcon, MapIcon, MessageSquareWarningIcon, PackageIcon, RepeatIcon, UsersIcon, UsersRoundIcon, WrenchIcon, type LucideIcon } from 'lucide-react'
import { temPerfil } from '@/features/auth/permissoes'
import type { Perfil } from '@/features/auth/types'

export type NavItem = {
  title: string
  to: string
  icon: LucideIcon
  /** Ausente: todos os perfis. */
  perfis?: readonly Perfil[]
}

export type NavGrupo = { titulo: string; itens: readonly NavItem[] }

const GESTAO = ['ADMINISTRADOR', 'SUPERVISOR'] as const satisfies readonly Perfil[]

/**
 * Só entram aqui módulos já implementados. Perfis iguais aos do backend (SecurityConfiguration).
 * A ordem define o destino inicial: cada perfil cai no primeiro item permitido.
 *
 * Fluxo (docs/modulo-manutencao.md, Glossário): Operação recebe Chamados e acompanha Tarefas.
 * Planejamento define a manutenção programada que também gera tarefas.
 */
export const navGrupos: readonly NavGrupo[] = [
  {
    titulo: 'Operação',
    itens: [
      { title: 'Central de Controle', to: '/central', icon: MapIcon, perfis: GESTAO },
      { title: 'Chamados', to: '/chamados', icon: MessageSquareWarningIcon, perfis: GESTAO },
      { title: 'Tarefas', to: '/tarefas', icon: ListChecksIcon },
      { title: 'Análise de Tarefas', to: '/analise', icon: ClipboardCheckIcon, perfis: GESTAO },
      // Todos os perfis: o Funcionário consulta o saldo e registra retiradas; cadastro e entrada só a gestão.
      { title: 'Estoque', to: '/estoque', icon: PackageIcon },
    ],
  },
  {
    titulo: 'Planejamento',
    itens: [
      { title: 'Manutenções programadas', to: '/planejamento/manutencoes-programadas', icon: RepeatIcon, perfis: GESTAO },
      { title: 'Modelos de checklist', to: '/planejamento/modelos-checklist', icon: ClipboardListIcon, perfis: GESTAO },
    ],
  },
  {
    titulo: 'Cadastros',
    itens: [
      { title: 'Equipamentos', to: '/cadastros/equipamentos', icon: WrenchIcon, perfis: GESTAO },
      { title: 'Equipes', to: '/cadastros/equipes', icon: UsersIcon, perfis: GESTAO },
      { title: 'Membros e permissões', to: '/cadastros/usuarios', icon: UsersRoundIcon, perfis: ['ADMINISTRADOR'] },
    ],
  },
  {
    titulo: 'Gestão',
    itens: [{ title: 'Relatórios', to: '/relatorios', icon: ChartColumnIcon, perfis: GESTAO }],
  },
]

const todosItens = navGrupos.flatMap((g) => g.itens)

/** Grupos visíveis ao perfil (grupos sem itens permitidos somem). */
export function gruposPermitidos(perfil: Perfil | undefined): NavGrupo[] {
  return navGrupos
    .map((g) => ({ ...g, itens: g.itens.filter((i) => temPerfil(perfil, i.perfis)) }))
    .filter((g) => g.itens.length > 0)
}

export function itensPermitidos(perfil: Perfil | undefined): readonly NavItem[] {
  return todosItens.filter((item) => temPerfil(perfil, item.perfis))
}

/** Item de menu que cobre a rota (inclui subrotas, ex.: /planejamento/modelos-checklist/novo). */
export function itemDaRota(to: string): NavItem | undefined {
  return todosItens.find((item) => to === item.to || to.startsWith(`${item.to}/`))
}

/**
 * Pode o perfil acessar a rota? Rota fora do menu: negado por padrão.
 * Item sem `perfis`: liberado a todos os perfis autenticados.
 */
export function podeAcessar(perfil: Perfil | undefined, to: string): boolean {
  const item = itemDaRota(to)
  return !!item && temPerfil(perfil, item.perfis)
}
