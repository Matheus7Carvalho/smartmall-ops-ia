import { ArrowDownToLineIcon, ArrowUpFromLineIcon, Trash2Icon } from 'lucide-react'
import { Link } from 'react-router'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useOrigemAtual } from '@/lib/navegacao'
import { categoriaItemRotulo, situacaoSaldo, situacaoSaldoInfo, unidadeCurta, type ItemEstoque, type TipoMovimentacao } from '../types'

type ItensListaProps = {
  itens: ItemEstoque[]
  gestao: boolean
  onMovimentar: (item: ItemEstoque, tipo: TipoMovimentacao) => void
  onExcluir: (item: ItemEstoque) => void
}

function Saldo({ item }: { item: ItemEstoque }) {
  const info = situacaoSaldoInfo[situacaoSaldo(item)]
  return (
    <span className="flex flex-col items-end gap-1">
      <span className="font-medium tabular-nums">
        {item.saldo} {unidadeCurta[item.unidade]}
      </span>
      <StatusBadge tom={info.tom}>{info.rotulo}</StatusBadge>
    </span>
  )
}

/** Retirada para todos; entrada e exclusão só para a gestão. */
function Acoes({ item, gestao, onMovimentar, onExcluir }: Omit<ItensListaProps, 'itens'> & { item: ItemEstoque }) {
  return (
    <div className="flex shrink-0 justify-end gap-1">
      {gestao && (
        <Button variant="ghost" size="icon-sm" aria-label={`Registrar entrada de ${item.codigo}`} onClick={() => onMovimentar(item, 'ENTRADA')}>
          <ArrowDownToLineIcon aria-hidden />
        </Button>
      )}
      <Button variant="ghost" size="icon-sm" aria-label={`Registrar retirada de ${item.codigo}`} disabled={item.saldo === 0} onClick={() => onMovimentar(item, 'RETIRADA')}>
        <ArrowUpFromLineIcon aria-hidden />
      </Button>
      {gestao && (
        <Button variant="ghost" size="icon-sm" aria-label={`Excluir ${item.codigo}`} onClick={() => onExcluir(item)}>
          <Trash2Icon aria-hidden />
        </Button>
      )}
    </div>
  )
}

/** Itens com saldo e situação. O nome abre o item (cadastro e rastreabilidade). Tabela no desktop; cartões no celular. */
export function ItensLista({ itens, ...acoes }: ItensListaProps) {
  const origem = useOrigemAtual()
  const nome = (i: ItemEstoque) => (
    <Link to={`/estoque/${i.id}`} state={origem} className="font-medium text-primary underline-offset-4 hover:underline">
      {i.nome}
    </Link>
  )

  return (
    <>
      <div className="hidden min-w-0 rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Código</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="w-32">Categoria</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead className="w-24 text-right">Mínimo</TableHead>
              <TableHead className="w-44 text-right">Saldo</TableHead>
              <TableHead className="w-32">
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-mono text-xs">{i.codigo}</TableCell>
                <TableCell className="whitespace-normal">{nome(i)}</TableCell>
                <TableCell>{categoriaItemRotulo[i.categoria]}</TableCell>
                <TableCell className="whitespace-normal text-muted-foreground">{i.localizacao ?? '—'}</TableCell>
                <TableCell className="text-right tabular-nums">{i.estoqueMinimo}</TableCell>
                <TableCell>
                  <Saldo item={i} />
                </TableCell>
                <TableCell>
                  <Acoes item={i} {...acoes} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="grid gap-2 md:hidden" aria-label="Itens de estoque">
        {itens.map((i) => (
          <li key={i.id} className="grid gap-2 rounded-lg border p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="grid min-w-0 gap-0.5">
                {nome(i)}
                <span className="text-xs text-muted-foreground">
                  {i.codigo} · {categoriaItemRotulo[i.categoria]}
                  {i.localizacao && ` · ${i.localizacao}`}
                </span>
              </div>
              <Acoes item={i} {...acoes} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Mínimo {i.estoqueMinimo}</span>
              <Saldo item={i} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
