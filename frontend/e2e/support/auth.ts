import { expect, type Page } from '@playwright/test'

/** Contas da seed de dev (backend/src/main/resources/db/changes/usuario). */
export const contas = {
  administrador: { nome: 'Rafael Mendes', email: 'admin@smartmall.local', perfil: 'Administrador' },
  supervisor: { nome: 'Ana Souza', email: 'supervisor@smartmall.local', perfil: 'Supervisor' },
  funcionario: { nome: 'João Costa', email: 'funcionario@smartmall.local', perfil: 'Funcionário' },
} as const

export const SENHA_DEMO = 'demo123'

export type Conta = (typeof contas)[keyof typeof contas]

export async function preencherLogin(page: Page, email: string, senha: string) {
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(senha)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
}

export async function entrar(page: Page, conta: Conta) {
  await page.goto('/login')
  await preencherLogin(page, conta.email, SENHA_DEMO)
  await expect(menuDoUsuario(page, conta)).toBeVisible()
}

/** O nome fica oculto em telas estreitas; as iniciais sempre aparecem no botão. */
export function menuDoUsuario(page: Page, conta: Conta) {
  return page.getByRole('banner').getByRole('button', { name: new RegExp(iniciais(conta.nome)) })
}

/** Abre o menu do usuário e clica em "Sair"; retorna o diálogo de confirmação. */
export async function pedirSaida(page: Page, conta: Conta) {
  await menuDoUsuario(page, conta).click()
  await page.getByRole('menuitem', { name: 'Sair' }).click()
  const dialogo = page.getByRole('alertdialog', { name: 'Sair do sistema?' })
  await expect(dialogo).toBeVisible()
  return dialogo
}

export async function sair(page: Page, conta: Conta) {
  const dialogo = await pedirSaida(page, conta)
  await dialogo.getByRole('button', { name: 'Sair' }).click()
  await expect(page).toHaveURL(/\/login$/)
}

function iniciais(nome: string) {
  const partes = nome.split(' ')
  return partes[0][0] + partes[partes.length - 1][0]
}
