import { expect, test, type Page } from '@playwright/test'
import { contas, entrar } from './support/auth'
import { escolher, linhaCom, SEED } from './support/cadastros'
import { criarProgramadaViaApi, diaIso, excluirProgramadasMarcadas, linhaDaProgramada, marcaUnica } from './support/programadas'

/** Filtros, linha clicável e volta com filtros preservados, em todas as listagens. */

const linhasDoCorpo = (page: Page) => page.locator('tbody tr')

test.beforeEach(async ({ page }) => entrar(page, contas.supervisor))

test.describe('Equipamentos', () => {
  const LISTA = '/cadastros/equipamentos'

  test('filtra por código, nome, categoria, local e condição', async ({ page }) => {
    await page.goto(LISTA)
    const filtros = page.getByRole('search', { name: 'Filtros' })

    await filtros.getByLabel('Código').fill('elv')
    await expect(linhasDoCorpo(page)).toHaveCount(2)

    await escolher(page, 'Condição', 'Atenção')
    await expect(linhasDoCorpo(page)).toHaveCount(1)
    await expect(linhaCom(page, 'ELV-E2')).toBeVisible()
    await expect(page).toHaveURL(/codigo=elv/)
    await expect(page).toHaveURL(/condicao=ATENCAO/)

    await filtros.getByRole('button', { name: 'Limpar filtros' }).click()
    // Sem acento encontra "Câmeras". A contagem garante que o filtro já foi aplicado (a lista cheia também teria a linha).
    await filtros.getByLabel('Nome').fill('cameras')
    await expect(linhasDoCorpo(page)).toHaveCount(1)
    await expect(linhaCom(page, 'CFTV-L2')).toBeVisible()
    await filtros.getByLabel('Nome').fill('')

    await escolher(page, 'Categoria', 'Climatização')
    await expect(linhasDoCorpo(page)).toHaveCount(1)
    await filtros.getByRole('button', { name: 'Limpar filtros' }).click()

    await filtros.getByLabel('Local').fill('piso l2')
    await expect(linhaCom(page, 'HVAC-B')).toBeVisible()
    await expect(linhaCom(page, 'ELV-E1')).toHaveCount(0)
  })

  test('sem resultado oferece limpar os filtros', async ({ page }) => {
    await page.goto(`${LISTA}?codigo=nao-existe`)

    await expect(page.getByText('Nenhum resultado para os filtros.')).toBeVisible()
    await page.getByRole('main').getByRole('button', { name: 'Limpar filtros' }).last().click()
    await expect(linhaCom(page, 'ELV-E1')).toBeVisible()
  })

  test('clicar na linha abre a edição e o Cancelar volta com os filtros', async ({ page }) => {
    await page.goto(`${LISTA}?categoria=ELEVADOR`)

    await linhaCom(page, 'ELV-E2').getByRole('cell', { name: 'Elevador E2', exact: true }).click()

    await expect(page.getByRole('heading', { level: 1, name: 'Editar equipamento' })).toBeVisible()
    await expect(page.getByLabel('Código', { exact: true })).toHaveValue('ELV-E2')
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${LISTA}\\?categoria=ELEVADOR$`))
    await expect(linhasDoCorpo(page)).toHaveCount(2)
  })

  test('botões da linha mantêm a própria ação', async ({ page }) => {
    await page.goto(LISTA)

    await linhaCom(page, 'ELV-E1').getByRole('button', { name: 'Excluir Elevador E1' }).click()

    await expect(page.getByRole('alertdialog', { name: 'Excluir equipamento?' })).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`${LISTA}$`))
  })
})

test.describe('Equipes', () => {
  test('filtra por nome e abre a equipe pela linha', async ({ page }) => {
    await page.goto('/cadastros/equipes')

    await page.getByRole('search').getByLabel('Nome').fill('hidra')
    await expect(linhasDoCorpo(page)).toHaveCount(1)

    await linhaCom(page, 'Hidráulica').getByRole('cell', { name: 'Luana Freitas' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Editar equipe' })).toBeVisible()
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
    await expect(page).toHaveURL(/\/cadastros\/equipes\?nome=hidra$/)
  })
})

test.describe('Modelos de checklist', () => {
  test('filtra por nome e abre o checklist pela linha', async ({ page }) => {
    await page.goto('/planejamento/modelos-checklist')

    await page.getByRole('search').getByLabel('Nome').fill('elevador')
    await expect(linhasDoCorpo(page)).toHaveCount(1)

    await linhaCom(page, 'Elevador — inspeção preventiva').getByRole('cell').first().click()
    await expect(page.getByRole('heading', { level: 1, name: 'Editar modelo de checklist' })).toBeVisible()
  })
})

test.describe('Manutenções programadas', () => {
  const LISTA = '/planejamento/manutencoes-programadas'
  const marcas: string[] = []
  test.afterEach(async ({ page }) => excluirProgramadasMarcadas(page, marcas.splice(0)))

  test('filtra por equipamento, equipe e situação', async ({ page }) => {
    await page.goto(LISTA)

    await escolher(page, 'Equipamento', /ELV-E1/)
    await expect(linhaDaProgramada(page, SEED.programadaElevadorSemanal)).toBeVisible()
    await expect(linhasDoCorpo(page)).toHaveCount(1)
    await page.getByRole('search').getByRole('button', { name: 'Limpar filtros' }).click()

    await escolher(page, 'Equipe', 'Climatização')
    await expect(linhaDaProgramada(page, SEED.programadaElevadorSemanal)).toHaveCount(0)
    await page.getByRole('search').getByRole('button', { name: 'Limpar filtros' }).click()

    await escolher(page, 'Situação', 'Encerrada')
    await expect(linhaDaProgramada(page, SEED.programadaElevadorSemanal)).toHaveCount(0)
  })

  test('período mostra as manutenções programadas vigentes no intervalo', async ({ page }) => {
    const marca = marcaUnica()
    marcas.push(marca)
    const unica = await criarProgramadaViaApi(page, { marca, frequencia: 'UNICA', dataInicio: diaIso(60) })

    await page.goto(`${LISTA}?de=${diaIso(50)}&ate=${diaIso(55)}`)
    await expect(linhaDaProgramada(page, unica)).toHaveCount(0)
    await expect(linhaDaProgramada(page, SEED.programadaElevadorSemanal)).toBeVisible() // semanal sem término

    await expect(linhaDaProgramada(page, SEED.programadaElevadorSemanal)).toContainText('A partir de')

    await page.goto(`${LISTA}?de=${diaIso(59)}&ate=${diaIso(61)}`)
    await expect(linhaDaProgramada(page, unica)).toBeVisible()
    await expect(linhaDaProgramada(page, unica)).toContainText(diaIso(60).split('-').reverse().join('/'))
  })

  test('clicar na linha abre a manutenção programada e o Cancelar volta com os filtros', async ({ page }) => {
    await page.goto(`${LISTA}?situacao=ATIVA`)

    await linhaDaProgramada(page, SEED.programadaElevadorSemanal).getByRole('cell').nth(2).click()

    await expect(page).toHaveURL(new RegExp(`${LISTA}/${SEED.programadaElevadorSemanal}$`))
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${LISTA}\\?situacao=ATIVA$`))
  })
})
