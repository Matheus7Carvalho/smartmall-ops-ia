import { expect, test, type Page } from '@playwright/test'
import { contas, entrar } from './support/auth'
import { dialogoDescarte, escolher, salvarCadastro, voltarParaLista } from './support/cadastros'
import { criarProgramadaViaApi, diaIso, excluirProgramadasMarcadas, horarioUnico, linhaDaProgramada, LISTA_PROGRAMADAS, marcaUnica } from './support/programadas'

const salvar = (page: Page) =>
  salvarCadastro(page, { rotulo: 'Manutenção programada', recurso: 'manutencao-programada', lista: LISTA_PROGRAMADAS, mensagem: 'Manutenção programada salva.' })

const marcas: string[] = []
function novaMarca() {
  const marca = marcaUnica()
  marcas.push(marca)
  return marca
}

test.afterEach(async ({ page }) => excluirProgramadasMarcadas(page, marcas.splice(0)))

const proximas = (page: Page) => page.getByRole('list', { name: 'Próximas tarefas' })

test.describe('Permissões', () => {
  test('Funcionário não acessa a tela nem a API', async ({ page }) => {
    await entrar(page, contas.funcionario)

    await page.goto(LISTA_PROGRAMADAS)
    await expect(page.getByText('Acesso não permitido para o seu perfil.')).toBeVisible()
    expect((await page.request.get('/api/manutencao-programada')).status()).toBe(403)
  })
})

test.describe('Cadastro de manutenção programada', () => {
  test.beforeEach(async ({ page }) => entrar(page, contas.supervisor))

  test('programa manutenção semanal, permanece em edição e mostra as próximas tarefas', async ({ page }) => {
    const marca = novaMarca()
    const amanha = diaIso(1)
    await page.goto(`${LISTA_PROGRAMADAS}/nova`)

    await escolher(page, 'Equipamento', /BOM-B01/)
    await escolher(page, 'Modelo de checklist', 'Elevador — inspeção preventiva')
    await escolher(page, 'Equipe responsável', 'Hidráulica')
    await escolher(page, 'Frequência', 'Semanal')
    await page.getByLabel('A cada').fill('2')
    await page.getByLabel('Início').fill(amanha)
    await page.getByLabel('Horário').fill('09:30')
    await page.getByLabel('Duração (min)').fill('45')
    await page.getByLabel('Observações (opcional)').fill(marca)

    await expect(page.getByTestId('descricao-recorrencia')).toContainText('A cada 2 semanas')
    await expect(page.getByTestId('descricao-recorrencia')).toContainText('às 09:30')
    await salvar(page)

    await expect(page.getByRole('heading', { level: 1, name: 'Editar manutenção programada' })).toBeVisible()
    const primeira = proximas(page).getByRole('listitem').first()
    await expect(primeira).toContainText('09:30–10:15')
    await expect(primeira).toContainText('Agendada')
  })

  test('frequência única esconde intervalo e término', async ({ page }) => {
    await page.goto(`${LISTA_PROGRAMADAS}/nova`)

    await escolher(page, 'Frequência', 'Única')

    await expect(page.getByLabel('A cada')).toHaveCount(0)
    await expect(page.getByLabel('Término (opcional)')).toHaveCount(0)
    await expect(page.getByLabel('Data', { exact: true })).toBeVisible()
  })

  test('início no passado é barrado pelo navegador e pelo servidor', async ({ page }) => {
    await page.goto(`${LISTA_PROGRAMADAS}/nova`)
    const inicio = page.getByLabel('Início')
    await expect(inicio).toHaveAttribute('min', diaIso(0))

    await escolher(page, 'Equipamento', /BOM-B01/)
    await escolher(page, 'Modelo de checklist', 'Elevador — inspeção preventiva')
    await escolher(page, 'Equipe responsável', 'Hidráulica')
    await inicio.fill(diaIso(-1))
    await page.getByRole('button', { name: 'Salvar' }).click()
    expect(await inicio.evaluate((el: HTMLInputElement) => el.validity.rangeUnderflow)).toBe(true)

    await page.locator('form[aria-label="Manutenção programada"]').evaluate((f: HTMLFormElement) => (f.noValidate = true))
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByRole('alert').filter({ hasText: 'O início (data e horário) precisa ser no futuro.' })).toBeVisible()
  })

  test('término antes do início é recusado', async ({ page }) => {
    await page.goto(`${LISTA_PROGRAMADAS}/nova`)
    await page.locator('form[aria-label="Manutenção programada"]').evaluate((f: HTMLFormElement) => (f.noValidate = true))

    await page.getByLabel('Início').fill(diaIso(10))
    await page.getByLabel('Término (opcional)').fill(diaIso(5))
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('O término não pode ser antes do início.')).toBeVisible()
  })

  test('mudar o horário refaz as próximas datas', async ({ page }) => {
    const id = await criarProgramadaViaApi(page, { marca: novaMarca(), frequencia: 'DIARIA', horario: '10:00' })
    await page.goto(`${LISTA_PROGRAMADAS}/${id}`)
    await expect(proximas(page).getByRole('listitem').first()).toContainText('10:00')

    await page.getByLabel('Horário').fill('11:45')
    await salvar(page)

    await expect(proximas(page).getByRole('listitem').first()).toContainText('11:45')
    await expect(proximas(page)).not.toContainText('10:00–')
  })

  test('cancela e restaura uma data específica', async ({ page }) => {
    const id = await criarProgramadaViaApi(page, { marca: novaMarca(), frequencia: 'DIARIA' })
    await page.goto(`${LISTA_PROGRAMADAS}/${id}`)
    const primeira = proximas(page).getByRole('listitem').first()

    await primeira.getByRole('button', { name: /^Cancelar tarefa de/ }).click()
    await page.getByRole('alertdialog', { name: 'Cancelar esta tarefa?' }).getByRole('button', { name: 'Cancelar tarefa' }).click()
    await expect(primeira).toContainText('Cancelada')

    await primeira.getByRole('button', { name: /^Restaurar tarefa de/ }).click()
    await expect(primeira).toContainText('Agendada')
  })

  test('cancelar com alterações pede confirmação', async ({ page }) => {
    const id = await criarProgramadaViaApi(page, { marca: novaMarca() })
    await page.goto(`${LISTA_PROGRAMADAS}/${id}`)

    await page.getByLabel('Duração (min)').fill('60')
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click()

    await expect(dialogoDescarte(page)).toBeVisible()
  })
})

test.describe('Listagem: encerrar e excluir', () => {
  test.beforeEach(async ({ page }) => entrar(page, contas.supervisor))

  test('encerrar deixa a manutenção programada somente leitura', async ({ page }) => {
    const id = await criarProgramadaViaApi(page, { marca: novaMarca(), horario: horarioUnico() })
    await page.goto(LISTA_PROGRAMADAS)
    const linha = linhaDaProgramada(page, id)
    await expect(linha).toContainText('Ativa')

    await linha.getByRole('button', { name: /^Encerrar manutenção programada de/ }).click()
    const dialogo = page.getByRole('alertdialog', { name: 'Encerrar manutenção programada?' })
    await expect(dialogo).toContainText('As tarefas futuras serão canceladas.')
    await dialogo.getByRole('button', { name: 'Encerrar' }).click()

    await expect(page.getByText('Manutenção programada encerrada.')).toBeVisible()
    await expect(linha).toContainText('Encerrada')
    await expect(linha.getByRole('button', { name: /^Encerrar manutenção programada de/ })).toHaveCount(0)

    await linha.getByRole('link', { name: /^Ver manutenção programada de/ }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Manutenção programada' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Salvar' })).toHaveCount(0)
    await expect(page.getByLabel('Horário')).toBeDisabled()
    await expect(proximas(page).getByRole('listitem').first()).toContainText('Cancelada')
    await voltarParaLista(page, LISTA_PROGRAMADAS)
  })

  test('exclui manutenção programada sem execução', async ({ page }) => {
    const id = await criarProgramadaViaApi(page, { marca: novaMarca() })
    await page.goto(LISTA_PROGRAMADAS)

    await linhaDaProgramada(page, id).getByRole('button', { name: /^Excluir manutenção programada de/ }).click()
    await page.getByRole('alertdialog', { name: 'Excluir manutenção programada?' }).getByRole('button', { name: 'Excluir' }).click()

    await expect(page.getByText('Manutenção programada excluída.')).toBeVisible()
    await expect(linhaDaProgramada(page, id)).toHaveCount(0)
  })
})
