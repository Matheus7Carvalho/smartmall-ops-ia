import { CalendarOffIcon, CalendarPlusIcon } from 'lucide-react'
import { Link } from 'react-router'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatar } from '@/lib/datas'
import { useOrigemAtual } from '@/lib/navegacao'
import { motivoAusenciaRotulo, situacaoFuncionarioInfo, type Ausencia, type Disponibilidade } from '../disponibilidade'

type Acoes = {
  onRegistrarAusencia: (f: Disponibilidade) => void
  onEncerrarAusencia: (f: Disponibilidade) => void
}

type FuncionariosTableProps = Acoes & { funcionarios: Disponibilidade[] }

/** "Férias até 20/11/2026" (vigente) ou "Folga de 20/11/2026 a 22/11/2026" (agendada). */
function textoAusencia(a: Ausencia, vigente: boolean) {
  const motivo = motivoAusenciaRotulo[a.motivo]
  if (vigente) return `${motivo} até ${formatar.data(a.fim)}`
  return a.inicio === a.fim ? `${motivo} em ${formatar.data(a.inicio)}` : `${motivo} de ${formatar.data(a.inicio)} a ${formatar.data(a.fim)}`
}

const equipesDe = (f: Disponibilidade) => (f.equipes.length === 0 ? 'Sem equipe' : f.equipes.map((e) => e.nome).join(', '))

function Situacao({ f }: { f: Disponibilidade }) {
  const info = situacaoFuncionarioInfo[f.situacao]
  return <StatusBadge tom={info.tom}>{info.rotulo}</StatusBadge>
}

/** Tarefa em execução (com link) e ausência vigente ou agendada. */
function Atividade({ f }: { f: Disponibilidade }) {
  const origem = useOrigemAtual()
  return (
    <div className="grid gap-0.5">
      {f.tarefaAtual && (
        <span>
          <Link to={`/tarefas/${f.tarefaAtual.id}`} state={origem} className="font-medium text-primary underline-offset-4 hover:underline">
            {f.tarefaAtual.equipamento}
          </Link>
          {f.tarefasEmExecucao > 1 && <span className="text-muted-foreground"> e mais {f.tarefasEmExecucao - 1}</span>}
          <span className="block text-xs text-muted-foreground">{f.tarefaAtual.equipe}</span>
        </span>
      )}
      {f.ausencia && <span className="text-xs text-muted-foreground">{textoAusencia(f.ausencia, f.situacao === 'INDISPONIVEL')}</span>}
      {!f.tarefaAtual && !f.ausencia && <span className="text-muted-foreground">Sem tarefa em execução</span>}
    </div>
  )
}

function AcoesFuncionario({ f, onRegistrarAusencia, onEncerrarAusencia }: Acoes & { f: Disponibilidade }) {
  return (
    <div className="flex shrink-0 justify-end gap-1">
      {f.ausencia && (
        <Button variant="ghost" size="icon-sm" aria-label={`Encerrar ausência de ${f.nome}`} onClick={() => onEncerrarAusencia(f)}>
          <CalendarOffIcon aria-hidden />
        </Button>
      )}
      <Button variant="ghost" size="icon-sm" aria-label={`Registrar ausência de ${f.nome}`} onClick={() => onRegistrarAusencia(f)}>
        <CalendarPlusIcon aria-hidden />
      </Button>
    </div>
  )
}

/** Tabela no desktop; no celular, cartões empilhados (mesmo conteúdo, sem rolagem lateral). */
export function FuncionariosTable({ funcionarios, ...acoes }: FuncionariosTableProps) {
  return (
    <>
      <div className="hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">Funcionário</TableHead>
              <TableHead>Equipes</TableHead>
              <TableHead className="w-32">Situação</TableHead>
              <TableHead>Atividade</TableHead>
              <TableHead className="w-24">
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {funcionarios.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium whitespace-normal">{f.nome}</TableCell>
                <TableCell className="whitespace-normal text-muted-foreground">{equipesDe(f)}</TableCell>
                <TableCell>
                  <Situacao f={f} />
                </TableCell>
                <TableCell className="whitespace-normal">
                  <Atividade f={f} />
                </TableCell>
                <TableCell>
                  <AcoesFuncionario f={f} {...acoes} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="grid gap-2 md:hidden" aria-label="Funcionários">
        {funcionarios.map((f) => (
          <li key={f.id} className="grid gap-2 rounded-lg border p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="grid min-w-0 gap-0.5">
                <span className="font-medium">{f.nome}</span>
                <span className="text-xs text-muted-foreground">{equipesDe(f)}</span>
              </div>
              <AcoesFuncionario f={f} {...acoes} />
            </div>
            <div className="flex items-start gap-3">
              <Situacao f={f} />
              <Atividade f={f} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
