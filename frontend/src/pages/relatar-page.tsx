import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { CameraIcon, CheckCircle2Icon, ImagesIcon, Loader2Icon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router'
import { Logo } from '@/components/layout/logo'
import { LimitedInput } from '@/components/shared/limited-input'
import { LimitedTextarea } from '@/components/shared/limited-textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { chamadosPublicosApi } from '@/features/chamados-publicos/api'
import { CapturaCamera } from '@/features/chamados-publicos/components/captura-camera'
import { LIMITE_CHAMADO_PUBLICO as LIMITE } from '@/features/chamados-publicos/limites'
import { chamadoPublicoSchema, type ChamadoPublicoForm } from '@/features/chamados-publicos/schemas'
import type { ChamadoPublicoCriado } from '@/features/chamados-publicos/types'
import { ApiError } from '@/lib/api'

const FORMATOS = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']

export function RelatarPage() {
  const [params] = useSearchParams()
  const codigoUrl = params.get('local')?.trim() ?? ''
  const codigo = codigoUrl.length > 0 && codigoUrl.length <= LIMITE.codigoLocal ? codigoUrl : null
  const local = useQuery({
    queryKey: ['local-publico', codigo],
    queryFn: () => chamadosPublicosApi.local(codigo!),
    enabled: !!codigo,
    retry: false,
  })
  const form = useForm<ChamadoPublicoForm>({
    resolver: zodResolver(chamadoPublicoSchema),
    defaultValues: { descricao: '', localInformado: '', contato: '' },
  })
  const { errors } = form.formState
  const [descricao, localInformado, contato] = useWatch({ control: form.control, name: ['descricao', 'localInformado', 'contato'] })
  const [midia, setMidia] = useState<File | null>(null)
  const [erroMidia, setErroMidia] = useState<string | null>(null)
  const [cameraAberta, setCameraAberta] = useState(false)
  const [criado, setCriado] = useState<ChamadoPublicoCriado | null>(null)
  const chaveAtual = useRef<{ assinatura: string; chave: string } | null>(null)
  const galeriaInput = useRef<HTMLInputElement>(null)
  const enviar = useMutation({ mutationFn: ({ dados, arquivo }: { dados: Parameters<typeof chamadosPublicosApi.enviar>[0]; arquivo: File | null }) => chamadosPublicosApi.enviar(dados, arquivo) })

  useEffect(() => {
    if (local.data && !form.getFieldState('localInformado').isDirty) {
      form.setValue('localInformado', local.data.nome)
    }
  }, [local.data, form])

  const selecionarMidia = (arquivo: File | null) => {
    if (galeriaInput.current) galeriaInput.current.value = ''
    setErroMidia(null)
    setMidia(null)
    if (!arquivo) return
    if (arquivo.type && !FORMATOS.includes(arquivo.type)) {
      setErroMidia('Use foto JPG, PNG ou WebP, ou vídeo MP4 ou MOV.')
      return
    }
    const video = arquivo.type.startsWith('video/') || /\.(mp4|mov)$/i.test(arquivo.name)
    const limite = video ? LIMITE.videoBytes : LIMITE.imagemBytes
    if (arquivo.size > limite) {
      setErroMidia(video ? 'O vídeo deve ter no máximo 20 MB.' : 'A foto deve ter no máximo 5 MB.')
      return
    }
    setMidia(arquivo)
  }

  const registrar = (evento: FormEvent<HTMLFormElement>) => form.handleSubmit(async (valores) => {
    if (erroMidia) return
    const assinatura = JSON.stringify({ valores, codigo: local.data?.codigo ?? null, midia: midia && [midia.name, midia.size, midia.lastModified] })
    if (chaveAtual.current?.assinatura !== assinatura) chaveAtual.current = { assinatura, chave: crypto.randomUUID() }
    try {
      const resposta = await enviar.mutateAsync({
        dados: {
          descricao: valores.descricao,
          codigoLocal: local.data?.codigo ?? null,
          localInformado: valores.localInformado,
          contato: valores.contato || null,
          chaveEnvio: chaveAtual.current.chave,
        },
        arquivo: midia,
      })
      setCriado(resposta)
    } catch {
      // O erro permanece na mutação e o formulário fica preenchido para tentar novamente.
    }
  })(evento)

  const novoRelato = () => {
    form.reset({ descricao: '', localInformado: local.data?.nome ?? '', contato: '' })
    setMidia(null)
    setErroMidia(null)
    if (galeriaInput.current) galeriaInput.current.value = ''
    chaveAtual.current = null
    enviar.reset()
    setCriado(null)
  }

  const erroEnvio = enviar.error instanceof ApiError ? enviar.error.message : enviar.error && 'Não foi possível enviar. Tente novamente.'

  return (
    <div className="min-h-svh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-xl items-center px-4 py-3">
          <Logo className="max-w-40" />
        </div>
      </header>
      <main className="mx-auto max-w-xl px-4 py-6 sm:py-10">
        {criado ? (
          <section className="rounded-xl border bg-background p-6 text-center shadow-sm" aria-live="polite">
            <CheckCircle2Icon className="mx-auto size-10 text-emerald-600" aria-hidden />
            <h1 className="mt-4 text-2xl font-semibold">Relato recebido</h1>
            <p className="mt-2 text-sm text-muted-foreground">A equipe vai analisar as informações.</p>
            <p className="mt-5 text-sm">Protocolo <strong className="block text-lg">{criado.protocolo}</strong></p>
            <Button className="mt-6 w-full" onClick={novoRelato}>Registrar outro relato</Button>
          </section>
        ) : (
          <section>
            <h1 className="text-2xl font-semibold tracking-tight">Relatar ocorrência</h1>
            <form className="mt-6 grid gap-6 rounded-xl border bg-background p-4 shadow-sm sm:p-6" onSubmit={registrar} aria-label="Relato público" aria-busy={enviar.isPending}>
              <Field data-invalid={!!errors.localInformado}>
                <FieldLabel htmlFor="relato-local">Local</FieldLabel>
                <LimitedInput id="relato-local" required maxLength={LIMITE.localInformado} length={localInformado?.length ?? 0} aria-invalid={!!errors.localInformado} {...form.register('localInformado')} />
                {local.isPending && codigo && <p className="text-xs text-muted-foreground">Identificando local…</p>}
                {(local.isError || (codigoUrl && !codigo)) && <p className="text-xs text-muted-foreground">QR não reconhecido. Informe o local.</p>}
                {local.data && <p className="text-xs text-muted-foreground">Local do QR: {local.data.nome}{local.data.piso && ` · ${local.data.piso}`}</p>}
                <FieldError errors={[errors.localInformado]} />
              </Field>

              <Field data-invalid={!!errors.descricao}>
                <FieldLabel htmlFor="relato-descricao">O que aconteceu?</FieldLabel>
                <LimitedTextarea id="relato-descricao" required rows={4} maxLength={LIMITE.descricao} length={descricao?.length ?? 0} aria-invalid={!!errors.descricao} {...form.register('descricao')} />
                <FieldError errors={[errors.descricao]} />
              </Field>

              <Field data-invalid={!!erroMidia}>
                <FieldLabel htmlFor="relato-galeria">Foto ou vídeo (opcional)</FieldLabel>
                <input ref={galeriaInput} id="relato-galeria" type="file" accept="image/*,video/*" className="sr-only" onChange={(evento) => selecionarMidia(evento.target.files?.[0] ?? null)} />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => setCameraAberta(true)}><CameraIcon aria-hidden /> Abrir câmera</Button>
                  <Button type="button" variant="outline" onClick={() => galeriaInput.current?.click()}><ImagesIcon aria-hidden /> Escolher arquivo</Button>
                </div>
                {midia && (
                  <div className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-sm">
                    <span className="min-w-0 truncate">{midia.name}</span>
                    <Button type="button" size="icon-sm" variant="ghost" aria-label="Remover mídia" onClick={() => { setMidia(null); if (galeriaInput.current) galeriaInput.current.value = '' }}><XIcon aria-hidden /></Button>
                  </div>
                )}
                {erroMidia && <p className="text-sm text-destructive" role="alert">{erroMidia}</p>}
              </Field>

              <Field data-invalid={!!errors.contato}>
                <FieldLabel htmlFor="relato-contato">WhatsApp ou e-mail (opcional)</FieldLabel>
                <LimitedInput id="relato-contato" type="text" autoComplete="email" maxLength={LIMITE.contato} length={contato?.length ?? 0} aria-invalid={!!errors.contato} {...form.register('contato')} />
                <FieldError errors={[errors.contato]} />
              </Field>

              {erroEnvio && <Alert variant="destructive" role="alert"><AlertDescription>{erroEnvio}</AlertDescription></Alert>}
              <Button type="submit" className="w-full" disabled={enviar.isPending || !!erroMidia}>
                {enviar.isPending && <Loader2Icon className="animate-spin" aria-hidden />}
                Enviar relato
              </Button>
            </form>
            <p className="mt-5 text-center text-xs text-muted-foreground">Em caso de risco imediato, procure a equipe de segurança do shopping.</p>
          </section>
        )}
        <div className="mt-6 text-center text-sm"><Link className="text-muted-foreground underline underline-offset-4" to="/login">Acesso da equipe</Link></div>
      </main>
      {cameraAberta && <CapturaCamera onFechar={() => setCameraAberta(false)} onCapturar={selecionarMidia} />}
    </div>
  )
}
