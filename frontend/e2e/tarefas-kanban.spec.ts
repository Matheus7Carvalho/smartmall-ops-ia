import { expect, test, type Page } from '@playwright/test'
import { contas, entrar } from './support/auth'
import { escolher } from './support/cadastros'
import { criarProgramadaViaApi, diaIso, excluirProgramadasMarcadas, horarioUnico, marcaUnica } from './support/programadas'
import { apiComo, criarTarefaDoJoao, descartarProgramada, enviarParaAnaliseViaApi } from './support/tarefas'

const COLUNAS = ['Atrasada', 'Agendada', 'Em execução', 'Em análise', 'Concluída', 'Cancelada']

const TAREFAS = '/tarefas'
const KANBAN = `${TAREFAS}?visao=kanban`
const calendario = (page: Page) => page.locator('table').filter({ has: page.getByRole('columnheader', { name: 'Dom' }) })
const coluna = (page: Page, rotulo: string) => page.getByRole('list', { name: `Tarefas: ${rotulo}` })
const tituloColuna = (page: Page, rotulo: string) => page.getByRole('heading', { level: 3, name: new RegExp(`^${rotulo}`) })
const botaoVisao = (page: Page, nome: 'Calendário' | 'Kanban') => page.getByRole('group', { name: 'Visualização' }).getByRole('button', { name: nome })

type ItemTarefa = { dataHoraPrevista: string; atrasada: boolean; status: string; equipamento: { codigo: string } | null }

/** Tarefas do mês corrente pela API (mesma visão do usuário logado). */
async function tarefasDoMes(page: Page, situacao?: string) {
  const hoje = new Date()
  const de = diaIso(-hoje.getDate() + 1)
  const ate = diaIso(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate() - hoje.getDate())
  const resposta = await page.request.get(`/api/tarefa?de=${de}&ate=${ate}${situacao ? `&situacao=${situacao}` : ''}`)
  return (await resposta.json()) as ItemTarefa[]
}

/** Avança o Kanban até o mês de uma data ISO futura. */
async function irParaMes(page: Page, iso: string) {
  const alvo = new Date(`${iso.slice(0, 10)}T00:00:00`)
  const hoje = new Date()
  const meses = (alvo.getFullYear() - hoje.getFullYear()) * 12 + alvo.getMonth() - hoje.getMonth()
  for (let i = 0; i < meses; i++) await page.getByRole('button', { name: 'Próximo mês' }).click()
}

test.describe('Tarefas: Kanban (Supervisor)', () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page, contas.supervisor)
  })

  test('o botão Kanban troca só a área abaixo dos filtros e o Calendário volta', async ({ page }) => {
    await page.goto(TAREFAS)
    await expect(calendario(page)).toBeVisible()

    await botaoVisao(page, 'Kanban').click()

    await expect(page).toHaveURL(/visao=kanban/)
    await expect(botaoVisao(page, 'Kanban')).toHaveAttribute('aria-pressed', 'true')
    await expect(calendario(page)).toHaveCount(0)
    for (const rotulo of COLUNAS) await expect(tituloColuna(page, rotulo)).toBeAttached()
    // Parte de cima intacta: título, ação primária, indicadores e filtros.
    await expect(page.getByRole('heading', { level: 1, name: 'Tarefas' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Programar manutenção' })).toBeVisible()
    await expect(page.getByRole('term').filter({ hasText: 'Atrasadas' })).toBeVisible()
    await expect(page.getByLabel('Situação', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2 }).filter({ hasText: /de \d{4}$/ })).toBeVisible()

    await botaoVisao(page, 'Calendário').click()
    await expect(page).toHaveURL(new RegExp(`${TAREFAS}$`))
    await expect(calendario(page)).toBeVisible()
  })

  test('estrutura HTML5: um h1, um main e uma coluna por situação do fluxo', async ({ page }) => {
    await page.goto(KANBAN)
    await expect(tituloColuna(page, 'Atrasada')).toBeVisible()

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(page.getByRole('main')).toHaveCount(1)
    await expect(page.getByRole('heading', { level: 3 })).toHaveCount(COLUNAS.length)
    await expect(page.getByRole('region', { name: 'Quadro Kanban' })).toBeVisible()
    // O quadro rola dentro de si; a página não ganha rolagem horizontal (no celular, o diálogo sairia da tela).
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0)
  })

  test('cada coluna mostra as tarefas do mês daquela situação', async ({ page }) => {
    const doMes = await tarefasDoMes(page)
    const atrasadas = doMes.filter((t) => t.status === 'AGENDADA' && t.atrasada)
    const agendadas = doMes.filter((t) => t.status === 'AGENDADA' && !t.atrasada)

    // Mantém a resposta que a tela recebe estável durante testes paralelos que criam tarefas.
    await page.route((url) => url.pathname === '/api/tarefa', (rota) => rota.fulfill({ json: doMes }))
    await page.goto(KANBAN)

    await expect(tituloColuna(page, 'Atrasada')).toContainText(String(atrasadas.length))
    await expect(tituloColuna(page, 'Agendada')).toContainText(String(agendadas.length))
    if (atrasadas.length > 0) await expect(coluna(page, 'Atrasada').getByRole('listitem')).toHaveCount(atrasadas.length)
    const elevador = atrasadas.find((t) => t.equipamento?.codigo === 'ELV-E1')
    if (elevador) await expect(coluna(page, 'Atrasada')).toContainText('ELV-E1 · Elevador E1')
  })

  test('filtro de situação mostra só a coluna escolhida e é mantido ao trocar de visão', async ({ page }) => {
    await page.goto(KANBAN)
    await escolher(page, 'Situação', 'Atrasada')

    await expect(page).toHaveURL(/situacao=ATRASADA/)
    await expect(tituloColuna(page, 'Atrasada')).toBeVisible()
    await expect(tituloColuna(page, 'Agendada')).toHaveCount(0)
    await expect(tituloColuna(page, 'Cancelada')).toHaveCount(0)
    await expect(page.getByRole('heading', { level: 3 })).toHaveCount(1)

    await botaoVisao(page, 'Calendário').click()
    await expect(page.getByLabel('Situação', { exact: true })).toHaveText('Atrasada')
  })

  test('cancelar e restaurar no cartão move a tarefa entre as colunas', async ({ page }) => {
    const marca = marcaUnica()
    const horario = horarioUnico()
    await criarProgramadaViaApi(page, { marca, frequencia: 'UNICA', dataInicio: diaIso(1), horario })
    try {
      await page.goto(KANBAN)
      await irParaMes(page, diaIso(1))
      const cartao = (rotulo: string) => coluna(page, rotulo).getByRole('listitem').filter({ hasText: `${horario}–` }).filter({ hasText: 'BOM-B01' })
      await expect(cartao('Agendada')).toHaveCount(1)

      await cartao('Agendada').getByRole('button', { name: /^Cancelar tarefa de/ }).click()
      const cancelou = page.waitForResponse((r) => /\/api\/tarefa\/[^/]+\/cancelar$/.test(r.url()) && r.ok())
      await page.getByRole('alertdialog').getByRole('button', { name: 'Cancelar tarefa' }).click()
      await cancelou
      await expect(cartao('Cancelada')).toHaveCount(1)
      await expect(cartao('Agendada')).toHaveCount(0)

      const restaurou = page.waitForResponse((r) => /\/api\/tarefa\/[^/]+\/restaurar$/.test(r.url()) && r.ok())
      await cartao('Cancelada').getByRole('button', { name: /^Restaurar tarefa de/ }).click()
      await restaurou
      await expect(cartao('Agendada')).toHaveCount(1)
      await expect(cartao('Cancelada')).toHaveCount(0)
    } finally {
      await excluirProgramadasMarcadas(page, [marca])
    }
  })

  test('tarefa enviada para análise fica em "Em análise" com o responsável, e o cartão abre a tarefa', async ({ page, baseURL }) => {
    const admin = await apiComo(baseURL!, contas.administrador)
    const joao = await apiComo(baseURL!, contas.funcionario)
    const criada = await criarTarefaDoJoao(admin)
    try {
      await enviarParaAnaliseViaApi(joao, criada.tarefaId)

      await page.goto(`${TAREFAS}?visao=kanban&dia=${criada.dia}`)
      // Pelo id: outros testes também criam tarefas da Bomba B01 nesse período.
      const daTarefa = page.locator(`a[href="/tarefas/${criada.tarefaId}"]`)
      const cartao = coluna(page, 'Em análise').getByRole('listitem').filter({ has: daTarefa })
      await expect(cartao).toHaveCount(1)
      await expect(cartao).toContainText('Responsável: João Costa')
      await expect(coluna(page, 'Agendada').getByRole('listitem').filter({ has: daTarefa })).toHaveCount(0)

      await cartao.getByRole('link', { name: new RegExp(`^Abrir tarefa de ${criada.titulo}`) }).click()
      await expect(page).toHaveURL(new RegExp(`/tarefas/${criada.tarefaId}$`))
    } finally {
      await descartarProgramada(admin, criada)
      await Promise.all([admin.dispose(), joao.dispose()])
    }
  })

  test('mostra estado de erro quando a API falha', async ({ page }) => {
    await page.route('**/api/tarefa?*', (rota) => rota.fulfill({ status: 500, json: { message: 'Erro' } }))
    await page.goto(KANBAN)

    await expect(page.getByRole('button', { name: /tentar novamente/i })).toBeVisible()
    await expect(tituloColuna(page, 'Atrasada')).toHaveCount(0)
  })
})

test.describe('Tarefas: Kanban (Funcionário)', () => {
  test('vê o Kanban das suas equipes, sem ações nem link para a origem', async ({ page }) => {
    await entrar(page, contas.funcionario) // João Costa: Elevadores e escadas, Climatização
    await page.goto(KANBAN)
    await expect(tituloColuna(page, 'Agendada')).toBeVisible()

    const doMes = await tarefasDoMes(page)
    test.skip(!doMes.some((t) => t.equipamento?.codigo === 'ELV-E1'), 'Sem tarefa do elevador no mês corrente.')
    await expect(page.getByRole('main')).toContainText('ELV-E1')
    await expect(page.getByRole('button', { name: /^Cancelar tarefa/ })).toHaveCount(0)
    await expect(page.getByRole('link', { name: /^Abrir a manutenção programada/ })).toHaveCount(0)
  })
})
