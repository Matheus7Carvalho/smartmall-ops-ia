import type { ComponentProps, MouseEvent } from 'react'
import { useNavigate } from 'react-router'
import { TableRow } from '@/components/ui/table'
import { useOrigemAtual } from '@/lib/navegacao'
import { cn } from '@/lib/utils'

type LinhaClicavelProps = ComponentProps<typeof TableRow> & {
  /** Rota do registro (edição). */
  para: string
}

/**
 * Linha de tabela que abre o registro ao clicar em qualquer ponto.
 * Botões e links da linha continuam com a própria ação. Pelo teclado, o acesso é o link "Editar …" da linha.
 */
export function LinhaClicavel({ para, className, onClick, ...props }: LinhaClicavelProps) {
  const navigate = useNavigate()
  const origem = useOrigemAtual()

  const aoClicar = (e: MouseEvent<HTMLTableRowElement>) => {
    onClick?.(e)
    const alvo = e.target as HTMLElement
    if (e.defaultPrevented || alvo.closest('a, button, input, [role="checkbox"], [role="menuitem"]')) return
    // Seleção de texto não deve abrir o registro.
    if (window.getSelection()?.toString()) return
    navigate(para, { state: origem })
  }

  return <TableRow className={cn('cursor-pointer', className)} onClick={aoClicar} {...props} />
}
