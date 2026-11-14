import { Link } from 'react-router'
import { StatusBadge } from '@/components/shared/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatar } from '@/lib/datas'
import { useOrigemAtual } from '@/lib/navegacao'
import { tipoInfo, unidadeCurta, type Movimentacao } from '../types'

type MovimentacoesListaProps = {
  movimentacoes: Movimentacao[]
  /** Na rastreabilidade de um item, a coluna Item é redundante. */
  mostrarItem?: boolean
  /** Nome acessível da lista (ex.: "Movimentações do item"). */
  rotulo: string
}

const quando = (m: Movimentacao) => `${formatar.data(m.dataHora)} ${formatar.hora(m.dataHora)}`
const sinal = (m: Movimentacao) => (m.tipo === 'ENTRADA' ? '+' : '−')

/** Rastreabilidade: quem, quando, quanto, para onde e o saldo depois. Tabela no desktop; cartões no celular. */
export function MovimentacoesLista({ movimentacoes, mostrarItem = true, rotulo }: MovimentacoesListaProps) {
  const origem = useOrigemAtual()
  const linkItem = (m: Movimentacao) => (
    <Link to={`/estoque/${m.item.id}`} state={origem} className="font-medium text-primary underline-offset-4 hover:underline">
      {m.item.codigo} · {m.item.nome}
    </Link>
  )
  const destino = (m: Movimentacao) => (m.equipamento ? `${m.equipamento.codigo} · ${m.equipamento.nome}` : '—')

  return (
    <>
      <div className="hidden min-w-0 rounded-lg border md:block">
        <Table aria-label={rotulo}>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">Data</TableHead>
              {mostrarItem && <TableHead>Item</TableHead>}
              <TableHead className="w-28">Tipo</TableHead>
              <TableHead className="w-28 text-right">Quantidade</TableHead>
              <TableHead className="w-24 text-right">Saldo</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Equipamento</TableHead>
              <TableHead>Observação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movimentacoes.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="tabular-nums">{quando(m)}</TableCell>
                {mostrarItem && <TableCell className="whitespace-normal">{linkItem(m)}</TableCell>}
                <TableCell>
                  <StatusBadge tom={tipoInfo[m.tipo].tom}>{tipoInfo[m.tipo].rotulo}</StatusBadge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {sinal(m)}
                  {m.quantidade} {unidadeCurta[m.unidade]}
                </TableCell>
                <TableCell className="text-right tabular-nums">{m.saldoApos}</TableCell>
                <TableCell className="whitespace-normal">{m.usuario}</TableCell>
                <TableCell className="whitespace-normal text-muted-foreground">{destino(m)}</TableCell>
                <TableCell className="whitespace-normal text-muted-foreground">{m.observacao ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="grid gap-2 md:hidden" aria-label={rotulo}>
        {movimentacoes.map((m) => (
          <li key={m.id} className="grid gap-1 rounded-lg border p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <StatusBadge tom={tipoInfo[m.tipo].tom}>{tipoInfo[m.tipo].rotulo}</StatusBadge>
              <span className="font-medium tabular-nums">
                {sinal(m)}
                {m.quantidade} {unidadeCurta[m.unidade]} · saldo {m.saldoApos}
              </span>
            </div>
            {mostrarItem && linkItem(m)}
            <span className="text-xs text-muted-foreground">
              {quando(m)} · {m.usuario}
              {m.equipamento && ` · ${destino(m)}`}
            </span>
            {m.observacao && <span className="text-xs text-muted-foreground">{m.observacao}</span>}
          </li>
        ))}
      </ul>
    </>
  )
}
