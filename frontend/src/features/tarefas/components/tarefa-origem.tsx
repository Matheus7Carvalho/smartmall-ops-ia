import { Link } from 'react-router'
import { useOrigemAtual } from '@/lib/navegacao'
import { origemLabel, rotaOrigemTarefa, tituloTarefa, type Tarefa } from '../types'

/**
 * Origem da tarefa. Quem gerencia abre a manutenção programada; os demais só veem o rótulo.
 * Com chamados, o plano de ação também gera tarefas.
 */
export function TarefaOrigem({ tarefa: t, podeGerenciar }: { tarefa: Tarefa; podeGerenciar: boolean }) {
  const origem = useOrigemAtual()

  const rota = rotaOrigemTarefa(t)
  if (!podeGerenciar || !rota) return <span className="text-xs text-muted-foreground">{origemLabel[t.origem]}</span>

  return (
    <Link
      to={rota}
      state={origem}
      className="relative z-10 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      aria-label={`Abrir ${t.origem === 'CHAMADO' ? 'o chamado' : 'a manutenção programada'} de ${tituloTarefa(t)}`}
    >
      {origemLabel[t.origem]}
    </Link>
  )
}
