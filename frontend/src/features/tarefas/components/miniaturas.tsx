import { XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { urlDaEvidencia } from '../api'
import type { Evidencia } from '../types'

type MiniaturasProps = {
  tarefaId: string
  evidencias: Evidencia[]
  /** Só para evidências ainda não enviadas. */
  onRemover?: (evidencia: Evidencia) => void
  removendo?: boolean
}

/** Imagens de evidência; cada uma abre em tamanho real numa nova aba. */
export function Miniaturas({ tarefaId, evidencias, onRemover, removendo }: MiniaturasProps) {
  if (!evidencias.length) return null
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Imagens">
      {evidencias.map((e) => (
        <li key={e.id} className="group relative">
          <a
            href={urlDaEvidencia(tarefaId, e.id)}
            target="_blank"
            rel="noreferrer"
            className="block size-24 overflow-hidden rounded-md border bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label={`Abrir ${e.nomeArquivo}`}
          >
            <img src={urlDaEvidencia(tarefaId, e.id)} alt={e.nomeArquivo} loading="lazy" className="size-full object-cover" />
          </a>
          {onRemover && (
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="absolute top-1 right-1 shadow md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100"
              aria-label={`Remover ${e.nomeArquivo}`}
              disabled={removendo}
              onClick={() => onRemover(e)}
            >
              <XIcon aria-hidden />
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}
