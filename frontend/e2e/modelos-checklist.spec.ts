import { expect, test, type Page } from '@playwright/test'
import { contas, entrar } from './support/auth'
import {
  dialogoDescarte,
  escolherTipo,
  excluirPorNome,
  item,
  linha,
  LISTA_MODELOS,
  nomeUnico,
  preencherChecklist,
  salvar,
  salvarEVoltar,
} from './support/checklists'

const criados: string[] = []

async function novo(page: Page) {
  await page.goto(`${LISTA_MODELOS}/novo`)
  await expect(page.getByRole('heading', { level: 1, name: 'Novo modelo de checklist' })).toBeVisible()
}

test.afterEach(async ({ page }) => {
  if (criados.length) await excluirPorNome(page, ...criados.splice(0))
})

test.describe('Permissões', () => {
  test('Supervisor e Administrador veem Modelos de checklist no menu', async ({ page, isMobile }) => {
    for (const conta of [contas.supervisor, contas.administrador]) {
      await entrar(page, conta)
      if (isMobile) await page.getByRole('button', { name: 'Alternar menu' }).click()

      await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Modelos de checklist' }).click()

      await expect(page).toHaveURL(new RegExp(`${LISTA_MODELOS}$`))
      await expect(page.getByRole('heading', { level: 1, name: 'Modelos de checklist' })).toBeVisible()
      await page.context().clearCookies()
    }
  })

  test('Funcionário não vê o menu nem acessa a tela ou a API', async ({ page, isMobile }) => {
    await entrar(page, contas.funcionario)
    if (isMobile) await page.getByRole('button', { name: 'Alternar menu' }).click()
    await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Modelos de checklist' })).toHaveCount(0)

    await page.goto(`${LISTA_MODELOS}/novo`)
    await expect(page.getByText('Acesso não permitido para o seu perfil.')).toBeVisible()
    expect((await page.request.get('/api/checklist')).status()).toBe(403)
  })
})

test.describe('Listagem', () => {
  test.beforeEach(async ({ page }) => entrar(page, contas.supervisor))

  test('mostra os checklists da seed com a quantidade de itens', async ({ page }) => {
    await page.goto(LISTA_MODELOS)

    await expect(linha(page, 'Elevador — inspeção preventiva')).toContainText('5')
    await expect(linha(page, 'Ar-condicionado — revisão mensal')).toContainText('4')
  })

  test('estado vazio oferece criar o primeiro checklist', async ({ page }) => {
    await page.route('**/api/checklist?*', (route) =>
      route.fulfill({ json: { content: [], page: { size: 200, number: 0, totalElements: 0, totalPages: 0 } } }),
    )
    await page.goto(LISTA_MODELOS)

    await expect(page.getByText('Nenhum modelo de checklist cadastrado')).toBeVisible()
    await page.getByRole('link', { name: 'Novo modelo' }).click()
    await expect(page).toHaveURL(new RegExp(`${LISTA_MODELOS}/novo$`))
  })

  test('erro ao carregar permite tentar novamente', async ({ page }) => {
    await page.route('**/api/checklist?*', (route) => route.fulfill({ status: 500, json: { status: 500, message: 'Erro' } }))
    await page.goto(LISTA_MODELOS)

    await expect(page.getByText('Não foi possível carregar.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible()
  })
})

test.describe('Cadastro', () => {
  test.beforeEach(async ({ page }) => entrar(page, contas.supervisor))

  test('cria checklist com Sim/Não, Texto e Número e preserva tudo ao reabrir', async ({ page }) => {
    const nome = nomeUnico()
    criados.push(nome)
    await novo(page)

    await preencherChecklist(page, nome, [
      { pergunta: 'Portas funcionando?', tipo: 'Sim/Não' },
      { pergunta: 'Observações', tipo: 'Texto', max: 120, obrigatorio: false },
      { pergunta: 'Desnível (mm)', tipo: 'Número' },
    ])
    await salvarEVoltar(page)

    await expect(linha(page, nome)).toContainText('3')
    await linha(page, nome).getByRole('link', { name: `Editar ${nome}` }).click()

    await expect(page.getByLabel('Nome', { exact: true })).toHaveValue(nome)
    await expect(item(page, 1).getByLabel('Pergunta')).toHaveValue('Portas funcionando?')
    await expect(item(page, 1).getByLabel('Tipo de resposta')).toHaveText('Sim/Não')
    await expect(item(page, 1).getByLabel('Obrigatório')).toBeChecked()
    await expect(item(page, 2).getByLabel('Tipo de resposta')).toHaveText('Texto')
    await expect(item(page, 2).getByLabel('Máx. caracteres')).toHaveValue('120')
    await expect(item(page, 2).getByLabel('Obrigatório')).not.toBeChecked()
    await expect(item(page, 3).getByLabel('Tipo de resposta')).toHaveText('Número')
    await expect(item(page, 3).getByLabel('Máx. caracteres')).toHaveCount(0)
  })

  test('máximo de caracteres só aparece para Texto e começa em 500', async ({ page }) => {
    await novo(page)

    await expect(item(page, 1).getByLabel('Máx. caracteres')).toHaveCount(0)
    await escolherTipo(page, 1, 'Texto')
    await expect(item(page, 1).getByLabel('Máx. caracteres')).toHaveValue('500')
    await escolherTipo(page, 1, 'Número')
    await expect(item(page, 1).getByLabel('Máx. caracteres')).toHaveCount(0)
  })

  test('campos usam validação HTML5', async ({ page }) => {
    await novo(page)
    await escolherTipo(page, 1, 'Texto')

    const nome = page.getByLabel('Nome', { exact: true })
    const pergunta = item(page, 1).getByLabel('Pergunta')
    const max = item(page, 1).getByLabel('Máx. caracteres')
    await expect(nome).toHaveAttribute('required', '')
    await expect(nome).toHaveAttribute('maxlength', '100')
    await expect(pergunta).toHaveAttribute('required', '')
    await expect(pergunta).toHaveAttribute('maxlength', '200')
    await expect(max).toHaveAttribute('type', 'number')
    await expect(max).toHaveAttribute('min', '1')
    await expect(max).toHaveAttribute('max', '500')

    await page.getByRole('button', { name: 'Salvar' }).click()
    expect(await nome.evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true)
    await expect(page).toHaveURL(new RegExp(`${LISTA_MODELOS}/novo$`))
  })

  test('não salva máximo de caracteres acima de 500', async ({ page }) => {
    await novo(page)
    await preencherChecklist(page, nomeUnico(), [{ pergunta: 'Obs', tipo: 'Texto', max: 501 }])

    await page.getByRole('button', { name: 'Salvar' }).click()

    const max = item(page, 1).getByLabel('Máx. caracteres')
    expect(await max.evaluate((el: HTMLInputElement) => el.validity.rangeOverflow)).toBe(true)
    await expect(page).toHaveURL(new RegExp(`${LISTA_MODELOS}/novo$`))
  })

  test('validação do formulário mostra as mensagens quando o navegador não bloqueia', async ({ page }) => {
    await novo(page)
    // Desliga a validação nativa para exercitar a do Zod.
    await page.locator('form[aria-label="Modelo de checklist"]').evaluate((form: HTMLFormElement) => (form.noValidate = true))
    await page.getByLabel('Nome', { exact: true }).fill('   ')
    await escolherTipo(page, 1, 'Texto')
    await item(page, 1).getByLabel('Máx. caracteres').fill('0')

    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('Informe o nome.')).toBeVisible()
    await expect(item(page, 1).getByText('Informe a pergunta.')).toBeVisible()
    await expect(item(page, 1).getByText('Informe de 1 a 500.')).toBeVisible()
  })

  test('reordena e remove itens antes de salvar', async ({ page }) => {
    const nome = nomeUnico()
    criados.push(nome)
    await novo(page)
    await preencherChecklist(page, nome, [
      { pergunta: 'Primeira', tipo: 'Sim/Não' },
      { pergunta: 'Segunda', tipo: 'Sim/Não' },
      { pergunta: 'Terceira', tipo: 'Sim/Não' },
    ])

    await expect(item(page, 1).getByRole('button', { name: 'Mover para cima' })).toBeDisabled()
    await expect(item(page, 3).getByRole('button', { name: 'Mover para baixo' })).toBeDisabled()
    await item(page, 3).getByRole('button', { name: 'Mover para cima' }).click()
    await item(page, 1).getByRole('button', { name: 'Remover item' }).click()

    await expect(item(page, 1).getByLabel('Pergunta')).toHaveValue('Terceira')
    await expect(item(page, 2).getByLabel('Pergunta')).toHaveValue('Segunda')
    await expect(item(page, 3)).toHaveCount(0)

    await salvar(page)
    await page.reload()
    await expect(item(page, 1).getByLabel('Pergunta')).toHaveValue('Terceira')
    await expect(item(page, 2).getByLabel('Pergunta')).toHaveValue('Segunda')
  })

  test('não permite remover o único item', async ({ page }) => {
    await novo(page)

    await expect(item(page, 1).getByRole('button', { name: 'Remover item' })).toBeDisabled()
  })

  test('erro do servidor aparece no formulário', async ({ page }) => {
    await page.route('**/api/checklist', (route) =>
      route.request().method() === 'POST'
        ? route.fulfill({ status: 400, json: { status: 400, message: 'Item 1: o máximo de caracteres deve ser entre 1 e 500.' } })
        : route.continue(),
    )
    await novo(page)
    await preencherChecklist(page, nomeUnico(), [{ pergunta: 'Obs', tipo: 'Sim/Não' }])

    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByRole('alert').filter({ hasText: 'Item 1: o máximo' })).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`${LISTA_MODELOS}/novo$`))
  })

})

test.describe('Salvar permanece na tela', () => {
  test.beforeEach(async ({ page }) => entrar(page, contas.supervisor))

  test('novo checklist vira edição após salvar e um novo Salvar não duplica', async ({ page }) => {
    const nome = nomeUnico()
    criados.push(nome)
    await novo(page)
    await preencherChecklist(page, nome, [{ pergunta: 'Primeira', tipo: 'Sim/Não' }])

    const id = await salvar(page)
    await expect(page.getByLabel('Nome', { exact: true })).toHaveValue(nome)

    await page.getByRole('button', { name: 'Adicionar item' }).click()
    await item(page, 2).getByLabel('Pergunta').fill('Segunda')
    expect(await salvar(page)).toBe(id)

    await page.goto(LISTA_MODELOS)
    await expect(linha(page, nome)).toHaveCount(1)
    await expect(linha(page, nome)).toContainText('2')
  })

  test('edição salva continua na tela e persiste após recarregar', async ({ page }) => {
    const nome = nomeUnico()
    const editado = nomeUnico('E2E editado')
    criados.push(nome, editado)
    await novo(page)
    await preencherChecklist(page, nome, [{ pergunta: 'Primeira', tipo: 'Sim/Não' }])
    await salvar(page)

    await page.getByLabel('Nome', { exact: true }).fill(editado)
    await salvar(page)

    // Sem alterações pendentes depois de salvar uma edição.
    await page.getByRole('button', { name: 'Cancelar' }).click()
    await expect(dialogoDescarte(page)).toHaveCount(0)
    await expect(linha(page, editado)).toHaveCount(1)

    await linha(page, editado).getByRole('link', { name: `Editar ${editado}` }).click()
    await expect(page.getByLabel('Nome', { exact: true })).toHaveValue(editado)
  })

  test('erro ao salvar mantém os dados e as alterações pendentes', async ({ page }) => {
    await page.route('**/api/checklist', (route) =>
      route.request().method() === 'POST' ? route.fulfill({ status: 500, json: { status: 500, message: 'Erro interno.' } }) : route.continue(),
    )
    const nome = nomeUnico()
    await novo(page)
    await preencherChecklist(page, nome, [{ pergunta: 'Primeira', tipo: 'Sim/Não' }])

    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByRole('alert').filter({ hasText: 'Erro interno.' })).toBeVisible()
    await expect(page.getByLabel('Nome', { exact: true })).toHaveValue(nome)
    await page.getByRole('button', { name: 'Cancelar' }).click()
    await expect(dialogoDescarte(page)).toBeVisible()
  })
})

test.describe('Cancelar com alterações não salvas', () => {
  test.beforeEach(async ({ page }) => entrar(page, contas.supervisor))

  test('sem alterações, Cancelar volta direto para a lista', async ({ page }) => {
    await novo(page)

    await page.getByRole('button', { name: 'Cancelar' }).click()

    await expect(dialogoDescarte(page)).toHaveCount(0)
    await expect(page).toHaveURL(new RegExp(`${LISTA_MODELOS}$`))
  })

  test('com alterações, pede confirmação e informa a perda', async ({ page }) => {
    await novo(page)
    await page.getByLabel('Nome', { exact: true }).fill('Rascunho')

    await page.getByRole('button', { name: 'Cancelar' }).click()

    const dialogo = dialogoDescarte(page)
    await expect(dialogo).toBeVisible()
    await expect(dialogo).toContainText('As informações não salvas serão perdidas.')
    await expect(dialogo.getByRole('button', { name: 'Cancelar' })).toBeFocused()
  })

  test('voltar no diálogo mantém a tela e os dados', async ({ page }) => {
    await novo(page)
    await page.getByLabel('Nome', { exact: true }).fill('Rascunho')
    await page.getByRole('button', { name: 'Cancelar' }).click()

    await dialogoDescarte(page).getByRole('button', { name: 'Cancelar' }).click()

    await expect(dialogoDescarte(page)).toHaveCount(0)
    await expect(page).toHaveURL(new RegExp(`${LISTA_MODELOS}/novo$`))
    await expect(page.getByLabel('Nome', { exact: true })).toHaveValue('Rascunho')
  })

  test('Descartar volta para a lista sem salvar', async ({ page }) => {
    const nome = nomeUnico()
    await novo(page)
    await preencherChecklist(page, nome, [{ pergunta: 'Primeira', tipo: 'Sim/Não' }])
    await page.getByRole('button', { name: 'Cancelar' }).click()

    await dialogoDescarte(page).getByRole('button', { name: 'Descartar' }).click()

    await expect(page).toHaveURL(new RegExp(`${LISTA_MODELOS}$`))
    await expect(linha(page, nome)).toHaveCount(0)
  })

  test('mudança só nos itens também conta como alteração', async ({ page }) => {
    await page.goto(`${LISTA_MODELOS}/7c3a9e20-0001-4b1d-9c00-000000000001`)
    await expect(item(page, 2)).toBeVisible()

    await item(page, 2).getByRole('button', { name: 'Mover para cima' }).click()
    await page.getByRole('button', { name: 'Cancelar' }).click()

    await expect(dialogoDescarte(page)).toBeVisible()
  })

  test('desfazer a alteração manualmente dispensa a confirmação', async ({ page }) => {
    await page.goto(`${LISTA_MODELOS}/7c3a9e20-0001-4b1d-9c00-000000000001`)
    const nome = page.getByLabel('Nome', { exact: true })
    const original = await nome.inputValue()

    await nome.fill(`${original} x`)
    await nome.fill(original)
    await page.getByRole('button', { name: 'Cancelar' }).click()

    await expect(dialogoDescarte(page)).toHaveCount(0)
    await expect(page).toHaveURL(new RegExp(`${LISTA_MODELOS}$`))
  })

  test('depois de salvar, Cancelar não pede confirmação', async ({ page }) => {
    const nome = nomeUnico()
    criados.push(nome)
    await novo(page)
    await preencherChecklist(page, nome, [{ pergunta: 'Primeira', tipo: 'Sim/Não' }])
    await salvar(page)

    await page.getByRole('button', { name: 'Cancelar' }).click()

    await expect(dialogoDescarte(page)).toHaveCount(0)
    await expect(page).toHaveURL(new RegExp(`${LISTA_MODELOS}$`))
  })
})

test.describe('Edição e exclusão', () => {
  let nome: string

  test.beforeEach(async ({ page }) => {
    await entrar(page, contas.supervisor)
    nome = nomeUnico()
    criados.push(nome)
    await novo(page)
    await preencherChecklist(page, nome, [{ pergunta: 'Inicial', tipo: 'Sim/Não' }])
    await salvarEVoltar(page)
  })

  test('edita nome e itens', async ({ page }) => {
    const novoNome = nomeUnico('E2E editado')
    criados.push(novoNome)
    await linha(page, nome).getByRole('link', { name: `Editar ${nome}` }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Editar modelo de checklist' })).toBeVisible()

    await page.getByLabel('Nome', { exact: true }).fill(novoNome)
    await page.getByRole('button', { name: 'Adicionar item' }).click()
    await item(page, 2).getByLabel('Pergunta').fill('Nova pergunta')
    await salvarEVoltar(page)

    await expect(linha(page, nome)).toHaveCount(0)
    await expect(linha(page, novoNome)).toContainText('2')
  })

  test('excluir pede confirmação e cancelar mantém o checklist', async ({ page }) => {
    await linha(page, nome).getByRole('button', { name: `Excluir ${nome}` }).click()

    const dialogo = page.getByRole('alertdialog', { name: 'Excluir modelo de checklist?' })
    await expect(dialogo).toContainText(nome)
    await expect(dialogo.getByRole('button', { name: 'Cancelar' })).toBeFocused()
    await dialogo.getByRole('button', { name: 'Cancelar' }).click()

    await expect(linha(page, nome)).toHaveCount(1)
  })

  test('excluir confirmado remove da lista', async ({ page }) => {
    await linha(page, nome).getByRole('button', { name: `Excluir ${nome}` }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Excluir' }).click()

    await expect(page.getByText('Modelo de checklist excluído.')).toBeVisible()
    await expect(linha(page, nome)).toHaveCount(0)
  })

  test('checklist inexistente mostra aviso', async ({ page }) => {
    await page.goto(`${LISTA_MODELOS}/00000000-0000-0000-0000-000000000000`)

    await expect(page.getByText('Modelo de checklist não encontrado.')).toBeVisible()
  })
})

test.describe('Layout e atalhos do editor', () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page, contas.supervisor)
    await novo(page)
  })

  async function tresItens(page: Page) {
    await preencherChecklist(page, nomeUnico(), [
      { pergunta: 'Primeira', tipo: 'Sim/Não' },
      { pergunta: 'Segunda', tipo: 'Sim/Não' },
      { pergunta: 'Terceira', tipo: 'Sim/Não' },
    ])
  }

  test('Enter no nome vai para a primeira pergunta sem enviar', async ({ page }) => {
    await page.getByLabel('Nome', { exact: true }).fill('Qualquer')
    await page.getByLabel('Nome', { exact: true }).press('Enter')

    await expect(item(page, 1).getByLabel('Pergunta')).toBeFocused()
    await expect(page).toHaveURL(new RegExp(`${LISTA_MODELOS}/novo$`))
  })

  test('Enter na última pergunta cria um item e foca nele', async ({ page }) => {
    await item(page, 1).getByLabel('Pergunta').fill('Primeira')
    await item(page, 1).getByLabel('Pergunta').press('Enter')

    await expect(item(page, 2).getByLabel('Pergunta')).toBeFocused()
    await page.keyboard.type('Segunda')
    await page.keyboard.press('Enter')

    await expect(item(page, 3).getByLabel('Pergunta')).toBeFocused()
    await expect(item(page, 2).getByLabel('Pergunta')).toHaveValue('Segunda')
  })

  test('Enter numa pergunta do meio vai para a próxima sem criar item', async ({ page }) => {
    await tresItens(page)

    await item(page, 1).getByLabel('Pergunta').press('Enter')

    await expect(item(page, 2).getByLabel('Pergunta')).toBeFocused()
    await expect(item(page, 4)).toHaveCount(0)
  })

  test('arrastar pelo teclado reordena os itens', async ({ page }) => {
    await tresItens(page)

    const alca = item(page, 3).getByRole('button', { name: 'Arrastar item 3' })
    await alca.focus()
    await page.keyboard.press('Space')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Space')

    await expect(item(page, 1).getByLabel('Pergunta')).toHaveValue('Terceira')
    await expect(item(page, 2).getByLabel('Pergunta')).toHaveValue('Primeira')
    await expect(item(page, 3).getByLabel('Pergunta')).toHaveValue('Segunda')
  })

  test('arrastar com o mouse reordena os itens', async ({ page, isMobile }) => {
    test.skip(isMobile, 'No celular o arraste é por toque; coberto pelo teste de teclado.')
    await tresItens(page)

    const origem = (await item(page, 1).getByRole('button', { name: 'Arrastar item 1' }).boundingBox())!
    const destino = (await item(page, 3).getByRole('button', { name: 'Arrastar item 3' }).boundingBox())!
    await page.mouse.move(origem.x + origem.width / 2, origem.y + origem.height / 2)
    await page.mouse.down()
    await page.mouse.move(destino.x + destino.width / 2, destino.y + destino.height / 2 + 10, { steps: 12 })
    await page.mouse.up()

    await expect(item(page, 1).getByLabel('Pergunta')).toHaveValue('Segunda')
    await expect(item(page, 3).getByLabel('Pergunta')).toHaveValue('Primeira')
  })

  test('Adicionar item fica acima da lista e o novo item recebe o foco', async ({ page }) => {
    const itens = Array.from({ length: 15 }, (_, i) => ({ pergunta: `Pergunta ${i + 1}`, tipo: 'Sim/Não' as const }))
    await preencherChecklist(page, nomeUnico(), itens)
    const adicionar = page.getByRole('button', { name: 'Adicionar item' })

    const botao = (await adicionar.boundingBox())!
    const primeiro = (await item(page, 1).boundingBox())!
    expect(botao.y).toBeLessThan(primeiro.y)

    await adicionar.click()

    await expect(item(page, 16).getByLabel('Pergunta')).toBeFocused()
    await expect(item(page, 16).getByLabel('Pergunta')).toBeInViewport()
    await expect(page.getByRole('heading', { level: 2, name: /Itens/ })).toContainText('16/50')
  })

  test('Nome mostra o contador e não aceita mais de 100 caracteres', async ({ page }) => {
    const nome = page.getByLabel('Nome', { exact: true })
    await expect(page.getByText('0/100')).toBeVisible()

    await nome.click()
    await page.keyboard.type('a'.repeat(105))

    await expect(nome).toHaveValue('a'.repeat(100))
    await expect(page.getByText('100/100')).toBeVisible()
  })

  test('contador da pergunta aparece perto do limite e trava em 200', async ({ page }) => {
    const pergunta = item(page, 1).getByLabel('Pergunta')

    await pergunta.fill('a'.repeat(150))
    await expect(item(page, 1).getByText('/200')).toHaveCount(0)

    await pergunta.fill('a'.repeat(160))
    await expect(item(page, 1).getByText('160/200')).toBeVisible()

    await pergunta.click()
    await page.keyboard.press('End')
    await page.keyboard.type('b'.repeat(50))
    await expect(pergunta).toHaveValue('a'.repeat(160) + 'b'.repeat(40))
    await expect(item(page, 1).getByText('200/200')).toBeVisible()
  })

  test('Salvar continua visível com muitos itens', async ({ page }) => {
    const itens = Array.from({ length: 15 }, (_, i) => ({ pergunta: `Pergunta ${i + 1}`, tipo: 'Sim/Não' as const }))
    await preencherChecklist(page, nomeUnico(), itens)

    await page.evaluate(() => window.scrollTo(0, 0))

    await expect(page.getByLabel('Nome', { exact: true })).toBeInViewport()
    await expect(page.getByRole('button', { name: 'Salvar' })).toBeInViewport()
  })

  test('no desktop cada item ocupa uma linha compacta', async ({ page, isMobile }) => {
    test.skip(isMobile, 'No celular cada item é um cartão.')
    await escolherTipo(page, 1, 'Texto')

    const altura = (await item(page, 1).boundingBox())!.height
    expect(altura).toBeLessThan(64)
  })

  test('no desktop as ações aparecem ao passar o mouse ou focar a linha', async ({ page, isMobile }) => {
    test.skip(isMobile, 'No celular as ações ficam sempre visíveis.')
    await tresItens(page)
    await page.mouse.move(0, 0)
    await page.getByLabel('Nome', { exact: true }).focus()

    const acoes = (n: number) => item(page, n).getByRole('button', { name: 'Remover item' }).locator('..')
    const opacidade = (n: number) => acoes(n).evaluate((el) => getComputedStyle(el).opacity)

    await expect.poll(() => opacidade(2)).toBe('0')
    await item(page, 2).hover()
    await expect.poll(() => opacidade(2)).toBe('1')

    await page.mouse.move(0, 0)
    await item(page, 3).getByLabel('Pergunta').focus()
    await expect.poll(() => opacidade(3)).toBe('1')
  })

  test('no celular as ações ficam sempre visíveis', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Comportamento específico do celular.')

    const acoes = item(page, 1).getByRole('button', { name: 'Remover item' }).locator('..')
    await expect.poll(() => acoes.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
  })
})

test('estrutura HTML5 do formulário', async ({ page }) => {
  await entrar(page, contas.supervisor)
  await novo(page)

  await expect(page.locator('main')).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await expect(page.getByRole('form', { name: 'Modelo de checklist' })).toBeVisible()
  await expect(page.getByRole('group', { name: 'Item 1', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: /Itens/ })).toBeVisible()
})
