import { PencilIcon, Trash2Icon } from 'lucide-react'
import { Link } from 'react-router'
import { LinhaClicavel } from '@/components/shared/linha-clicavel'
import { useOrigemAtual } from '@/lib/navegacao'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { categoriaLabel, condicaoInfo, type Equipamento } from '../types'

type EquipamentoTableProps = {
  equipamentos: Equipamento[]
  onExcluir: (equipamento: Equipamento) => void
}

export function EquipamentoTable({ equipamentos, onExcluir }: EquipamentoTableProps) {
  const origem = useOrigemAtual()
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-28">Código</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden lg:table-cell">Categoria</TableHead>
            <TableHead className="hidden md:table-cell">Local</TableHead>
            <TableHead className="w-28">Condição</TableHead>
            <TableHead className="w-24">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipamentos.map((e) => {
            const condicao = condicaoInfo[e.condicao]
            return (
              <LinhaClicavel key={e.id} para={e.id}>
                <TableCell className="font-mono text-xs">{e.codigo}</TableCell>
                <TableCell className="font-medium whitespace-normal">{e.nome}</TableCell>
                <TableCell className="hidden lg:table-cell">{categoriaLabel[e.categoria]}</TableCell>
                <TableCell className="hidden text-muted-foreground whitespace-normal md:table-cell">
                  {e.pisoNome} · {e.localizacao}
                </TableCell>
                <TableCell>
                  <StatusBadge tom={condicao.tom}>{condicao.rotulo}</StatusBadge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link to={e.id} state={origem} aria-label={`Editar ${e.nome}`}>
                        <PencilIcon aria-hidden />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon-sm" aria-label={`Excluir ${e.nome}`} onClick={() => onExcluir(e)}>
                      <Trash2Icon aria-hidden />
                    </Button>
                  </div>
                </TableCell>
              </LinhaClicavel>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
