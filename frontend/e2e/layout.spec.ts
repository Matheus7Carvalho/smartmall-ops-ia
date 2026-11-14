import { expect, test } from '@playwright/test'
import { contas, entrar } from './support/auth'

test.describe('Estrutura HTML5 do layout', () => {
  test('página interna tem um main, um h1, cabeçalho e navegação', async ({ page, isMobile }) => {
    await entrar(page, contas.supervisor)

    await expect(page.locator('main')).toHaveCount(1)
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(page.getByRole('banner')).toBeVisible()

    // No celular a navegação fica numa gaveta, montada só quando aberta.
    if (isMobile) await page.getByRole('button', { name: 'Alternar menu' }).click()
    await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible()
  })

  test('no celular, a gaveta do menu fecha ao navegar', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Gaveta existe só no celular.')
    await entrar(page, contas.supervisor)

    await page.getByRole('button', { name: 'Alternar menu' }).click()
    await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Modelos de checklist' }).click()

    await expect(page.getByRole('navigation', { name: 'Principal' })).toBeHidden()
    await expect(page.getByRole('heading', { level: 1, name: 'Modelos de checklist' })).toBeVisible()
  })

  test('tela de login tem um main e um h1', async ({ page }) => {
    await page.goto('/login')

    await expect(page.locator('main')).toHaveCount(1)
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  })
})
