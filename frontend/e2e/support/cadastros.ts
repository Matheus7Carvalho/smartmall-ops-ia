import { expect, type Page } from '@playwright/test'

/**
 * Helpers genéricos das telas de cadastro (CadastroForm): salvar e permanecer, voltar à lista,
 * diálogo de descarte e limpeza via API. Mesma sincronização de e2e/support/checklists.ts.
 */

/** Ids fixos da seed de dev (backend/src/main/resources/db/changes). */
export const SEED = {
  pisoL1: '6f1c0a52-0001-4c1e-9a10-000000000001',
  equipamentoElevadorE1: '5a1e0000-0001-4e00-9000-000000000001',
  equipamentoBombaB01: '5a1e0000-0001-4e00-9000-000000000005',
  checklistElevador: '7c3a9e20-0001-4b1d-9c00-000000000001',
  equipeHidraulica: '3e9a0000-0001-4d00-8000-000000000002',
  equipeClimatizacao: '3e9a0000-0001-4d00-8000-000000000001',
  equipeElevadores: '3e9a0000-0001-4d00-8000-000000000003',
  programadaElevadorSemanal: '4c2b0000-0001-4f00-a000-000000000001',
} as const

export function sufixoUnico(tamanho = 6) {
  return (Date.now().toString(36) + Math.random().toString(36).slice(2)).slice(-tamanho).toUpperCase()
}

/** Salva e confere que a tela permaneceu aberta em modo edição. Retorna o id do registro. */
export async function salvarCadastro(page: Page, opcoes: { rotulo: string; recurso: string; lista: string; mensagem: string }) {
  const resposta = page.waitForResponse(
    (r) => new RegExp(`/api/${opcoes.recurso}(/[^/?]+)?$`).test(new URL(r.url()).pathname) && ['POST', 'PUT'].includes(r.request().method()),
  )
  await page.getByRole('button', { name: 'Salvar' }).click()
  expect((await resposta).ok()).toBe(true)
  await expect(page.locator(`form[aria-label="${opcoes.rotulo}"]`)).toHaveAttribute('data-alterado', 'false')
  await expect(page.getByText(opcoes.mensagem).last()).toBeVisible()
  await expect(page).toHaveURL(new RegExp(`${opcoes.lista}/[0-9a-f-]{36}$`))
  return page.url().split('/').pop()!
}

export async function voltarParaLista(page: Page, lista: string) {
  await page.getByRole('button', { name: /^(Cancelar|Voltar)$/ }).click()
  await expect(page).toHaveURL(new RegExp(`${lista}$`))
}

export function dialogoDescarte(page: Page) {
  return page.getByRole('alertdialog', { name: 'Descartar alterações?' })
}

export function linhaCom(page: Page, texto: string) {
  return page.getByRole('row').filter({ hasText: texto })
}

/** Escolhe uma opção num Select (Radix) pelo rótulo do campo. */
export async function escolher(page: Page, rotulo: string, opcao: string | RegExp) {
  await page.getByLabel(rotulo, { exact: true }).click()
  await page.getByRole('option', { name: opcao }).click()
}

/** Apaga pela API os registros de um recurso que satisfazem o filtro (usa a sessão do navegador). */
export async function excluirViaApi<T extends { id: string }>(page: Page, recurso: string, filtro: (registro: T) => boolean) {
  const resposta = await page.request.get(`/api/${recurso}?size=500`)
  if (!resposta.ok()) return
  const { content } = (await resposta.json()) as { content: T[] }
  for (const registro of content.filter(filtro)) {
    await page.request.delete(`/api/${recurso}/${registro.id}`)
  }
}
