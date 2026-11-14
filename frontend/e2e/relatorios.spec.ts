import { expect, test, type Page } from '@playwright/test'
import { contas, entrar } from './support/auth'
import { escolher, linhaCom } from './support/cadastros'

const RELATORIOS = '/relatorios'
const API = '**/api/relatorio/tarefas?*'

type Contagem = {
  total: number
  agendadas: number
  atrasadas: number
  emExecucao: number
  emAnalise: number
  concluidas: number
  canceladas: number
  comReprovacao: number
  taxaConclusao: number
}
type Relatorio = {
  de: string
  ate: string
  totais: Contagem
  porEquipe: { id: string; nome: string; contagem: Contagem }[]
  porEquipamento: { id: string; codigo: string; nome: string; condicao: string; contagem: Contagem }[]
}

const contagem = (c: Partial<Contagem>): Contagem => ({ total: 0, agendadas: 0, atrasadas: 0, emExecucao: 0, emAnalise: 0, concluidas: 0, canceladas: 0, comReprovacao: 0, taxaConclusao: 0, ...c })

const FIXO: Relatorio = {
  de: '2026-11-01',
  ate: '2026-11-30',
  totais: contagem({ total: 10, agendadas: 3, atrasadas: 1, emExecucao: 1, emAnalise: 1, concluidas: 3, canceladas: 1, comReprovacao: 2, taxaConclusao: 33 }),
  porEquipe: [
    { id: 'eq-1', nome: 'Elevadores e escadas', contagem: contagem({ total: 6, concluidas: 3, canceladas: 0, taxaConclusao: 50, comReprovacao: 2 }) },
    { id: 'eq-2', nome: 'Hidráulica', contagem: contagem({ total: 4, atrasadas: 1, canceladas: 1, taxaConclusao: 0 }) },
  ],
  porEquipamento: [{ id: 'q-1', codigo: 'ELV-E2', nome: 'Elevador E2', condicao: 'ATENCAO', contagem: contagem({ total: 6, concluidas: 3, taxaConclusao: 50 }) }],
}

/** Valor (dd) do item do resumo cujo rótulo (dt) é exatamente o informado. */
const valorResumo = (page: Page, rotulo: string) =>
  page.getByLabel('Resumo do período').getByRole('term').filter({ hasText: new RegExp(`^${rotulo}$`) }).locator('xpath=following-sibling::dd[1]')

const pad = (n: number) => String(n).padStart(2, '0')

test.describe('Relatórios (Supervisor)', () => {
  test.beforeEach(async ({ page }) => entrar(page, contas.supervisor))

  test('abre pelo menu, com estrutura HTML5 e o mês corrente como período', async ({ page, isMobile }) => {
    await page.goto('/tarefas')
    if (isMobile) await page.getByRole('button', { name: 'Alternar menu' }).click()
    await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Relatórios' }).click()

    await expect(page).toHaveURL(new RegExp(`${RELATORIOS}$`))
    await expect(page.getByRole('heading', { level: 1, name: 'Relatórios' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(page.getByRole('main')).toHaveCount(1)
    await expect(page.getByRole('heading', { level: 2, name: 'Tarefas' })).toBeVisible()
    const hoje = new Date()
    await expect(page.getByLabel('De', { exact: true })).toHaveValue(`${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}-01`)
  })

  test('mostra os números calculados pelo servidor', async ({ page }) => {
    const resposta = page.waitForResponse((r) => r.url().includes('/api/relatorio/tarefas') && r.ok())
    await page.goto(RELATORIOS)
    const relatorio = (await (await resposta).json()) as Relatorio
    test.skip(relatorio.totais.total === 0, 'Sem tarefas previstas no mês corrente.')

    await expect(valorResumo(page, 'Previstas')).toHaveText(String(relatorio.totais.total))
    await expect(valorResumo(page, 'Concluídas')).toHaveText(String(relatorio.totais.concluidas))
    const porEquipe = page.getByRole('region', { name: 'Por equipe' })
    await expect(porEquipe.getByRole('row')).toHaveCount(relatorio.porEquipe.length + 1)
  })

  test('apresenta resumo, equipes e equipamentos com a taxa de conclusão', async ({ page }) => {
    await page.route(API, (rota) => rota.fulfill({ json: FIXO }))
    await page.goto(RELATORIOS)

    await expect(valorResumo(page, 'Previstas')).toHaveText('10')
    await expect(page.getByLabel('Resumo do período')).toContainText('33% de conclusão')
    await expect(valorResumo(page, 'Em andamento')).toHaveText('2')
    await expect(valorResumo(page, 'Com reprovação')).toHaveText('2')

    const elevadores = linhaCom(page, 'Elevadores e escadas')
    await expect(elevadores.getByRole('meter', { name: 'Conclusão: Elevadores e escadas' })).toHaveAttribute('aria-valuenow', '50')
    await expect(elevadores.getByRole('link', { name: 'Elevadores e escadas' })).toHaveAttribute('href', '/tarefas?equipe=eq-1&visao=kanban')

    const elevadorE2 = linhaCom(page, 'ELV-E2 · Elevador E2')
    await expect(elevadorE2).toContainText('Atenção')
    await expect(elevadorE2.getByRole('link', { name: 'ELV-E2 · Elevador E2' })).toHaveAttribute('href', '/cadastros/equipamentos/q-1')
    // As tabelas largas rolam dentro da própria borda; a página não ganha rolagem lateral.
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0)
  })

  test('filtra por equipe e valida o período sem consultar o servidor', async ({ page }) => {
    await page.goto(RELATORIOS)
    await expect(page.getByRole('heading', { level: 2, name: 'Tarefas' })).toBeVisible()

    const pediu = page.waitForRequest((r) => r.url().includes('/api/relatorio/tarefas') && r.url().includes('equipeId='))
    await escolher(page, 'Equipe', 'Hidráulica')
    await pediu
    await expect(page).toHaveURL(/equipe=/)

    let consultou = false
    await page.route(API, (rota) => {
      consultou = true
      return rota.continue()
    })
    const ate = await page.getByLabel('Até', { exact: true }).inputValue()
    await page.getByLabel('De', { exact: true }).fill(`${Number(ate.slice(0, 4)) + 1}${ate.slice(4)}`)

    await expect(page.getByRole('alert').filter({ hasText: 'A data final não pode ser antes da inicial.' })).toBeVisible()
    expect(consultou).toBe(false)
  })

  test('período sem tarefas mostra o estado vazio', async ({ page }) => {
    await page.route(API, (rota) => rota.fulfill({ json: { ...FIXO, totais: contagem({}), porEquipe: [], porEquipamento: [] } }))
    await page.goto(RELATORIOS)

    await expect(page.getByText('Nenhuma tarefa prevista no período')).toBeVisible()
    await expect(page.getByLabel('Resumo do período')).toHaveCount(0)
  })

  test('mostra estado de erro quando a API falha', async ({ page }) => {
    await page.route(API, (rota) => rota.fulfill({ status: 500, json: { status: 500, message: 'Erro' } }))
    await page.goto(RELATORIOS)

    await expect(page.getByRole('button', { name: /tentar novamente/i })).toBeVisible()
  })
})

test('Funcionário não vê Relatórios no menu, na URL nem na API', async ({ page, isMobile }) => {
  await entrar(page, contas.funcionario)

  if (isMobile) await page.getByRole('button', { name: 'Alternar menu' }).click()
  await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Tarefas' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Relatórios' })).toHaveCount(0)
  if (isMobile) await page.keyboard.press('Escape')

  await page.goto(RELATORIOS)
  await expect(page.getByText('Acesso não permitido para o seu perfil.')).toBeVisible()
  expect((await page.request.get('/api/relatorio/tarefas?de=2026-11-01&ate=2026-11-30')).status()).toBe(403)
})
