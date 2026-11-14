import { expect, test } from '@playwright/test'
import { contas, entrar } from './support/auth'
import { dialogoDescarte, escolher, excluirViaApi, linhaCom, salvarCadastro, sufixoUnico, voltarParaLista } from './support/cadastros'

const LISTA = '/cadastros/equipamentos'
const salvar = (page: Parameters<typeof salvarCadastro>[0]) =>
  salvarCadastro(page, { rotulo: 'Equipamento', recurso: 'equipamento', lista: LISTA, mensagem: 'Equipamento salvo.' })

const criados: string[] = []

test.afterEach(async ({ page }) => {
  if (!criados.length) return
  const codigos = criados.splice(0)
  await excluirViaApi<{ id: string; codigo: string }>(page, 'equipamento', (e) => codigos.includes(e.codigo))
})

async function preencher(page: Parameters<typeof salvarCadastro>[0], codigo: string, nome: string) {
  await page.getByLabel('Código', { exact: true }).fill(codigo)
  await page.getByLabel('Nome', { exact: true }).fill(nome)
  await escolher(page, 'Categoria', 'Hidráulica')
  await escolher(page, 'Piso', 'Piso L1')
  await page.getByLabel('Localização', { exact: true }).fill('Casa de bombas')
}

test.describe('Permissões', () => {
  test('Funcionário não acessa a tela nem a API', async ({ page }) => {
    await entrar(page, contas.funcionario)

    await page.goto(LISTA)
    await expect(page.getByText('Acesso não permitido para o seu perfil.')).toBeVisible()
    expect((await page.request.get('/api/equipamento')).status()).toBe(403)
  })
})

test.describe('Cadastro de equipamentos', () => {
  test.beforeEach(async ({ page }) => entrar(page, contas.supervisor))

  test('lista os equipamentos da seed com condição', async ({ page }) => {
    await page.goto(LISTA)

    await expect(linhaCom(page, 'ELV-E2')).toContainText('Atenção')
    await expect(linhaCom(page, 'POR-ENT')).toContainText('Inoperante')
  })

  test('cria com código em maiúsculas e permanece na tela em edição', async ({ page }) => {
    const codigo = `e2e-${sufixoUnico()}`
    criados.push(codigo.toUpperCase())
    await page.goto(`${LISTA}/novo`)

    await preencher(page, codigo, 'Bomba de teste')
    await salvar(page)

    await expect(page.getByRole('heading', { level: 1, name: 'Editar equipamento' })).toBeVisible()
    await expect(page.getByLabel('Código', { exact: true })).toHaveValue(codigo.toUpperCase())
    await voltarParaLista(page, LISTA)
    await expect(linhaCom(page, codigo.toUpperCase())).toContainText('Bomba de teste')
  })

  test('código duplicado mostra o erro do servidor', async ({ page }) => {
    await page.goto(`${LISTA}/novo`)

    await preencher(page, 'ELV-E1', 'Duplicado')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByRole('alert').filter({ hasText: 'Já existe um equipamento com o código ELV-E1.' })).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`${LISTA}/novo$`))
  })

  test('campos obrigatórios usam validação HTML5 e do formulário', async ({ page }) => {
    await page.goto(`${LISTA}/novo`)
    const codigo = page.getByLabel('Código', { exact: true })
    await expect(codigo).toHaveAttribute('required', '')
    await expect(codigo).toHaveAttribute('maxlength', '20')

    await page.locator('form[aria-label="Equipamento"]').evaluate((f: HTMLFormElement) => (f.noValidate = true))
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('Informe o código.')).toBeVisible()
    await expect(page.getByText('Selecione a categoria.')).toBeVisible()
    await expect(page.getByText('Selecione o piso.')).toBeVisible()
  })

  test('edita e exclui com confirmação', async ({ page }) => {
    const codigo = `E2E-${sufixoUnico()}`
    criados.push(codigo)
    await page.goto(`${LISTA}/novo`)
    await preencher(page, codigo, 'Para editar')
    await salvar(page)

    await escolher(page, 'Condição', 'Inoperante')
    await salvar(page)
    await voltarParaLista(page, LISTA)
    await expect(linhaCom(page, codigo)).toContainText('Inoperante')

    await linhaCom(page, codigo).getByRole('button', { name: 'Excluir Para editar' }).click()
    await page.getByRole('alertdialog', { name: 'Excluir equipamento?' }).getByRole('button', { name: 'Excluir' }).click()
    await expect(page.getByText('Equipamento excluído.')).toBeVisible()
    await expect(linhaCom(page, codigo)).toHaveCount(0)
  })

  test('equipamento com manutenção programada não pode ser excluído', async ({ page }) => {
    await page.goto(LISTA)

    await linhaCom(page, 'ELV-E1').getByRole('button', { name: 'Excluir Elevador E1' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Excluir' }).click()

    await expect(page.getByText('Equipamento com manutenção programada não pode ser excluído.')).toBeVisible()
    await expect(linhaCom(page, 'ELV-E1')).toHaveCount(1)
  })

  test('cancelar com alterações pede confirmação', async ({ page }) => {
    await page.goto(`${LISTA}/novo`)
    await page.getByLabel('Nome', { exact: true }).fill('Rascunho')

    await page.getByRole('button', { name: 'Cancelar' }).click()

    await expect(dialogoDescarte(page)).toBeVisible()
  })
})
