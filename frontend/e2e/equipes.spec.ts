import { expect, test } from '@playwright/test'
import { contas, entrar } from './support/auth'
import { dialogoDescarte, excluirViaApi, linhaCom, salvarCadastro, sufixoUnico, voltarParaLista } from './support/cadastros'

const LISTA = '/cadastros/equipes'
const salvar = (page: Parameters<typeof salvarCadastro>[0]) =>
  salvarCadastro(page, { rotulo: 'Equipe', recurso: 'equipe', lista: LISTA, mensagem: 'Equipe salva.' })

const criadas: string[] = []

test.afterEach(async ({ page }) => {
  if (!criadas.length) return
  const nomes = criadas.splice(0)
  await excluirViaApi<{ id: string; nome: string }>(page, 'equipe', (e) => nomes.includes(e.nome))
})

test.describe('Permissões', () => {
  test('Funcionário não acessa a tela, a API de equipes nem a de funcionários', async ({ page }) => {
    await entrar(page, contas.funcionario)

    await page.goto(LISTA)
    await expect(page.getByText('Acesso não permitido para o seu perfil.')).toBeVisible()
    expect((await page.request.get('/api/equipe')).status()).toBe(403)
    expect((await page.request.get('/api/usuario/funcionarios')).status()).toBe(403)
  })
})

test.describe('Cadastro de equipes', () => {
  test.beforeEach(async ({ page }) => entrar(page, contas.supervisor))

  test('lista as equipes da seed com os membros', async ({ page }) => {
    await page.goto(LISTA)

    await expect(linhaCom(page, 'Climatização')).toContainText('João Costa')
    await expect(linhaCom(page, 'Climatização')).toContainText('Pedro Lima')
  })

  test('cria com membros, permanece em edição e altera os membros', async ({ page }) => {
    const nome = `E2E equipe ${sufixoUnico()}`
    criadas.push(nome)
    await page.goto(`${LISTA}/nova`)

    await page.getByLabel('Nome', { exact: true }).fill(nome)
    await page.getByRole('checkbox', { name: /Luana Freitas/ }).check()
    await page.getByRole('checkbox', { name: /Caio Nunes/ }).check()
    await salvar(page)

    await expect(page.getByRole('checkbox', { name: /Luana Freitas/ })).toBeChecked()
    await page.getByRole('checkbox', { name: /Caio Nunes/ }).uncheck()
    await salvar(page)

    await voltarParaLista(page, LISTA)
    await expect(linhaCom(page, nome)).toContainText('Luana Freitas')
    await expect(linhaCom(page, nome)).not.toContainText('Caio Nunes')
  })

  test('só funcionários aparecem como candidatos a membro', async ({ page }) => {
    await page.goto(`${LISTA}/nova`)

    await expect(page.getByRole('checkbox', { name: /João Costa/ })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: /Ana Souza/ })).toHaveCount(0)
    await expect(page.getByRole('checkbox', { name: /Rafael Mendes/ })).toHaveCount(0)
  })

  test('marcar e desmarcar o mesmo membro não conta como alteração', async ({ page }) => {
    await page.goto(LISTA)
    await linhaCom(page, 'Segurança').getByRole('link', { name: 'Editar Segurança' }).click()

    await page.getByRole('checkbox', { name: /Pedro Lima/ }).check()
    await page.getByRole('checkbox', { name: /Pedro Lima/ }).uncheck()
    await page.getByRole('button', { name: 'Cancelar' }).click()

    await expect(dialogoDescarte(page)).toHaveCount(0)
    await expect(page).toHaveURL(new RegExp(`${LISTA}$`))
  })

  test('nome duplicado mostra o erro do servidor', async ({ page }) => {
    await page.goto(`${LISTA}/nova`)

    await page.getByLabel('Nome', { exact: true }).fill('Hidráulica')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByRole('alert').filter({ hasText: 'Já existe uma equipe com o nome Hidráulica.' })).toBeVisible()
  })

  test('equipe com manutenção programada não pode ser excluída', async ({ page }) => {
    await page.goto(LISTA)

    await linhaCom(page, 'Climatização').getByRole('button', { name: 'Excluir Climatização' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Excluir' }).click()

    await expect(page.getByText('Equipe com manutenção programada não pode ser excluída.')).toBeVisible()
  })

  test('exclui equipe sem manutenção programada', async ({ page }) => {
    const nome = `E2E equipe ${sufixoUnico()}`
    criadas.push(nome)
    await page.goto(`${LISTA}/nova`)
    await page.getByLabel('Nome', { exact: true }).fill(nome)
    await salvar(page)
    await voltarParaLista(page, LISTA)

    await linhaCom(page, nome).getByRole('button', { name: `Excluir ${nome}` }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Excluir' }).click()

    await expect(page.getByText('Equipe excluída.')).toBeVisible()
    await expect(linhaCom(page, nome)).toHaveCount(0)
  })
})
