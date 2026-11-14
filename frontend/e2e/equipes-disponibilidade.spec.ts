import { expect, test, type Page } from '@playwright/test'
import { contas, entrar } from './support/auth'
import { escolher, linhaCom } from './support/cadastros'
import { diaIso } from './support/programadas'

const LISTA = '/cadastros/equipes'
const FUNCIONARIOS = `${LISTA}?visao=funcionarios`
const DISPONIBILIDADE = '**/api/disponibilidade'

const botaoVisao = (page: Page, nome: 'Equipes' | 'Funcionários') => page.getByRole('group', { name: 'Visualização' }).getByRole('button', { name: nome })
/** Valor (dd) do indicador cujo rótulo (dt) é exatamente o informado. */
const valorIndicador = (page: Page, rotulo: string) =>
  page.getByLabel('Disponibilidade hoje').getByRole('term').filter({ hasText: new RegExp(`^${rotulo}$`) }).locator('xpath=following-sibling::dd[1]')
/** Funcionário na tabela (desktop) ou no cartão (celular). */
const pessoa = (page: Page, nome: string) => page.getByRole('row').or(page.getByRole('list', { name: 'Funcionários' }).getByRole('listitem')).filter({ hasText: nome })
const brasileira = (iso: string) => iso.split('-').reverse().join('/')

const ELEVADORES = { id: '3e9a0000-0001-4d00-8000-000000000003', nome: 'Elevadores e escadas' }
const SEGURANCA = { id: '3e9a0000-0001-4d00-8000-000000000004', nome: 'Segurança' }

/** Três funcionários, um em cada situação, para conferir a tela sem depender do estado do banco. */
const FIXO = [
  { id: 'f1', nome: 'Ana Teste', equipes: [ELEVADORES], situacao: 'DISPONIVEL', tarefaAtual: null, tarefasEmExecucao: 0, ausencia: null },
  {
    id: 'f2',
    nome: 'Bruno Teste',
    equipes: [ELEVADORES],
    situacao: 'OCUPADO',
    tarefaAtual: { id: 't-1', equipamento: 'ELV-E1 · Elevador E1', equipe: 'Elevadores e escadas', dataHoraPrevista: '2026-11-14T08:00:00' },
    tarefasEmExecucao: 2,
    ausencia: null,
  },
  {
    id: 'f3',
    nome: 'Carla Teste',
    equipes: [SEGURANCA],
    situacao: 'INDISPONIVEL',
    tarefaAtual: null,
    tarefasEmExecucao: 0,
    ausencia: { id: 'a1', motivo: 'FERIAS', inicio: '2026-11-10', fim: '2026-11-28' },
  },
]

test.describe('Equipes: disponibilidade dos funcionários (Supervisor)', () => {
  test.beforeEach(async ({ page }) => entrar(page, contas.supervisor))

  test('alterna entre Equipes e Funcionários mantendo o cabeçalho', async ({ page }) => {
    await page.goto(LISTA)
    await expect(linhaCom(page, 'Climatização')).toBeVisible()

    await botaoVisao(page, 'Funcionários').click()

    await expect(page).toHaveURL(/visao=funcionarios/)
    await expect(botaoVisao(page, 'Funcionários')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('heading', { level: 1, name: 'Equipes' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(page.getByRole('main')).toHaveCount(1)
    await expect(page.getByRole('heading', { level: 2, name: 'Disponibilidade hoje' })).toBeVisible()
    for (const nome of ['Caio Nunes', 'Elisa Rocha', 'João Costa', 'Luana Freitas', 'Pedro Lima']) {
      await expect(pessoa(page, nome)).toBeVisible()
    }

    await botaoVisao(page, 'Equipes').click()
    await expect(page).toHaveURL(new RegExp(`${LISTA}$`))
    await expect(linhaCom(page, 'Climatização')).toBeVisible()
  })

  test('mostra presentes, situação, atividade atual e ausência de cada funcionário', async ({ page }) => {
    await page.route(DISPONIBILIDADE, (rota) => rota.fulfill({ json: FIXO }))
    await page.goto(FUNCIONARIOS)

    await expect(valorIndicador(page, 'Presentes')).toHaveText('2')
    await expect(valorIndicador(page, 'Disponíveis')).toHaveText('1')
    await expect(valorIndicador(page, 'Ocupados')).toHaveText('1')
    await expect(valorIndicador(page, 'Indisponíveis')).toHaveText('1')

    await expect(pessoa(page, 'Ana Teste')).toContainText('Disponível')
    await expect(pessoa(page, 'Ana Teste')).toContainText('Sem tarefa em execução')

    const bruno = pessoa(page, 'Bruno Teste')
    await expect(bruno).toContainText('Ocupado')
    await expect(bruno).toContainText('e mais 1')
    await expect(bruno.getByRole('link', { name: 'ELV-E1 · Elevador E1' })).toHaveAttribute('href', '/tarefas/t-1')

    const carla = pessoa(page, 'Carla Teste')
    await expect(carla).toContainText('Indisponível')
    await expect(carla).toContainText('Férias até 28/11/2026')
    await expect(carla.getByRole('button', { name: 'Encerrar ausência de Carla Teste' })).toBeVisible()
    await expect(bruno.getByRole('button', { name: /^Encerrar ausência/ })).toHaveCount(0)
  })

  test('filtra por situação e por equipe', async ({ page }) => {
    await page.route(DISPONIBILIDADE, (rota) => rota.fulfill({ json: FIXO }))
    await page.goto(FUNCIONARIOS)
    await expect(pessoa(page, 'Ana Teste')).toBeVisible()

    await escolher(page, 'Situação', 'Ocupado')
    await expect(page).toHaveURL(/situacao=OCUPADO/)
    await expect(pessoa(page, 'Bruno Teste')).toBeVisible()
    await expect(pessoa(page, 'Ana Teste')).toHaveCount(0)

    await page.getByRole('button', { name: 'Limpar filtros' }).click()
    await escolher(page, 'Equipe', 'Segurança')
    await expect(pessoa(page, 'Carla Teste')).toBeVisible()
    await expect(pessoa(page, 'Bruno Teste')).toHaveCount(0)
    // Os indicadores são do dia inteiro, não do filtro.
    await expect(valorIndicador(page, 'Presentes')).toHaveText('2')
  })

  test('a lista de equipes mostra a situação de hoje e leva às tarefas da equipe', async ({ page }) => {
    await page.route(DISPONIBILIDADE, (rota) => rota.fulfill({ json: FIXO }))
    await page.goto(LISTA)

    const elevadores = page.getByRole('list', { name: 'Situação hoje: Elevadores e escadas' })
    await expect(elevadores).toContainText('1 disponível')
    await expect(elevadores).toContainText('1 ocupado')
    await expect(page.getByRole('list', { name: 'Situação hoje: Segurança' })).toContainText('1 indisponível')

    await page.getByRole('link', { name: 'Ver tarefas de Elevadores e escadas' }).click()
    await expect(page).toHaveURL(new RegExp(`/tarefas\\?equipe=${ELEVADORES.id}&visao=kanban$`))
  })

  test('registra e encerra uma ausência futura', async ({ page }, testInfo) => {
    // Um funcionário por projeto e uma data sorteada: execuções em paralelo não disputam o mesmo período.
    const nome = testInfo.project.name === 'mobile' ? 'Luana Freitas' : 'Caio Nunes'
    const dia = diaIso(200 + Math.floor(Math.random() * 150))
    await page.goto(FUNCIONARIOS)
    const linha = pessoa(page, nome)
    try {
      await linha.getByRole('button', { name: `Registrar ausência de ${nome}` }).click()
      const painel = page.getByRole('dialog', { name: 'Registrar ausência' })
      await expect(painel).toContainText(nome)
      await painel.getByLabel('Início').fill(dia)
      await painel.getByLabel('Fim').fill(dia)
      await escolher(page, 'Motivo', 'Folga')
      const registrou = page.waitForResponse((r) => r.url().endsWith('/api/ausencia') && r.request().method() === 'POST')
      await painel.getByRole('button', { name: 'Registrar' }).click()
      expect((await registrou).status()).toBe(201)

      await expect(painel).toBeHidden()
      await expect(linha).toContainText(`Folga em ${brasileira(dia)}`)
      // Ausência futura não muda a situação de hoje.
      await expect(linha).not.toContainText('Indisponível')

      await linha.getByRole('button', { name: `Encerrar ausência de ${nome}` }).click()
      const encerrou = page.waitForResponse((r) => /\/api\/ausencia\/[^/]+\/encerrar$/.test(r.url()) && r.ok())
      await page.getByRole('alertdialog').getByRole('button', { name: 'Encerrar ausência' }).click()
      await encerrou
      await expect(linha).not.toContainText(`Folga em ${brasileira(dia)}`)
    } finally {
      const lista = (await (await page.request.get('/api/disponibilidade')).json()) as typeof FIXO
      const ausencia = lista.find((f) => f.nome === nome)?.ausencia
      if (ausencia?.inicio === dia) await page.request.post(`/api/ausencia/${ausencia.id}/encerrar`)
    }
  })

  test('valida o período antes de enviar', async ({ page }) => {
    await page.goto(FUNCIONARIOS)
    let enviou = false
    await page.route('**/api/ausencia', (rota) => {
      enviou = true
      return rota.continue()
    })

    await pessoa(page, 'Pedro Lima').getByRole('button', { name: 'Registrar ausência de Pedro Lima' }).click()
    const painel = page.getByRole('dialog', { name: 'Registrar ausência' })
    await painel.getByLabel('Início').fill(diaIso(10))
    await painel.getByLabel('Fim').fill(diaIso(5))
    await painel.getByRole('button', { name: 'Registrar' }).click()

    await expect(painel).toContainText('A data final deve ser igual ou posterior à inicial.')
    await expect(painel).toContainText('Informe o motivo.')
    expect(enviou).toBe(false)

    await painel.getByRole('button', { name: 'Cancelar' }).click()
    await expect(painel).toBeHidden()
  })

  test('mostra estado de erro quando a API falha', async ({ page }) => {
    await page.route(DISPONIBILIDADE, (rota) => rota.fulfill({ status: 500, json: { status: 500, message: 'Erro' } }))
    await page.goto(FUNCIONARIOS)

    await expect(page.getByRole('button', { name: /tentar novamente/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Disponibilidade hoje' })).toHaveCount(0)
  })
})

test('Funcionário não acessa disponibilidade nem ausências pela API', async ({ page }) => {
  await entrar(page, contas.funcionario)

  expect((await page.request.get('/api/disponibilidade')).status()).toBe(403)
  const resposta = await page.request.post('/api/ausencia', { data: { usuarioId: 'x', inicio: diaIso(1), fim: diaIso(1), motivo: 'FOLGA' } })
  expect(resposta.status()).toBe(403)
})
