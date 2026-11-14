import type { ReactNode } from 'react'
import { Medidor } from '@/components/shared/medidor'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Contagem } from '../types'

export type LinhaContagem = { id: string; nome: ReactNode; rotulo: string; contagem: Contagem }

type TabelaContagemProps = {
  /** Cabeçalho da primeira coluna (ex.: "Equipe"). */
  coluna: string
  linhas: LinhaContagem[]
}

/** Contagens por grupo (equipe, equipamento), com a taxa de conclusão em barra. */
export function TabelaContagem({ coluna, linhas }: TabelaContagemProps) {
  return (
    // min-w-0: a tabela larga rola dentro da borda, sem alargar a página.
    <div className="min-w-0 rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-40">{coluna}</TableHead>
            <TableHead className="text-right">Previstas</TableHead>
            <TableHead className="text-right">Concluídas</TableHead>
            <TableHead className="text-right">Em andamento</TableHead>
            <TableHead className="text-right">Atrasadas</TableHead>
            <TableHead className="text-right">Canceladas</TableHead>
            <TableHead className="text-right">Com reprovação</TableHead>
            <TableHead className="min-w-40">Conclusão</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {linhas.map(({ id, nome, rotulo, contagem: c }) => (
            <TableRow key={id}>
              <TableCell className="whitespace-normal">{nome}</TableCell>
              <TableCell className="text-right tabular-nums">{c.total}</TableCell>
              <TableCell className="text-right tabular-nums">{c.concluidas}</TableCell>
              <TableCell className="text-right tabular-nums">{c.emExecucao + c.emAnalise}</TableCell>
              <TableCell className="text-right tabular-nums">{c.atrasadas}</TableCell>
              <TableCell className="text-right tabular-nums">{c.canceladas}</TableCell>
              <TableCell className="text-right tabular-nums">{c.comReprovacao}</TableCell>
              <TableCell>
                <Medidor rotulo={`Conclusão: ${rotulo}`} percentual={c.taxaConclusao} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
