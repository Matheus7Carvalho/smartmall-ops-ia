import { z } from 'zod'
import { LIMITE_CHAMADO_PUBLICO } from './limites'

export const chamadoPublicoSchema = z.object({
  descricao: z.string().trim().min(1, 'Descreva o que aconteceu.').max(LIMITE_CHAMADO_PUBLICO.descricao, 'Descrição muito longa.'),
  localInformado: z.string().trim().min(1, 'Informe o local.').max(LIMITE_CHAMADO_PUBLICO.localInformado, 'Local muito longo.'),
  contato: z.string().trim().max(LIMITE_CHAMADO_PUBLICO.contato, 'Contato muito longo.').refine((valor) => {
    if (!valor) return true
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return true
    if (!/^\+?[0-9 ()-]+$/.test(valor)) return false
    const digitos = valor.replace(/\D/g, '')
    return digitos.length >= 10 && digitos.length <= 13
  }, 'Informe um WhatsApp ou e-mail válido.'),
})

export type ChamadoPublicoForm = z.infer<typeof chamadoPublicoSchema>
