import { CircleStopIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { Link } from 'react-router'
import { LinhaClicavel } from '@/components/shared/linha-clicavel'
import { useOrigemAtual } from '@/lib/navegacao'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatar } from '@/lib/datas'
import { descreverRecorrencia, descreverVigencia } from '../recorrencia'
import { nomeDaProgramada, type ManutencaoProgramada } from '../types'

type ManutencaoProgramadaTableProps = {
  programadas: ManutencaoProgramada[]
  onEncerrar: (programada: ManutencaoProgramada) => void
  onExcluir: (programada: ManutencaoProgramada) => void
}

export function ManutencaoProgramadaTable({ programadas, onEncerrar, onExcluir }: ManutencaoProgramadaTableProps) {
  const origem = useOrigemAtual()
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Equipamento</TableHead>
            <TableHead className="hidden lg:table-cell">Recorrência</TableHead>
            <TableHead className="hidden w-48 md:table-cell">Vigência</TableHead>
            <TableHead className="hidden md:table-cell">Equipe</TableHead>
            <TableHead className="w-36">Próxima tarefa</TableHead>
            <TableHead className="w-28">Situação</TableHead>
            <TableHead className="w-32">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programadas.map((p) => {
            const nome = nomeDaProgramada(p)
            return (
              <LinhaClicavel key={p.id} para={p.id}>
                <TableCell className="whitespace-normal">
                  <div className="font-medium">{nome}</div>
                  <div className="text-xs text-muted-foreground">{p.checklist.nome}</div>
                  {/* Telas estreitas: a vigência (usada pelo filtro de período) vem aqui, sem coluna própria. */}
                  <div className="text-xs text-muted-foreground md:hidden">{descreverVigencia(p)}</div>
                </TableCell>
                <TableCell className="hidden max-w-sm whitespace-normal text-muted-foreground lg:table-cell">
                  {descreverRecorrencia(p, { comVigencia: false })}
                </TableCell>
                <TableCell className="hidden tabular-nums md:table-cell">{descreverVigencia(p)}</TableCell>
                <TableCell className="hidden md:table-cell">{p.equipe.nome}</TableCell>
                <TableCell className="tabular-nums">
                  {p.proximaData ? `${formatar.data(p.proximaData)} ${formatar.hora(p.proximaData)}` : '—'}
                </TableCell>
                <TableCell>
                  <StatusBadge tom={p.ativo ? 'sucesso' : 'neutro'}>{p.ativo ? 'Ativa' : 'Encerrada'}</StatusBadge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link to={p.id} state={origem} aria-label={`${p.ativo ? 'Editar' : 'Ver'} manutenção programada de ${nome}`}>
                        <PencilIcon aria-hidden />
                      </Link>
                    </Button>
                    {p.ativo && (
                      <Button variant="ghost" size="icon-sm" aria-label={`Encerrar manutenção programada de ${nome}`} onClick={() => onEncerrar(p)}>
                        <CircleStopIcon aria-hidden />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon-sm" aria-label={`Excluir manutenção programada de ${nome}`} onClick={() => onExcluir(p)}>
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
