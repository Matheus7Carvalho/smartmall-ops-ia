import { EyeIcon } from 'lucide-react'
import { Link } from 'react-router'
import { LinhaClicavel } from '@/components/shared/linha-clicavel'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatar } from '@/lib/datas'
import { useOrigemAtual } from '@/lib/navegacao'
import { localTarefa, tituloTarefa, type Tarefa } from '../types'

/** Tarefas enviadas para análise, o envio mais antigo primeiro. */
export function FilaAnaliseTable({ tarefas }: { tarefas: Tarefa[] }) {
  const origem = useOrigemAtual()
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarefa</TableHead>
            <TableHead className="hidden md:table-cell">Equipe</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead className="hidden w-36 sm:table-cell">Prevista</TableHead>
            <TableHead className="w-36">Enviada</TableHead>
            <TableHead className="w-14">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tarefas.map((t) => {
            const nome = tituloTarefa(t)
            return (
              <LinhaClicavel key={t.id} para={`/tarefas/${t.id}`}>
                <TableCell className="whitespace-normal">
                  <div className="font-medium">{nome}</div>
                  <div className="text-xs text-muted-foreground">
                    {localTarefa(t)}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{t.equipe.nome}</TableCell>
                <TableCell className="whitespace-normal">{t.responsavel?.nome ?? '—'}</TableCell>
                <TableCell className="hidden tabular-nums sm:table-cell">{formatar.data(t.dataHoraPrevista)}</TableCell>
                <TableCell className="tabular-nums">
                  {t.ultimoEnvio ? `${formatar.data(t.ultimoEnvio)} ${formatar.hora(t.ultimoEnvio)}` : '—'}
                  {t.envios > 1 && <div className="text-xs text-muted-foreground">{t.envios}º envio</div>}
                </TableCell>
                <TableCell>
                  <Button asChild variant="ghost" size="icon-sm">
                    <Link to={`/tarefas/${t.id}`} state={origem} aria-label={`Analisar tarefa de ${nome}`}>
                      <EyeIcon aria-hidden />
                    </Link>
                  </Button>
                </TableCell>
              </LinhaClicavel>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
