import { expect, test, type Page } from '@playwright/test'
import { contas, entrar, preencherLogin, SENHA_DEMO } from './support/auth'
import { escolher } from './support/cadastros'
import { criarProgramadaViaApi, diaIso, excluirProgramadasMarcadas, horarioUnico, marcaUnica } from './support/programadas'

const TAREFAS = '/tarefas'
const calendario = (page: Page) => page.locator('table').filter({ has: page.getByRole('columnheader', { name: 'Dom' }) })
const diaSelecionado = (page: Page) => calendario(page).locator('button[aria-pressed="true"]')
const painelDoDia = (page: Page) => page.getByRole('list', { name: 'Tarefas do dia' })

type ItemTarefa = { dataHoraPrevista: string; atrasada: boolean; status: string; equipamento: { codigo: string } }

/** Manutenções do mês corrente pela API (mesma visão do usuário logado). */
async function tarefasDoMes(page: Page, situacao?: string) {
  const hoje = new Date()
  const de = diaIso(-hoje.getDate() + 1)
  const ate = diaIso(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate() - hoje.getDate())
  const resposta = await page.request.get(`/api/tarefa?de=${de}&ate=${ate}${situacao ? `&situacao=${situacao}` : ''}`)
  return (await resposta.json()) as ItemTarefa[]
}

/** Seleciona no calendário o dia de uma data ISO, navegando entre meses se preciso. */
async function selecionarDia(page: Page, iso: string) {
  const alvo = new Date(`${iso.slice(0, 10)}T00:00:00`)
  const hoje = new Date()
  const meses = (alvo.getFullYear() - hoje.getFullYear()) * 12 + alvo.getMonth() - hoje.getMonth()
  for (let i = 0; i < meses; i++) await page.getByRole('button', { name: 'Próximo mês' }).click()
  const rotulo = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(alvo)
  await calendario(page).getByRole('button', { name: new RegExp(`^${rotulo}`) }).click()
}

test.describe('Tarefas (Supervisor)', () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page, contas.supervisor)
    await page.goto(TAREFAS)
    await expect(page.getByRole('heading', { level: 1, name: 'Tarefas' })).toBeVisible()
  })

  test('indicador de atrasadas confere com a API', async ({ page }) => {
    const resumo = (await (await page.request.get('/api/tarefa/resumo')).json()) as { atrasadas: number }

    const indicadores = page.getByRole('definition')
    await expect(page.getByRole('term').filter({ hasText: 'Atrasadas' })).toBeVisible()
    await expect(indicadores.first()).toHaveText(String(resumo.atrasadas))
  })

  test('dia com manutenção atrasada da seed aparece no calendário e no painel', async ({ page }) => {
    const atrasada = (await tarefasDoMes(page, 'ATRASADA')).find((m) => m.equipamento.codigo === 'ELV-E1')
    test.skip(!atrasada, 'Sem atrasada da seed no mês corrente.')

    await selecionarDia(page, atrasada!.dataHoraPrevista)

    await expect(diaSelecionado(page)).toHaveAttribute('aria-label', /atrasada/)
    await expect(painelDoDia(page)).toContainText('ELV-E1 · Elevador E1')
    await expect(painelDoDia(page)).toContainText('Atrasada')
  })

  test('filtro de situação mostra só as atrasadas', async ({ page }) => {
    const agendada = (await tarefasDoMes(page, 'AGENDADA'))[0]
    test.skip(!agendada, 'Sem tarefa agendada no mês corrente.')

    await escolher(page, 'Situação', 'Atrasada')
    await selecionarDia(page, agendada.dataHoraPrevista)

    const doDia = (await tarefasDoMes(page, 'ATRASADA')).filter((m) => m.dataHoraPrevista.slice(0, 10) === agendada.dataHoraPrevista.slice(0, 10))
    await expect(painelDoDia(page).getByRole('listitem')).toHaveCount(doDia.length)
  })

  test('setas do teclado movem o dia selecionado', async ({ page }) => {
    const titulo = page.locator('#dia-titulo')
    const antes = await titulo.textContent()

    await diaSelecionado(page).focus()
    await page.keyboard.press('ArrowRight')

    await expect(titulo).not.toHaveText(antes!)
    await expect(diaSelecionado(page)).toBeFocused()
    const depois = await titulo.textContent()
    await page.keyboard.press('ArrowLeft')
    await expect(titulo).toHaveText(antes!)
    expect(depois).not.toBe(antes)
  })

  test('navega entre meses e volta para hoje', async ({ page }) => {
    const mes = page.getByRole('heading', { level: 2 }).filter({ hasText: /de \d{4}$/ })
    const atual = await mes.textContent()

    await page.getByRole('button', { name: 'Próximo mês' }).click()
    await expect(mes).not.toHaveText(atual!)
    await page.getByRole('button', { name: 'Hoje' }).click()
    await expect(mes).toHaveText(atual!)
    await expect(calendario(page).locator('button[aria-current="date"]')).toHaveAttribute('aria-pressed', 'true')
  })

  test('cancela e restaura uma manutenção pelo painel do dia', async ({ page }) => {
    const marca = marcaUnica()
    const horario = horarioUnico()
    await criarProgramadaViaApi(page, { marca, frequencia: 'UNICA', dataInicio: diaIso(1), horario })
    try {
      await page.reload()
      await selecionarDia(page, diaIso(1))
      const item = painelDoDia(page).getByRole('listitem').filter({ hasText: `${horario}–` })
      await expect(item).toContainText('BOM-B01')

      await item.getByRole('button', { name: /^Cancelar tarefa de/ }).click()
      await page.getByRole('alertdialog').getByRole('button', { name: 'Cancelar tarefa' }).click()
      await expect(item).toContainText('Cancelada')

      await item.getByRole('button', { name: /^Restaurar tarefa de/ }).click()
      await expect(item).toContainText('Agendada')
    } finally {
      await excluirProgramadasMarcadas(page, [marca])
    }
  })
})

test.describe('Fluxo Tarefas ↔ Manutenção programada', () => {
  test.beforeEach(async ({ page }) => entrar(page, contas.supervisor))

  test('Programar manutenção é a ação primária e o Cancelar volta para Tarefas', async ({ page }) => {
    await page.goto(`${TAREFAS}?dia=${diaIso(3)}`)
    const novo = page.getByRole('link', { name: 'Programar manutenção' })
    await expect(novo).toHaveAttribute('data-variant', 'default')

    await novo.click()
    await expect(page).toHaveURL(/\/planejamento\/manutencoes-programadas\/nova$/)
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click()

    await expect(page).toHaveURL(new RegExp(`${TAREFAS}\\?dia=${diaIso(3)}$`))
  })

  test('Limpar filtros remove equipe e situação de uma vez e mantém o dia', async ({ page }) => {
    await page.goto(`${TAREFAS}?dia=${diaIso(3)}`)
    await escolher(page, 'Equipe', 'Hidráulica')
    await escolher(page, 'Situação', 'Atrasada')
    await expect(page).toHaveURL(/equipe=.*situacao=ATRASADA|situacao=ATRASADA.*equipe=/)

    await page.getByRole('search').getByRole('button', { name: 'Limpar filtros' }).click()

    await expect(page).toHaveURL(new RegExp(`${TAREFAS}\\?dia=${diaIso(3)}$`))
    await expect(page.getByLabel('Equipe', { exact: true })).toHaveText('Todas')
    await expect(page.getByLabel('Situação', { exact: true })).toHaveText('Todas')
  })

  test('?dia abre Tarefas no dia indicado', async ({ page }) => {
    const dia = diaIso(40)
    await page.goto(`${TAREFAS}?dia=${dia}`)

    const rotulo = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${dia}T00:00:00`))
    await expect(diaSelecionado(page)).toHaveAttribute('aria-label', new RegExp(`^${rotulo}`))
  })

  test('a origem da tarefa abre a manutenção programada, e o Cancelar volta para o mesmo dia', async ({ page }) => {
    const marca = marcaUnica()
    const horario = horarioUnico()
    const id = await criarProgramadaViaApi(page, { marca, frequencia: 'UNICA', dataInicio: diaIso(2), horario })
    try {
      await page.goto(`${TAREFAS}?dia=${diaIso(2)}`)
      const item = painelDoDia(page).getByRole('listitem').filter({ hasText: `${horario}–` })

      await item.getByRole('link', { name: /^Abrir a manutenção programada de BOM-B01/ }).click()
      await expect(page).toHaveURL(new RegExp(`/planejamento/manutencoes-programadas/${id}$`))
      await expect(page.getByRole('heading', { level: 1, name: 'Editar manutenção programada' })).toBeVisible()

      await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
      await expect(page).toHaveURL(new RegExp(`${TAREFAS}\\?dia=${diaIso(2)}$`))
    } finally {
      await excluirProgramadasMarcadas(page, [marca])
    }
  })

  test('"Ver em Tarefas" abre Tarefas no dia da próxima tarefa', async ({ page }) => {
    const marca = marcaUnica()
    const id = await criarProgramadaViaApi(page, { marca, frequencia: 'UNICA', dataInicio: diaIso(5) })
    try {
      await page.goto(`/planejamento/manutencoes-programadas/${id}`)

      await page.getByRole('link', { name: 'Ver em Tarefas' }).click()

      await expect(page).toHaveURL(new RegExp(`${TAREFAS}\\?dia=${diaIso(5)}$`))
      await expect(painelDoDia(page)).toContainText('BOM-B01')
    } finally {
      await excluirProgramadasMarcadas(page, [marca])
    }
  })
})

test.describe('Tarefas (Funcionário)', () => {
  test('vê as manutenções das suas equipes, sem filtro de equipe nem ações', async ({ page }) => {
    await entrar(page, contas.funcionario) // João Costa: Elevadores e escadas, Climatização
    await expect(page).toHaveURL(new RegExp(`${TAREFAS}$`))

    await expect(page.getByLabel('Equipe', { exact: true })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Programar manutenção' })).toHaveCount(0)

    const doMes = await tarefasDoMes(page)
    expect(doMes.some((m) => m.equipamento.codigo === 'ELV-E1')).toBe(true)
    await selecionarDia(page, doMes.find((m) => m.equipamento.codigo === 'ELV-E1')!.dataHoraPrevista)
    await expect(painelDoDia(page)).toContainText('ELV-E1')
    await expect(painelDoDia(page).getByRole('button', { name: /^Cancelar tarefa/ })).toHaveCount(0)
    // Funcionário não acessa Manutenções programadas: a origem não vira link.
    await expect(painelDoDia(page).getByRole('link', { name: /^Abrir a manutenção programada/ })).toHaveCount(0)
  })

  test('funcionária de outra equipe não vê as manutenções do elevador', async ({ page }) => {
    await page.goto('/login')
    await preencherLogin(page, 'luana.freitas@smartmall.local', SENHA_DEMO) // Hidráulica
    await expect(page).toHaveURL(new RegExp(`${TAREFAS}$`))

    const doMes = await tarefasDoMes(page)
    expect(doMes.some((m) => m.equipamento.codigo === 'ELV-E1')).toBe(false)
    expect((await page.request.post('/api/tarefa/qualquer/cancelar')).status()).toBe(403)
  })
})
