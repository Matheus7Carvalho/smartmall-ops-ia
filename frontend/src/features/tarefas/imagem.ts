import { LIMITE } from './limites'

const ACEITOS = ['image/jpeg', 'image/png', 'image/webp']
/** Fotos de celular costumam passar de 5 MB: acima disto, a imagem é reduzida antes do envio. */
const REDUZIR_ACIMA_DE = 1.5 * 1024 * 1024
const LADO_MAXIMO = 1920

export const TIPOS_ACEITOS = ACEITOS.join(',')

export class ImagemInvalida extends Error {}

/**
 * Prepara a foto para envio: aceita JPG, PNG e WebP e reduz as grandes para JPEG de até 1920 px,
 * mantendo-as abaixo do limite do servidor (5 MB).
 */
export async function prepararImagem(arquivo: File): Promise<{ blob: Blob; nome: string }> {
  if (!ACEITOS.includes(arquivo.type)) throw new ImagemInvalida('Envie uma imagem JPG, PNG ou WebP.')
  if (arquivo.size <= REDUZIR_ACIMA_DE) return { blob: arquivo, nome: arquivo.name }

  const bitmap = await createImageBitmap(arquivo).catch(() => {
    throw new ImagemInvalida('Não foi possível ler a imagem.')
  })
  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * escala)
  canvas.height = Math.round(bitmap.height * escala)
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', 0.85))
  if (!blob) throw new ImagemInvalida('Não foi possível ler a imagem.')
  if (blob.size > LIMITE.bytesEvidencia) throw new ImagemInvalida('A imagem deve ter no máximo 5 MB.')
  return { blob, nome: arquivo.name.replace(/\.[^.]+$/, '') + '.jpg' }
}
