import { expect, test, type Page } from '@playwright/test'
import { contas, entrar } from './support/auth'
import { apiComo } from './support/tarefas'

const CENTRAL = '/central'
const RESUMO = '**/api/central/resumo'

type Resumo = {
  tarefas: { ativas: number; emExecucao: number; emAnalise: number }
  equipes: { emOperacao: number; total: number }
  equipamentos: { total: number; operando: number; percentualOperando: number }
  alertas: { total: number; urgentes: number; equipamentosInoperantes: number; equipamentosEmAtencao: number; tarefasAtrasadas: number }
}

const indicador = (page: Page, titulo: string) => page.getByRole('region', { name: titulo, exact: true })

const FIXO: Resumo = {
  tarefas: { ativas: 5, emExecucao: 3, emAnalise: 2 },
  equipes: { emOperacao: 2, total: 4 },
  equipamentos: { total: 10, operando: 8, percentualOperando: 80 },
  alertas: { total: 6, urgentes: 2, equipamentosInoperantes: 2, equipamentosEmAtencao: 1, tarefasAtrasadas: 3 },
}

/**
 * Abre a Central e devolve o resumo que a própria tela recebeu (sem corrida com outros testes).
 * O Supervisor já cai na Central ao entrar: espera essa carga terminar e recarrega, para não
 * capturar a resposta da navegação anterior (o corpo dela some ao navegar).
 */
async function abrirCentral(page: Page) {
  await page.goto(CENTRAL)
  await expect(indicador(page, 'Alertas')).toBeVisible()
  const [resposta] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/central/resumo') && r.ok()), page.reload()])
  const resumo = (await resposta.json()) as Resumo
  await expect(indicador(page, 'Alertas')).toBeVisible()
  return resumo
}

test.describe('Central de Controle (Supervisor)', () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page, contas.supervisor)
  })

  test('estrutura HTML5: um h1, um main e os quatro indicadores da visão geral', async ({ page }) => {
    await abrirCentral(page)

    await expect(page.getByRole('heading', { level: 1, name: 'Central de Controle' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(page.getByRole('main')).toHaveCount(1)
    await expect(page.getByRole('heading', { level: 2, name: 'Visão geral' })).toBeVisible()
    for (const titulo of ['Tarefas ativas', 'Equipes em operação', 'Equipamentos monitorados', 'Alertas']) {
      await expect(indicador(page, titulo)).toBeVisible()
      await expect(indicador(page, titulo).getByRole('heading', { level: 3, name: titulo })).toBeVisible()
    }
  })

  test('mostra os números calculados pelo servidor', async ({ page }) => {
    const resumo = await abrirCentral(page)

    await expect(indicador(page, 'Tarefas ativas')).toContainText(String(resumo.tarefas.ativas))
    await expect(indicador(page, 'Tarefas ativas')).toContainText(`${resumo.tarefas.emExecucao} em execução`)
    await expect(indicador(page, 'Equipes em operação')).toContainText(`de ${resumo.equipes.total}`)
    await expect(indicador(page, 'Equipamentos monitorados')).toContainText(`${resumo.equipamentos.operando} operando normalmente`)
    await expect(page.getByRole('meter', { name: 'Equipamentos ativos' })).toHaveAttribute('aria-valuenow', String(resumo.equipamentos.percentualOperando))
    await expect(indicador(page, 'Alertas')).toContainText(String(resumo.alertas.total))
    // A seed tem equipamentos cadastrados, com percentual coerente com operando/total.
    expect(resumo.equipamentos.total).toBeGreaterThan(0)
    expect(resumo.equipamentos.percentualOperando).toBe(Math.round((resumo.equipamentos.operando * 100) / resumo.equipamentos.total))
  })

  test('apresenta total, operando, percentual e alertas urgentes', async ({ page }) => {
    await page.route(RESUMO, (rota) => rota.fulfill({ json: FIXO }))
    await page.goto(CENTRAL)

    const tarefas = indicador(page, 'Tarefas ativas')
    await expect(tarefas).toContainText('5')
    await expect(tarefas).toContainText('3 em execução')
    await expect(tarefas.getByRole('link', { name: '2 em análise' })).toBeVisible()

    await expect(indicador(page, 'Equipes em operação')).toContainText('de 4')

    const equipamentos = indicador(page, 'Equipamentos monitorados')
    await expect(equipamentos).toContainText('10')
    await expect(equipamentos).toContainText('8 operando normalmente')
    await expect(equipamentos).toContainText('80% ativos')
    await expect(equipamentos.getByRole('meter', { name: 'Equipamentos ativos' })).toHaveAttribute('aria-valuetext', '80%')

    const alertas = indicador(page, 'Alertas')
    await expect(alertas).toContainText('6')
    await expect(alertas).toContainText('2 urgentes')
    const origem = alertas.getByRole('list', { name: 'Origem dos alertas' })
    await expect(origem).toContainText('2 equipamentos inoperantes')
    await expect(origem).toContainText('1 equipamento em atenção')
    await expect(origem).toContainText('3 tarefas atrasadas')
  })

  test('sem urgência, o alerta mostra "Nenhum urgente"', async ({ page }) => {
    await page.route(RESUMO, (rota) => rota.fulfill({ json: { ...FIXO, alertas: { ...FIXO.alertas, total: 1, urgentes: 0, equipamentosInoperantes: 0, tarefasAtrasadas: 0 } } }))
    await page.goto(CENTRAL)

    await expect(indicador(page, 'Alertas')).toContainText('Nenhum urgente')
    await expect(indicador(page, 'Alertas')).not.toContainText('urgentes')
  })

  test('os indicadores levam às telas de detalhe', async ({ page }) => {
    await page.route(RESUMO, (rota) => rota.fulfill({ json: FIXO }))
    await page.goto(CENTRAL)

    await indicador(page, 'Tarefas ativas').getByRole('link', { name: 'Ver no Kanban' }).click()
    await expect(page).toHaveURL(/\/tarefas\?visao=kanban$/)

    await page.goBack()
    await indicador(page, 'Alertas').getByRole('link', { name: 'Ver tarefas atrasadas' }).click()
    await expect(page).toHaveURL(/\/tarefas\?situacao=ATRASADA$/)
    await expect(page.getByLabel('Situação', { exact: true })).toHaveText('Atrasada')

    await page.goBack()
    await indicador(page, 'Equipamentos monitorados').getByRole('link', { name: 'Ver equipamentos' }).click()
    await expect(page).toHaveURL(/\/cadastros\/equipamentos$/)
  })

  test('mostra estado de erro quando a API falha', async ({ page }) => {
    await page.route(RESUMO, (rota) => rota.fulfill({ status: 500, json: { status: 500, message: 'Erro' } }))
    await page.goto(CENTRAL)

    await expect(page.getByRole('heading', { level: 2, name: 'Visão geral' })).toBeVisible()
    await expect(page.getByRole('button', { name: /tentar novamente/i })).toBeVisible()
    await expect(indicador(page, 'Tarefas ativas')).toHaveCount(0)
  })
})

test('Funcionário não acessa o resumo da Central pela API', async ({ baseURL }) => {
  const joao = await apiComo(baseURL!, contas.funcionario)
  try {
    const resposta = await joao.get('/api/central/resumo')
    expect(resposta.status()).toBe(403)
  } finally {
    await joao.dispose()
  }
})
