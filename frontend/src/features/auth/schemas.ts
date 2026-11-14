import { z } from 'zod'

/** Iguais ao LoginRequest do backend. Senha: 72 é o limite do BCrypt. */
export const LIMITE_LOGIN = { email: 150, senha: 72 } as const

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Informe o e-mail.')
    .max(LIMITE_LOGIN.email, `Use até ${LIMITE_LOGIN.email} caracteres.`)
    .email('E-mail inválido.'),
  senha: z.string().min(1, 'Informe a senha.').max(LIMITE_LOGIN.senha, `Use até ${LIMITE_LOGIN.senha} caracteres.`),
})

export type LoginForm = z.infer<typeof loginSchema>
