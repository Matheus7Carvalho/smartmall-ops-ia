import type { Tom } from '@/components/shared/status-badge'

export type Categoria = 'ELEVADOR' | 'ESCADA_ROLANTE' | 'CLIMATIZACAO' | 'ELETRICA' | 'HIDRAULICA' | 'SEGURANCA' | 'ACESSO' | 'OUTROS'
export type Condicao = 'OPERANDO' | 'ATENCAO' | 'INOPERANTE'

export const categorias: { valor: Categoria; rotulo: string }[] = [
  { valor: 'ELEVADOR', rotulo: 'Elevador' },
  { valor: 'ESCADA_ROLANTE', rotulo: 'Escada rolante' },
  { valor: 'CLIMATIZACAO', rotulo: 'Climatização' },
  { valor: 'ELETRICA', rotulo: 'Elétrica' },
  { valor: 'HIDRAULICA', rotulo: 'Hidráulica' },
  { valor: 'SEGURANCA', rotulo: 'Segurança' },
  { valor: 'ACESSO', rotulo: 'Acesso' },
  { valor: 'OUTROS', rotulo: 'Outros' },
]

export const condicoes: { valor: Condicao; rotulo: string; tom: Tom }[] = [
  { valor: 'OPERANDO', rotulo: 'Operando', tom: 'sucesso' },
  { valor: 'ATENCAO', rotulo: 'Atenção', tom: 'atencao' },
  { valor: 'INOPERANTE', rotulo: 'Inoperante', tom: 'perigo' },
]

export const categoriaLabel = Object.fromEntries(categorias.map((c) => [c.valor, c.rotulo])) as Record<Categoria, string>
export const condicaoInfo = Object.fromEntries(condicoes.map((c) => [c.valor, c])) as Record<Condicao, (typeof condicoes)[number]>

/** Espelha EquipamentoResponse. */
export type Equipamento = {
  id: string
  codigo: string
  nome: string
  categoria: Categoria
  pisoId: string
  pisoNome: string
  localizacao: string
  condicao: Condicao
  dataCriacao: string
  dataAtualizacao: string | null
}

/** Espelha EquipamentoRequest. */
export type EquipamentoRequest = Omit<Equipamento, 'id' | 'pisoNome' | 'dataCriacao' | 'dataAtualizacao'>
