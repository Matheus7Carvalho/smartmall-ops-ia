import { z } from 'zod'
import { LIMITE } from './limites'
import type { Usuario, UsuarioRequest } from './types'

const baseSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome.').max(LIMITE.nome, `Use até ${LIMITE.nome} caracteres.`),
  email: z.email('Informe um e-mail válido.').trim().max(LIMITE.email, `Use até ${LIMITE.email} caracteres.`),
  senha: z.string().max(LIMITE.senha, `Use até ${LIMITE.senha} caracteres.`),
  perfil: z.enum(['ADMINISTRADOR', 'SUPERVISOR', 'FUNCIONARIO']),
  ativo: z.boolean(),
})

export const usuarioSchema = (edicao: boolean) => baseSchema.superRefine((dados, contexto) => {
  if (!edicao && !dados.senha) {
    contexto.addIssue({ code: 'custom', path: ['senha'], message: 'Informe a senha.' })
  } else if (dados.senha && dados.senha.length < 6) {
    contexto.addIssue({ code: 'custom', path: ['senha'], message: 'Use pelo menos 6 caracteres.' })
  }
})

export type UsuarioFormValores = z.infer<typeof baseSchema>

export function paraFormulario(usuario?: Usuario): UsuarioFormValores {
  return { nome: usuario?.nome ?? '', email: usuario?.email ?? '', senha: '', perfil: usuario?.perfil ?? 'FUNCIONARIO', ativo: usuario?.ativo ?? true }
}

export function paraRequisicao(form: UsuarioFormValores): UsuarioRequest {
  return { nome: form.nome, email: form.email, perfil: form.perfil, ativo: form.ativo, ...(form.senha ? { senha: form.senha } : {}) }
}
