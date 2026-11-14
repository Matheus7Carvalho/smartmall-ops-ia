import { PencilIcon, Trash2Icon } from 'lucide-react'
import { Link } from 'react-router'
import { LinhaClicavel } from '@/components/shared/linha-clicavel'
import { useOrigemAtual } from '@/lib/navegacao'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatarDataHora } from '@/lib/format'
import type { Checklist } from '../types'

type ChecklistTableProps = {
  checklists: Checklist[]
  onExcluir: (checklist: Checklist) => void
}

export function ChecklistTable({ checklists, onExcluir }: ChecklistTableProps) {
  const origem = useOrigemAtual()
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="w-20 text-right">Itens</TableHead>
            <TableHead className="hidden w-40 md:table-cell">Atualizado em</TableHead>
            <TableHead className="w-24">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {checklists.map((checklist) => (
            <LinhaClicavel key={checklist.id} para={checklist.id}>
              <TableCell className="font-medium whitespace-normal">{checklist.nome}</TableCell>
              <TableCell className="text-right tabular-nums">{checklist.itens.length}</TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">
                {formatarDataHora(checklist.dataAtualizacao ?? checklist.dataCriacao)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="icon-sm">
                    <Link to={checklist.id} state={origem} aria-label={`Editar ${checklist.nome}`}>
                      <PencilIcon aria-hidden />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label={`Excluir ${checklist.nome}`} onClick={() => onExcluir(checklist)}>
                    <Trash2Icon aria-hidden />
                  </Button>
                </div>
              </TableCell>
            </LinhaClicavel>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
