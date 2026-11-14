import { expect, test, type Page } from '@playwright/test'
import { contas, entrar, sair } from './support/auth'
import { dialogoDescarte, escolher, salvarCadastro, sufixoUnico, voltarParaLista } from './support/cadastros'

const LISTA = '/cadastros/usuarios'
const criados: string[] = []

/** Tabela no desktop, cartão no celular; só seleciona a representação visível. */
const registroCom = (page: Page, texto: string) =>
  page.locator('tr[data-slot="table-row"]:visible, article[data-usuario]:visible').filter({ hasText: texto })

test.afterEach(async ({ page }) => {
  for (const id of criados.splice(0)) await page.request.delete(`/api/usuario/${id}`)
})

test('somente administradores acessam membros e permissões', async ({ page }) => {
  await entrar(page, contas.supervisor)
  await page.goto(LISTA)
  await expect(page.getByText('Acesso não permitido para o seu perfil.')).toBeVisible()
  expect((await page.request.get('/api/usuario')).status()).toBe(403)

  await sair(page, contas.supervisor)
  await entrar(page, contas.administrador)
  await page.goto(LISTA)
  await expect(page.getByRole('heading', { name: 'Membros e permissões' })).toBeVisible()
})

test('cria, edita sem trocar a senha, desativa e exclui um membro', async ({ page }) => {
  await entrar(page, contas.administrador)
  const nome = `E2E membro ${sufixoUnico()}`
  const email = `e2e-${sufixoUnico().toLowerCase()}@smartmall.local`
  await page.goto(`${LISTA}/novo`)
  await page.getByLabel('Nome', { exact: true }).fill(nome)
  await page.getByLabel('E-mail', { exact: true }).fill(email)
  await page.getByLabel('Senha', { exact: true }).fill('e2e12345')
  await escolher(page, 'Perfil', 'Supervisor')
  criados.push(await salvarCadastro(page, { rotulo: 'Membro', recurso: 'usuario', lista: LISTA, mensagem: 'Membro salvo.' }))

  await expect(page.getByLabel('Senha (deixe em branco para manter)')).toHaveValue('')
  await page.getByLabel('Nome', { exact: true }).fill(`${nome} editado`)
  await escolher(page, 'Perfil', 'Funcionário')
  await page.getByRole('checkbox', { name: 'Membro ativo' }).uncheck()
  await salvarCadastro(page, { rotulo: 'Membro', recurso: 'usuario', lista: LISTA, mensagem: 'Membro salvo.' })
  await expect(page).toHaveURL(new RegExp(`${LISTA}/${criados[0]}$`))

  const resposta = await page.request.get(`/api/usuario/${criados[0]}`)
  expect(resposta.ok()).toBe(true)
  const usuario = await resposta.json()
  expect(usuario).toMatchObject({ nome: `${nome} editado`, email, perfil: 'FUNCIONARIO', ativo: false })
  expect(usuario).not.toHaveProperty('senha')

  await voltarParaLista(page, LISTA)
  await expect(dialogoDescarte(page)).toHaveCount(0)
  const linha = registroCom(page, `${nome} editado`)
  await expect(linha).toBeVisible()
  await expect(linha).toContainText('Inativo')
  await expect(linha.getByRole('link', { name: `Editar ${nome} editado` })).toBeVisible()
  await expect(linha.getByRole('button', { name: `Excluir ${nome} editado` })).toBeVisible()
  if ((page.viewportSize()?.width ?? 0) < 640) {
    await expect(linha).toContainText('Nome')
    await expect(linha).toContainText('E-mail')
    await expect(linha).toContainText('Perfil')
    await expect(linha).toContainText('Status')
  }
  await linha.getByRole('button', { name: `Excluir ${nome} editado` }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Excluir' }).click()
  await expect(page.getByText('Membro excluído.')).toBeVisible()
})

test('mantém filtros na URL e distingue lista filtrada sem resultado', async ({ page }) => {
  await entrar(page, contas.administrador)
  await page.goto(LISTA)
  const busca = page.getByRole('search', { name: 'Filtros' })
  await busca.getByLabel('Nome').fill('Rafael')
  await busca.getByLabel('E-mail').fill('admin@smartmall.local')
  await escolher(page, 'Perfil', 'Administrador')
  await escolher(page, 'Situação', /^Ativos$/)
  await expect(page).toHaveURL(/nome=Rafael/)
  await expect(page).toHaveURL(/email=admin%40smartmall.local/)
  await expect(page).toHaveURL(/perfil=ADMINISTRADOR/)
  await expect(page).toHaveURL(/ativo=true/)
  await expect(registroCom(page, 'Rafael Mendes')).toBeVisible()

  await page.reload()
  await expect(busca.getByLabel('Nome')).toHaveValue('Rafael')
  await expect(registroCom(page, 'Rafael Mendes')).toBeVisible()
  const urlFiltrada = page.url()

  await registroCom(page, 'Rafael Mendes').click({ position: { x: 12, y: 12 } })
  await expect(page).toHaveURL(new RegExp(`${LISTA}/[0-9a-f-]{36}$`))
  await page.getByRole('button', { name: 'Cancelar' }).click()
  await expect(page).toHaveURL(urlFiltrada)

  await page.getByRole('link', { name: 'Novo membro' }).click()
  await page.getByRole('button', { name: 'Cancelar' }).click()
  await expect(page).toHaveURL(urlFiltrada)

  await busca.getByLabel('Nome').fill('NenhumMembroComEsteNome')
  await expect(page.getByText('Nenhum resultado para os filtros.')).toBeVisible()
  await busca.getByRole('button', { name: 'Limpar filtros' }).click()
  await expect(page).toHaveURL(new RegExp(`${LISTA}$`))
  // A lista sem filtro pode ter mais de uma página quando outros testes criam membros.
  await expect.poll(() => page.locator('tbody tr:visible, article[data-usuario]:visible').count()).toBeGreaterThan(0)
})

test('lista sem cadastros oferece criar um membro', async ({ page }) => {
  await entrar(page, contas.administrador)
  await page.route((url) => url.pathname === '/api/usuario', (rota) => rota.fulfill({
    json: { content: [], page: { size: 20, number: 0, totalElements: 0, totalPages: 0 } },
  }))
  await page.goto(LISTA)
  await expect(page.getByText('Nenhum membro cadastrado')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Novo membro' })).toHaveCount(1)
})

test('cancelar rascunho pede confirmação e descartar retorna à lista', async ({ page }) => {
  await entrar(page, contas.administrador)
  await page.goto(`${LISTA}/novo`)
  await page.getByRole('button', { name: 'Cancelar' }).click()
  await expect(page).toHaveURL(new RegExp(`${LISTA}$`))

  await page.goto(`${LISTA}/novo`)
  await page.getByLabel('Nome', { exact: true }).fill('Rascunho de membro')
  await page.getByRole('button', { name: 'Cancelar' }).click()
  await expect(dialogoDescarte(page)).toBeVisible()
  await expect(dialogoDescarte(page)).toContainText('As informações não salvas serão perdidas.')
  await dialogoDescarte(page).getByRole('button', { name: 'Cancelar' }).click()
  await expect(page).toHaveURL(new RegExp(`${LISTA}/novo$`))
  await expect(page.locator('form[aria-label="Membro"]')).toHaveAttribute('data-alterado', 'true')
  await page.getByRole('button', { name: 'Cancelar' }).click()
  await dialogoDescarte(page).getByRole('button', { name: 'Descartar' }).click()
  await expect(page).toHaveURL(new RegExp(`${LISTA}$`))
})

test('mostra membros além da primeira página', async ({ page }) => {
  await entrar(page, contas.administrador)
  const prefixo = `E2E pagina ${sufixoUnico()}`
  for (let indice = 0; indice < 21; indice++) {
    const resposta = await page.request.post('/api/usuario', {
      data: { nome: `${prefixo} ${String(indice).padStart(2, '0')}`, email: `e2e-pagina-${sufixoUnico().toLowerCase()}@smartmall.local`, senha: 'e2e12345', perfil: 'FUNCIONARIO', ativo: true },
    })
    expect(resposta.ok()).toBe(true)
    criados.push((await resposta.json()).id)
  }

  await page.goto(LISTA)
  await expect(page.getByLabel('Paginação de membros')).toContainText('Página 1 de')
  let encontrou = false
  for (let tentativa = 0; tentativa < 30; tentativa++) {
    if (await registroCom(page, `${prefixo} 20`).count()) {
      encontrou = true
      break
    }
    const proxima = page.getByRole('button', { name: 'Próxima' })
    if (await proxima.isDisabled()) break
    await proxima.click()
    await expect(page.getByLabel('Paginação de membros')).toContainText(`Página ${tentativa + 2} de`)
  }
  expect(encontrou).toBe(true)

  await page.getByRole('search', { name: 'Filtros' }).getByLabel('Nome').fill(`${prefixo} 00`)
  await expect(page).not.toHaveURL(/pagina=/)
  await expect(registroCom(page, `${prefixo} 00`)).toBeVisible()
})
