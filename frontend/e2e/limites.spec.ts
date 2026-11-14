import { expect, test } from '@playwright/test'
import { contas, entrar } from './support/auth'
import { escolherTipo, LISTA_MODELOS } from './support/checklists'
import { camposSemLimite } from './support/limites'

/**
 * Guarda: nenhum campo de formulário sem limite de caracteres (ou min/max, para números).
 * Ao criar uma tela com formulário, inclua-a aqui.
 */
test.describe('Todo campo tem limite', () => {
  test('relato público sem login', async ({ page }) => {
    await page.goto('/relatar?local=banheiro-norte')
    await expect(page.getByRole('heading', { name: 'Relatar ocorrência' })).toBeVisible()

    expect(await camposSemLimite(page)).toEqual([])
  })

  test('login', async ({ page }) => {
    await page.goto('/login')

    expect(await camposSemLimite(page)).toEqual([])
  })

  test('cadastro de checklist (com item Texto aberto)', async ({ page }) => {
    await entrar(page, contas.supervisor)
    await page.goto(`${LISTA_MODELOS}/novo`)
    await escolherTipo(page, 1, 'Texto')

    expect(await camposSemLimite(page)).toEqual([])
  })

  for (const tela of [
    '/cadastros/equipamentos/novo',
    '/cadastros/equipes/nova',
    '/planejamento/manutencoes-programadas/nova',
    '/tarefas',
    // Listagens: campos de filtro também têm limite.
    '/cadastros/equipamentos',
    '/cadastros/equipes',
    '/cadastros/equipes?visao=funcionarios',
    '/relatorios',
    '/estoque/novo',
    '/estoque',
    '/estoque?visao=movimentacoes',
    '/planejamento/manutencoes-programadas',
    '/planejamento/modelos-checklist',
    '/chamados',
  ]) {
    test(`tela ${tela}`, async ({ page }) => {
      await entrar(page, contas.supervisor)
      await page.goto(tela)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await page.waitForLoadState('networkidle')

      expect(await camposSemLimite(page)).toEqual([])
    })
  }

  test('edição de checklist da seed', async ({ page }) => {
    await entrar(page, contas.supervisor)
    await page.goto(`${LISTA_MODELOS}/7c3a9e20-0001-4b1d-9c00-000000000001`)
    await expect(page.getByLabel('Nome', { exact: true })).not.toHaveValue('')

    expect(await camposSemLimite(page)).toEqual([])
  })

  for (const tela of ['/cadastros/usuarios', '/cadastros/usuarios/novo']) {
    test(`tela ${tela}`, async ({ page }) => {
      await entrar(page, contas.administrador)
      await page.goto(tela)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await page.waitForLoadState('networkidle')

      expect(await camposSemLimite(page)).toEqual([])
    })
  }
})
