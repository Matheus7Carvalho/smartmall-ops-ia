import { DownloadIcon, PaperclipIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Chamado } from '../types'

/** Mídia entregue pela rota autenticada; nenhum endereço externo é aceito do relato. */
export function ChamadoMidia({ chamado }: { chamado: Chamado }) {
  const url = `/api/chamado/${encodeURIComponent(chamado.id)}/midia`
  const [previa, setPrevia] = useState<string | null>(null)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    if (!chamado.midia) return
    const controle = new AbortController()
    let objeto: string | undefined
    fetch(url, { signal: controle.signal })
      .then((resposta) => {
        if (!resposta.ok) throw new Error('Falha ao carregar mídia.')
        return resposta.blob()
      })
      .then((arquivo) => {
        if (controle.signal.aborted) return
        objeto = URL.createObjectURL(arquivo)
        setPrevia(objeto)
      })
      .catch(() => { if (!controle.signal.aborted) setErro(true) })
    return () => { controle.abort(); if (objeto) URL.revokeObjectURL(objeto) }
  }, [chamado.midia, url])

  if (!chamado.midia) return <p className="text-sm text-muted-foreground">Nenhuma mídia anexada.</p>
  const tipo = chamado.midia.tipo.toLowerCase()

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <PaperclipIcon className="size-4" aria-hidden />
        <span className="min-w-0 break-all">{chamado.midia.nome}</span>
        <span className="text-muted-foreground">({(chamado.midia.tamanhoBytes / 1024 / 1024).toFixed(1)} MB)</span>
      </div>
      {!previa && !erro && <p className="text-sm text-muted-foreground">Carregando prévia...</p>}
      {erro && <p role="alert" className="text-sm text-destructive">Não foi possível carregar a prévia.</p>}
      {previa && tipo.startsWith('image/') && <img src={previa} alt={`Mídia anexada ao chamado ${chamado.protocolo}`} className="max-h-96 max-w-full rounded-lg border object-contain" />}
      {previa && tipo.startsWith('video/') && <video src={previa} controls preload="metadata" className="max-h-96 max-w-full rounded-lg border" aria-label={`Vídeo anexado ao chamado ${chamado.protocolo}`} />}
      <Button asChild variant="outline" size="sm"><a href={url} download={chamado.midia.nome}><DownloadIcon aria-hidden /> Baixar mídia</a></Button>
    </div>
  )
}
