import { ImagePlusIcon, Loader2Icon } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { mensagemDeErro } from '@/lib/cadastro'
import { useAdicionarEvidencia, useRemoverEvidencia } from '../hooks'
import { ImagemInvalida, prepararImagem, TIPOS_ACEITOS } from '../imagem'
import { LIMITE } from '../limites'
import type { TarefaDetalhe } from '../types'
import { Miniaturas } from './miniaturas'

/**
 * Imagens ainda não enviadas para análise: anexar (envio imediato ao servidor) e remover.
 * As já enviadas ficam no histórico, ligadas ao envio.
 */
export function EvidenciasPendentes({ detalhe }: { detalhe: TarefaDetalhe }) {
  const id = detalhe.tarefa.id
  const entrada = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(0)
  const adicionar = useAdicionarEvidencia(id)
  const remover = useRemoverEvidencia(id)
  const pendentes = detalhe.evidencias.filter((e) => e.envio === null)
  const envios = [...new Set(detalhe.evidencias.flatMap((e) => (e.envio === null ? [] : [e.envio])))].sort((a, b) => b - a)
  const cheio = pendentes.length >= LIMITE.evidenciasPorEnvio

  const anexar = async (arquivos: FileList | null) => {
    const lista = [...(arquivos ?? [])].slice(0, LIMITE.evidenciasPorEnvio - pendentes.length)
    if (entrada.current) entrada.current.value = ''
    for (const arquivo of lista) {
      setEnviando((n) => n + 1)
      try {
        const { blob, nome } = await prepararImagem(arquivo)
        await adicionar.mutateAsync({ arquivo: blob, nome })
      } catch (e) {
        toast.error(e instanceof ImagemInvalida ? `${arquivo.name}: ${e.message}` : mensagemDeErro(e, 'Não foi possível anexar a imagem.'))
      } finally {
        setEnviando((n) => n - 1)
      }
    }
  }

  return (
    <section aria-labelledby="evidencias-titulo" className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="evidencias-titulo" className="text-lg font-semibold">
          Evidências{' '}
          <span className="text-sm font-normal text-muted-foreground tabular-nums">
            {pendentes.length}/{LIMITE.evidenciasPorEnvio}
          </span>
        </h2>
        <Button type="button" variant="outline" size="sm" disabled={cheio || enviando > 0} onClick={() => entrada.current?.click()}>
          {enviando > 0 ? <Loader2Icon className="animate-spin" aria-hidden /> : <ImagePlusIcon aria-hidden />}
          Anexar imagem
        </Button>
        <input
          ref={entrada}
          type="file"
          accept={TIPOS_ACEITOS}
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-label="Arquivo de imagem"
          onChange={(e) => anexar(e.target.files)}
        />
      </div>
      {envios.length > 0 && <h3 className="text-sm font-medium">Novas</h3>}
      {pendentes.length ? (
        <Miniaturas
          tarefaId={id}
          evidencias={pendentes}
          removendo={remover.isPending}
          onRemover={(e) =>
            remover.mutate(e.id, { onError: (erro) => toast.error(mensagemDeErro(erro, 'Não foi possível remover a imagem.')) })
          }
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          {detalhe.tarefa.envios > 0 ? 'Anexe ao menos uma imagem nova para reenviar.' : 'Anexe ao menos uma imagem.'}
        </p>
      )}
      {/* Imagens já enviadas: ficam visíveis (sem remover) para o responsável comparar e corrigir. */}
      {envios.map((envio) => (
        <div key={envio} className="grid gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">{envio}º envio</h3>
          <Miniaturas tarefaId={id} evidencias={detalhe.evidencias.filter((e) => e.envio === envio)} />
        </div>
      ))}
    </section>
  )
}
