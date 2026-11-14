import { expect, type Locator, type Page } from '@playwright/test'

export const LISTA_MODELOS = '/planejamento/modelos-checklist'

/** Nomes únicos: os testes rodam em paralelo contra o mesmo banco. */
export function nomeUnico(prefixo = 'E2E') {
  return `${prefixo} ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function item(page: Page, numero: number): Locator {
  return page.getByRole('group', { name: `Item ${numero}`, exact: true })
}

export async function escolherTipo(page: Page, numero: number, tipo: 'Sim/Não' | 'Texto' | 'Número') {
  await item(page, numero).getByLabel('Tipo de resposta').click()
  await page.getByRole('option', { name: tipo, exact: true }).click()
}

type ItemDados = { pergunta: string; tipo: 'Sim/Não' | 'Texto' | 'Número'; max?: number; obrigatorio?: boolean }

/** Preenche o formulário já aberto (novo checklist começa com 1 item). */
export async function preencherChecklist(page: Page, nome: string, itens: ItemDados[]) {
  await page.getByLabel('Nome', { exact: true }).fill(nome)
  for (const [i, dados] of itens.entries()) {
    const numero = i + 1
    if (i > 0) await page.getByRole('button', { name: 'Adicionar item' }).click()
    await item(page, numero).getByLabel('Pergunta').fill(dados.pergunta)
    if (dados.tipo !== 'Sim/Não') await escolherTipo(page, numero, dados.tipo)
    if (dados.max !== undefined) await item(page, numero).getByLabel('Máx. caracteres').fill(String(dados.max))
    if (dados.obrigatorio === false) await item(page, numero).getByLabel('Obrigatório').uncheck()
  }
}

const URL_EDICAO = new RegExp(`${LISTA_MODELOS}/[0-9a-f-]{36}$`)

/** Salva e confere que a tela permanece aberta, em modo edição. Retorna o id do checklist. */
export async function salvar(page: Page) {
  // Espera a resposta desta gravação: o toast de uma gravação anterior pode ainda estar na tela.
  const resposta = page.waitForResponse(
    (r) => /\/api\/checklist(\/[^/?]+)?$/.test(new URL(r.url()).pathname) && ['POST', 'PUT'].includes(r.request().method()),
  )
  await page.getByRole('button', { name: 'Salvar' }).click()
  expect((await resposta).ok()).toBe(true)
  await expect(page.locator('form[aria-label="Modelo de checklist"]')).toHaveAttribute('data-alterado', 'false')
  await expect(page.getByText('Modelo de checklist salvo.').last()).toBeVisible()
  await expect(page).toHaveURL(URL_EDICAO)
  await expect(page.getByRole('heading', { level: 1, name: 'Editar modelo de checklist' })).toBeVisible()
  return page.url().split('/').pop()!
}

/** Salva e vai para a listagem (para conferir o resultado lá). */
export async function salvarEVoltar(page: Page) {
  await salvar(page)
  await page.getByRole('button', { name: 'Cancelar' }).click()
  await expect(page).toHaveURL(new RegExp(`${LISTA_MODELOS}$`))
}

export function dialogoDescarte(page: Page) {
  return page.getByRole('alertdialog', { name: 'Descartar alterações?' })
}

export function linha(page: Page, nome: string) {
  return page.getByRole('row').filter({ has: page.getByRole('cell', { name: nome, exact: true }) })
}

/** Remove pela API os checklists criados no teste (usa a sessão do navegador). */
export async function excluirPorNome(page: Page, ...nomes: string[]) {
  const resposta = await page.request.get('/api/checklist?size=500')
  if (!resposta.ok()) return
  const { content } = (await resposta.json()) as { content: { id: string; nome: string }[] }
  for (const checklist of content.filter((c) => nomes.includes(c.nome))) {
    await page.request.delete(`/api/checklist/${checklist.id}`)
  }
}
