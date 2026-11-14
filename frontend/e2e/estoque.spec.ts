import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { contas, entrar } from './support/auth'
import { dialogoDescarte, escolher, salvarCadastro, voltarParaLista } from './support/cadastros'
import { marcaUnica } from './support/programadas'
import { apiComo } from './support/tarefas'

const LISTA = '/estoque'
const salvar = (page: Page) => salvarCadastro(page, { rotulo: 'Item de estoque', recurso: 'estoque/item', lista: LISTA, mensagem: 'Item salvo.' })

/** Item na tabela (desktop) ou no cartão (celular). */
const itemNaLista = (page: Page, codigo: string) =>
  page.getByRole('row').or(page.getByRole('list', { name: 'Itens de estoque' }).getByRole('listitem')).filter({ hasText: codigo })
/** Movimentação na tabela (desktop) ou no cartão (celular) de uma lista com o nome dado. */
const movimentacoes = (page: Page, rotulo: string) =>
  page.getByRole('table', { name: rotulo }).getByRole('row').or(page.getByRole('list', { name: rotulo }).getByRole('listitem'))

type Item = { id: string; codigo: string }
const criados: string[] = []

/** Itens do teste usam a marca (E2E-…) como código. Com movimentações, só a limpeza de teste (perfil dev) apaga. */
async function descartar(api: APIRequestContext) {
  for (const codigo of criados.splice(0)) {
    await api.delete(`/api/teste/e2e?marca=${codigo}`)
    const { content } = (await (await api.get('/api/estoque/item?size=500')).json()) as { content: Item[] }
    const item = content.find((i) => i.codigo === codigo)
    if (item) await api.delete(`/api/estoque/item/${item.id}`)
  }
}

test.afterEach(async ({ baseURL }) => {
  if (!criados.length) return
  const admin = await apiComo(baseURL!, contas.administrador)
  await descartar(admin)
  await admin.dispose()
})

async function preencher(page: Page, codigo: string, nome: string, minimo = '5') {
  await page.getByLabel('Código', { exact: true }).fill(codigo)
  await page.getByLabel('Nome', { exact: true }).fill(nome)
  await escolher(page, 'Categoria', 'Peça')
  await page.getByLabel('Estoque mínimo', { exact: true }).fill(minimo)
  await page.getByLabel('Localização', { exact: true }).fill('Prateleira de teste')
}

/** Abre o painel de entrada/retirada, preenche e confirma; espera a resposta da API. */
async function movimentar(page: Page, tipo: 'Entrada' | 'Retirada', quantidade: number, equipamento?: string) {
  await page.getByRole('button', { name: tipo, exact: true }).click()
  const painel = page.getByRole('dialog', { name: tipo === 'Entrada' ? 'Registrar entrada' : 'Registrar retirada' })
  await painel.getByLabel(/^Quantidade/).fill(String(quantidade))
  if (equipamento) await escolher(page, 'Equipamento atendido', new RegExp(equipamento))
  const resposta = page.waitForResponse((r) => /\/api\/estoque\/item\/[^/]+\/(entrada|retirada)$/.test(r.url()))
  await painel.getByRole('button', { name: tipo === 'Entrada' ? 'Registrar entrada' : 'Retirar' }).click()
  expect((await resposta).status()).toBe(201)
  await expect(painel).toBeHidden()
}

test.describe('Estoque (Supervisor)', () => {
  test.beforeEach(async ({ page }) => entrar(page, contas.supervisor))

  test('lista os itens da seed com saldo e situação', async ({ page }) => {
    await page.goto(LISTA)

    await expect(page.getByRole('heading', { level: 1, name: 'Estoque' })).toBeVisible()
    await expect(page.getByRole('main')).toHaveCount(1)
    await expect(itemNaLista(page, 'LMP-LED-18')).toContainText('Baixo')
    await expect(itemNaLista(page, 'CRR-ECR-02')).toContainText('Zerado')
    await expect(itemNaLista(page, 'CRR-ECR-02').getByRole('button', { name: 'Registrar retirada de CRR-ECR-02' })).toBeDisabled()
    await expect(itemNaLista(page, 'FLT-AC-01')).toContainText('Normal')

    await escolher(page, 'Saldo', 'Zerado')
    await expect(page).toHaveURL(/saldo=ZERADO/)
    await expect(itemNaLista(page, 'CRR-ECR-02')).toBeVisible()
    await expect(itemNaLista(page, 'FLT-AC-01')).toHaveCount(0)
  })

  test('cria item com saldo zero, vira edição e não duplica ao salvar de novo', async ({ page }) => {
    const codigo = marcaUnica()
    criados.push(codigo)
    await page.goto(`${LISTA}/novo`)

    await preencher(page, codigo.toLowerCase(), 'Filtro de teste')
    const id = await salvar(page)

    await expect(page.getByRole('heading', { level: 1, name: 'Editar item' })).toBeVisible()
    await expect(page.getByLabel('Código', { exact: true })).toHaveValue(codigo)
    await expect(page.getByRole('region', { name: /Movimentações/ })).toContainText('0 un')
    await expect(page.getByText('Nenhuma movimentação registrada')).toBeVisible()

    await page.getByLabel('Nome', { exact: true }).fill('Filtro de teste editado')
    expect(await salvar(page)).toBe(id)

    await voltarParaLista(page, LISTA)
    await expect(itemNaLista(page, codigo)).toHaveCount(1)
    await expect(itemNaLista(page, codigo)).toContainText('Filtro de teste editado')
  })

  test('código duplicado e campos obrigatórios mostram o erro', async ({ page }) => {
    await page.goto(`${LISTA}/novo`)
    const codigo = page.getByLabel('Código', { exact: true })
    await expect(codigo).toHaveAttribute('required', '')
    await expect(codigo).toHaveAttribute('maxlength', '20')

    await page.locator('form[aria-label="Item de estoque"]').evaluate((f: HTMLFormElement) => (f.noValidate = true))
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText('Informe o código.')).toBeVisible()
    await expect(page.getByText('Selecione a categoria.')).toBeVisible()

    await preencher(page, 'FLT-AC-01', 'Duplicado')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByRole('alert').filter({ hasText: 'Já existe um item com o código FLT-AC-01.' })).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`${LISTA}/novo$`))
  })

  test('cancelar: sem alterações sai; com alterações pede confirmação; depois de salvar sai direto', async ({ page }) => {
    await page.goto(`${LISTA}/novo`)
    await voltarParaLista(page, LISTA)

    await page.goto(`${LISTA}/novo`)
    await page.getByLabel('Nome', { exact: true }).fill('Rascunho')
    await page.getByRole('button', { name: 'Cancelar' }).click()
    await expect(dialogoDescarte(page)).toBeVisible()
    await dialogoDescarte(page).getByRole('button', { name: 'Cancelar' }).click()
    // O diálogo precisa terminar de fechar: um clique durante a animação cai na sobreposição, não no botão.
    await expect(dialogoDescarte(page)).toBeHidden()
    await expect(page.getByLabel('Nome', { exact: true })).toHaveValue('Rascunho')
    await page.getByRole('button', { name: 'Cancelar' }).click()
    await dialogoDescarte(page).getByRole('button', { name: 'Descartar' }).click()
    await expect(page).toHaveURL(new RegExp(`${LISTA}$`))

    const codigo = marcaUnica()
    criados.push(codigo)
    await page.goto(`${LISTA}/novo`)
    await preencher(page, codigo, 'Salvo e cancelado')
    await salvar(page)
    await voltarParaLista(page, LISTA)
  })

  test('entrada e retirada atualizam o saldo e ficam na rastreabilidade do item', async ({ page }) => {
    const codigo = marcaUnica()
    criados.push(codigo)
    await page.goto(`${LISTA}/novo`)
    await preencher(page, codigo, 'Correia de teste', '5')
    await salvar(page)
    const secao = page.getByRole('region', { name: /Movimentações/ })

    await movimentar(page, 'Entrada', 10)
    await expect(secao).toContainText('10 un')

    await movimentar(page, 'Retirada', 3, 'HVAC-B')
    await expect(secao).toContainText('7 un')
    const linhas = movimentacoes(page, 'Movimentações do item')
    await expect(linhas.filter({ hasText: 'Retirada' })).toContainText('HVAC-B')
    await expect(linhas.filter({ hasText: 'Retirada' })).toContainText('Ana Souza')
    await expect(linhas.filter({ hasText: 'Entrada' })).toContainText('+10')

    // Acima do saldo: o formulário bloqueia antes de enviar…
    await page.getByRole('button', { name: 'Retirada', exact: true }).click()
    const painel = page.getByRole('dialog', { name: 'Registrar retirada' })
    await painel.getByLabel(/^Quantidade/).fill('8')
    await painel.locator('form').evaluate((f: HTMLFormElement) => (f.noValidate = true))
    await painel.getByRole('button', { name: 'Retirar' }).click()
    await expect(painel).toContainText('Saldo insuficiente: há 7 disponível.')
    await painel.getByRole('button', { name: 'Cancelar' }).click()

    // …e o servidor recusa mesmo sem a tela.
    const id = page.url().split('/').pop()
    const resposta = await page.request.post(`/api/estoque/item/${id}/retirada`, { data: { quantidade: 8 } })
    expect(resposta.status()).toBe(400)
    expect((await resposta.json()).message).toBe('Saldo insuficiente: há 7 disponível.')
  })

  test('histórico geral filtra por item e por tipo', async ({ page }) => {
    const codigo = marcaUnica()
    criados.push(codigo)
    await page.goto(`${LISTA}/novo`)
    await preencher(page, codigo, 'Item do histórico')
    await salvar(page)
    await movimentar(page, 'Entrada', 4)
    await movimentar(page, 'Retirada', 1)

    await page.goto(`${LISTA}?visao=movimentacoes`)
    await expect(page.getByRole('group', { name: 'Visualização' }).getByRole('button', { name: 'Movimentações' })).toHaveAttribute('aria-pressed', 'true')
    await escolher(page, 'Item', new RegExp(codigo))
    const linhas = movimentacoes(page, 'Movimentações').filter({ hasText: codigo })
    await expect(linhas).toHaveCount(2)

    await escolher(page, 'Tipo', 'Retirada')
    await expect(linhas).toHaveCount(1)
    await expect(linhas).toContainText('Retirada')
  })

  test('exclui item sem movimentação e recusa item com movimentação', async ({ page }) => {
    const livre = marcaUnica()
    const usado = marcaUnica()
    criados.push(livre, usado)
    for (const [codigo, comMovimento] of [
      [livre, false],
      [usado, true],
    ] as const) {
      await page.goto(`${LISTA}/novo`)
      await preencher(page, codigo, `Item ${codigo}`)
      await salvar(page)
      if (comMovimento) await movimentar(page, 'Entrada', 1)
    }

    await page.goto(LISTA)
    await itemNaLista(page, usado).getByRole('button', { name: `Excluir ${usado}` }).click()
    await page.getByRole('alertdialog', { name: 'Excluir item?' }).getByRole('button', { name: 'Excluir' }).click()
    await expect(page.getByText('Item com movimentações não pode ser excluído.')).toBeVisible()
    await expect(itemNaLista(page, usado)).toHaveCount(1)

    await itemNaLista(page, livre).getByRole('button', { name: `Excluir ${livre}` }).click()
    await page.getByRole('alertdialog', { name: 'Excluir item?' }).getByRole('button', { name: 'Excluir' }).click()
    await expect(itemNaLista(page, livre)).toHaveCount(0)
  })

  test('mostra estado de erro quando a API falha', async ({ page }) => {
    await page.route('**/api/estoque/item?*', (rota) => rota.fulfill({ status: 500, json: { status: 500, message: 'Erro' } }))
    await page.goto(LISTA)

    await expect(page.getByRole('button', { name: /tentar novamente/i })).toBeVisible()
  })
})

test.describe('Estoque (Funcionário)', () => {
  test('consulta e retira, sem cadastrar, dar entrada ou excluir', async ({ page, baseURL, isMobile }) => {
    const admin = await apiComo(baseURL!, contas.administrador)
    const codigo = marcaUnica()
    criados.push(codigo)
    const item = (await (
      await admin.post('/api/estoque/item', { data: { codigo, nome: 'Item para retirada', categoria: 'CONSUMIVEL', unidade: 'UN', estoqueMinimo: 1 } })
    ).json()) as Item
    expect((await admin.post(`/api/estoque/item/${item.id}/entrada`, { data: { quantidade: 5 } })).status()).toBe(201)
    await admin.dispose()

    await entrar(page, contas.funcionario)
    if (isMobile) await page.getByRole('button', { name: 'Alternar menu' }).click()
    await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Estoque' }).click()

    await expect(page.getByRole('link', { name: 'Novo item' })).toHaveCount(0)
    const linha = itemNaLista(page, codigo)
    await expect(linha.getByRole('button', { name: /^Registrar entrada/ })).toHaveCount(0)
    await expect(linha.getByRole('button', { name: /^Excluir/ })).toHaveCount(0)

    await linha.getByRole('link', { name: 'Item para retirada' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Item de estoque' })).toBeVisible()
    await expect(page.getByLabel('Nome', { exact: true })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Salvar' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Entrada', exact: true })).toHaveCount(0)

    await movimentar(page, 'Retirada', 2)
    await expect(page.getByRole('region', { name: /Movimentações/ })).toContainText('3 un')
    await expect(movimentacoes(page, 'Movimentações do item').filter({ hasText: 'Retirada' })).toContainText('João Costa')

    expect((await page.request.post('/api/estoque/item', { data: { codigo: 'X', nome: 'X', categoria: 'PECA', unidade: 'UN', estoqueMinimo: 0 } })).status()).toBe(403)
    expect((await page.request.post(`/api/estoque/item/${item.id}/entrada`, { data: { quantidade: 1 } })).status()).toBe(403)
  })
})
