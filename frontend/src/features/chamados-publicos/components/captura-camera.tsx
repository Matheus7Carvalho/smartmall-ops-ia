import { CameraIcon, Loader2Icon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Dialog } from 'radix-ui'
import { Button } from '@/components/ui/button'

type CapturaCameraProps = {
  onFechar: () => void
  onCapturar: (arquivo: File) => void
}

function mensagemErroCamera(erro: unknown) {
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    return 'Para usar a câmera, abra esta página por HTTPS ou localhost. Você pode escolher uma foto do aparelho.'
  }
  if (erro instanceof DOMException && (erro.name === 'NotAllowedError' || erro.name === 'PermissionDeniedError')) {
    return 'Permita o acesso à câmera nas configurações do navegador e tente novamente.'
  }
  if (erro instanceof DOMException && (erro.name === 'NotFoundError' || erro.name === 'DevicesNotFoundError')) {
    return 'Nenhuma câmera foi encontrada neste aparelho.'
  }
  return 'Não foi possível abrir a câmera. Verifique se ela está disponível e tente novamente.'
}

export function CapturaCamera({ onFechar, onCapturar }: CapturaCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [pronta, setPronta] = useState(false)
  const [capturando, setCapturando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let cancelada = false
    let camera: MediaStream | null = null

    async function iniciar() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErro(mensagemErroCamera(null))
        return
      }
      try {
        camera = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' } } })
        if (cancelada) camera.getTracks().forEach((track) => track.stop())
        else setStream(camera)
      } catch (falha) {
        if (!cancelada) setErro(mensagemErroCamera(falha))
      }
    }

    void iniciar()
    return () => {
      cancelada = true
      camera?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream
  }, [stream])

  async function fotografar() {
    const video = videoRef.current
    if (!video || !pronta || !video.videoWidth || !video.videoHeight) return
    setCapturando(true)
    try {
      const canvas = document.createElement('canvas')
      const escala = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight))
      canvas.width = Math.round(video.videoWidth * escala)
      canvas.height = Math.round(video.videoHeight * escala)
      const contexto = canvas.getContext('2d')
      if (!contexto) throw new Error('Falha ao preparar a foto')
      contexto.drawImage(video, 0, 0, canvas.width, canvas.height)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
      if (!blob) throw new Error('Falha ao gerar a foto')
      onCapturar(new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' }))
      onFechar()
    } catch {
      setErro('Não foi possível tirar a foto. Tente novamente.')
    } finally {
      setCapturando(false)
    }
  }

  return (
    <Dialog.Root open onOpenChange={(aberta) => { if (!aberta) onFechar() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-lg -translate-y-1/2 rounded-xl bg-background p-4 shadow-xl outline-none sm:p-6" aria-describedby="captura-camera-descricao">
          <Dialog.Title className="text-lg font-semibold">Tirar foto</Dialog.Title>
          <Dialog.Description id="captura-camera-descricao" className="mt-1 text-sm text-muted-foreground">Autorize a câmera no navegador para fotografar o local.</Dialog.Description>
          <div className="relative mt-4 overflow-hidden rounded-lg bg-black">
            <video ref={videoRef} autoPlay muted playsInline aria-label="Prévia da câmera" className="aspect-[3/4] w-full object-cover sm:aspect-video" onLoadedData={() => setPronta(true)} />
            {!pronta && !erro && <div className="absolute inset-0 flex items-center justify-center text-white"><Loader2Icon className="size-6 animate-spin" aria-label="Abrindo câmera" /></div>}
          </div>
          {erro && <p className="mt-3 text-sm text-destructive" role="alert">{erro}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onFechar}>Cancelar</Button>
            <Button type="button" disabled={!pronta || capturando || !!erro} onClick={fotografar}>
              {capturando ? <Loader2Icon className="animate-spin" aria-hidden /> : <CameraIcon aria-hidden />}
              Fotografar
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
