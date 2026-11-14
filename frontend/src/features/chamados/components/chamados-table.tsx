import { ArrowUpRightIcon } from 'lucide-react'
import { Link } from 'react-router'
import { LinhaClicavel } from '@/components/shared/linha-clicavel'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatar } from '@/lib/datas'
import { useOrigemAtual } from '@/lib/navegacao'
import { localChamado, statusChamadoInfo, type Chamado } from '../types'

export function ChamadosTable({ chamados }: { chamados: Chamado[] }) {
  const origem = useOrigemAtual()

  return (
    <>
      <div className="grid gap-3 sm:hidden">
        {chamados.map((chamado) => (
          <article key={chamado.id} data-chamado={chamado.id} className="relative rounded-lg border p-4 hover:bg-muted/50 has-[a[data-abrir]:focus-visible]:ring-2 has-[a[data-abrir]:focus-visible]:ring-ring">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Protocolo</p>
                <Link to={chamado.id} state={origem} data-abrir className="font-medium after:absolute after:inset-0 after:content-['']" aria-label={`Abrir chamado ${chamado.protocolo}`}>{chamado.protocolo}</Link>
              </div>
              <StatusBadge tom={statusChamadoInfo[chamado.status].tom}>{statusChamadoInfo[chamado.status].rotulo}</StatusBadge>
            </div>
            <p className="mt-3 line-clamp-2 break-words text-sm">{chamado.descricao}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="min-w-0"><dt className="text-xs text-muted-foreground">Local</dt><dd className="break-words">{localChamado(chamado)}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Recebido</dt><dd>{formatar.data(chamado.criadoEm)} · {formatar.hora(chamado.criadoEm)}</dd></div>
            </dl>
          </article>
        ))}
      </div>
      <div className="hidden rounded-lg border sm:block">
        <Table>
          <TableHeader><TableRow><TableHead>Protocolo</TableHead><TableHead>Descrição</TableHead><TableHead>Local</TableHead><TableHead>Recebido</TableHead><TableHead>Status</TableHead><TableHead className="w-16"><span className="sr-only">Ações</span></TableHead></TableRow></TableHeader>
          <TableBody>
            {chamados.map((chamado) => (
              <LinhaClicavel key={chamado.id} para={chamado.id}>
                <TableCell className="font-medium">{chamado.protocolo}</TableCell>
                <TableCell className="max-w-72"><span className="line-clamp-2 break-words">{chamado.descricao}</span></TableCell>
                <TableCell className="max-w-56 whitespace-normal break-words">{localChamado(chamado)}</TableCell>
                <TableCell className="whitespace-nowrap">{formatar.data(chamado.criadoEm)} · {formatar.hora(chamado.criadoEm)}</TableCell>
                <TableCell><StatusBadge tom={statusChamadoInfo[chamado.status].tom}>{statusChamadoInfo[chamado.status].rotulo}</StatusBadge></TableCell>
                <TableCell><Button asChild variant="ghost" size="icon-sm"><Link to={chamado.id} state={origem} aria-label={`Abrir chamado ${chamado.protocolo}`}><ArrowUpRightIcon aria-hidden /></Link></Button></TableCell>
              </LinhaClicavel>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
