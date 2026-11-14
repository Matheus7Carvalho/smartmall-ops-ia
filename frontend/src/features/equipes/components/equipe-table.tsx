import { PencilIcon, Trash2Icon } from 'lucide-react'
import { Link } from 'react-router'
import { LinhaClicavel } from '@/components/shared/linha-clicavel'
import { useOrigemAtual } from '@/lib/navegacao'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { pontoDoTom } from '@/lib/tons'
import { SITUACOES_FUNCIONARIO, situacaoFuncionarioInfo, type Disponibilidade } from '../disponibilidade'
import type { Equipe } from '../types'

type EquipeTableProps = {
  equipes: Equipe[]
  /** Situação de hoje dos funcionários; ausente enquanto carrega. */
  disponibilidade?: Disponibilidade[]
  onExcluir: (equipe: Equipe) => void
}

/** "2 disponíveis · 1 ocupado": só as situações presentes na equipe. */
function SituacaoDaEquipe({ equipe, disponibilidade }: { equipe: Equipe; disponibilidade: Disponibilidade[] }) {
  const membros = disponibilidade.filter((f) => f.equipes.some((e) => e.id === equipe.id))
  if (membros.length === 0) return <span className="text-muted-foreground">—</span>
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-0.5" aria-label={`Situação hoje: ${equipe.nome}`}>
      {SITUACOES_FUNCIONARIO.map((s) => {
        const n = membros.filter((f) => f.situacao === s).length
        if (n === 0) return null
        const { singular, plural, tom } = situacaoFuncionarioInfo[s]
        return (
          <li key={s} className="flex items-center gap-1.5 whitespace-nowrap">
            <span className={cn('size-2 rounded-full', pontoDoTom[tom])} aria-hidden />
            {n} {n === 1 ? singular : plural}
          </li>
        )
      })}
    </ul>
  )
}

export function EquipeTable({ equipes, disponibilidade, onExcluir }: EquipeTableProps) {
  const origem = useOrigemAtual()
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-56">Nome</TableHead>
            <TableHead>Membros</TableHead>
            <TableHead className="w-64">Hoje</TableHead>
            <TableHead className="w-36">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipes.map((e) => (
            <LinhaClicavel key={e.id} para={e.id}>
              <TableCell className="font-medium whitespace-normal">{e.nome}</TableCell>
              <TableCell className="whitespace-normal text-muted-foreground">
                {e.membros.length === 0 ? 'Sem membros' : e.membros.map((m) => m.nome).join(', ')}
              </TableCell>
              <TableCell className="text-sm">{disponibilidade && <SituacaoDaEquipe equipe={e} disponibilidade={disponibilidade} />}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/tarefas?equipe=${e.id}&visao=kanban`} state={origem} aria-label={`Ver tarefas de ${e.nome}`}>
                      Tarefas
                    </Link>
                  </Button>
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
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
