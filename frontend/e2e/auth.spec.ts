import { expect, test, type Page } from '@playwright/test'
import { contas, entrar, menuDoUsuario, pedirSaida, preencherLogin, sair, SENHA_DEMO } from './support/auth'

/** Itens do menu lateral. No celular o menu fica numa gaveta aberta pelo botão "Alternar menu". */
async function navegacao(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByRole('button', { name: 'Alternar menu' }).click()
  return page.getByRole('navigation', { name: 'Principal' })
}

test.describe('Tela de login', () => {
  test('mostra o logo, o título e, em telas largas, a frase da marca', async ({ page, isMobile }) => {
    await page.goto('/login')
    await expect(page.getByRole('img', { name: 'SmartMall Ops IA' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: 'Entrar no sistema' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(page.getByRole('heading', { level: 2, name: 'Perfis de demonstração' })).toBeVisible()
    test.skip(isMobile, 'O painel da marca só aparece em telas largas.')

    // A frase inteira fica para leitores de tela; as letras visíveis são decorativas (easter egg, aria-hidden).
    await expect(page.getByRole('complementary')).toMatchAriaSnapshot(`
      - paragraph: Boas-vindas ao SmartMall Ops IA
      - paragraph: Acompanhe chamados, tarefas, equipes e estoque do Capim Dourado Shopping.
    `)
  })

  test('easter egg: dois cliques no logo soltam o elefante, e a frase volta depois', async ({ page, isMobile }) => {
    test.skip(isMobile, 'O painel da marca só aparece em telas largas.')
    await page.goto('/login')
    const elefante = page.getByRole('img', { name: 'Elefante' })
    await expect(elefante).toHaveCount(0)

    await page.getByRole('complementary').getByRole('img', { name: 'SmartMall Ops IA' }).dblclick()

    await expect(elefante).toBeVisible()
    // Travessia (3,6 s) + pausa (1,8 s): o elefante sai e a frase continua acessível.
    await expect(elefante).toHaveCount(0, { timeout: 10_000 })
    await expect(page.getByRole('complementary')).toMatchAriaSnapshot(`
      - paragraph: Boas-vindas ao SmartMall Ops IA
    `)
  })

  test('rota interna sem sessão leva ao login', async ({ page }) => {
    await page.goto('/central')

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Entrar' })).toBeVisible()
  })

  test('formulário usa campos HTML5 com rótulo e validação nativa', async ({ page }) => {
    await page.goto('/login')

    const email = page.getByLabel('E-mail')
    const senha = page.getByLabel('Senha')
    await expect(email).toHaveAttribute('type', 'email')
    await expect(email).toHaveAttribute('required', '')
    await expect(senha).toHaveAttribute('type', 'password')
    await expect(senha).toHaveAttribute('required', '')
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')

    await page.getByRole('button', { name: 'Entrar', exact: true }).click()

    expect(await email.evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true)
    await expect(page).toHaveURL(/\/login$/)
  })

  test('e-mail em formato inválido é bloqueado pelo navegador', async ({ page }) => {
    await page.goto('/login')

    await preencherLogin(page, 'admin', SENHA_DEMO)

    expect(await page.getByLabel('E-mail').evaluate((el: HTMLInputElement) => el.validity.typeMismatch)).toBe(true)
    await expect(page).toHaveURL(/\/login$/)
  })

  test('senha errada mostra erro e mantém no login', async ({ page }) => {
    await page.goto('/login')

    await preencherLogin(page, contas.supervisor.email, 'senha-errada')

    await expect(page.getByRole('alert')).toHaveText('E-mail ou senha inválidos.')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('e-mail inexistente mostra a mesma mensagem de senha errada', async ({ page }) => {
    await page.goto('/login')

    await preencherLogin(page, 'ninguem@smartmall.local', SENHA_DEMO)

    await expect(page.getByRole('alert')).toHaveText('E-mail ou senha inválidos.')
  })
})

test.describe('Login por perfil', () => {
  for (const conta of Object.values(contas)) {
    test(`${conta.perfil} entra pelo formulário e vê nome e perfil`, async ({ page, isMobile }) => {
      await entrar(page, conta)

      // Antes de abrir o menu: com ele aberto, o resto da página fica aria-hidden.
      if (!isMobile) await expect(page.getByRole('banner')).toContainText(`${conta.nome}${conta.perfil}`)

      await menuDoUsuario(page, conta).click()
      const menu = page.getByRole('menu')
      await expect(menu).toContainText(conta.nome)
      await expect(menu).toContainText(conta.email)
    })

    test(`${conta.perfil} entra pelo acesso de demonstração`, async ({ page }) => {
      await page.goto('/login')

      await page.getByRole('button', { name: conta.perfil, exact: true }).click()

      await expect(menuDoUsuario(page, conta)).toBeVisible()
      await expect(page).not.toHaveURL(/\/login$/)
    })
  }
})

test.describe('Permissões por perfil', () => {
  test('Administrador e Supervisor acessam a Central de Controle', async ({ page, isMobile }) => {
    for (const conta of [contas.administrador, contas.supervisor]) {
      await entrar(page, conta)

      await expect(page).toHaveURL(/\/central$/)
      await expect(page.getByRole('heading', { level: 1, name: 'Central de Controle' })).toBeVisible()
      await expect((await navegacao(page, isMobile)).getByRole('link', { name: 'Central de Controle' })).toBeVisible()

      await page.keyboard.press('Escape')
      await sair(page, conta)
    }
  })

  test('Funcionário entra em Tarefas, não vê a Central no menu e é bloqueado pela URL', async ({ page, isMobile }) => {
    await entrar(page, contas.funcionario)

    await expect(page).toHaveURL(/\/tarefas$/)
    const menu = await navegacao(page, isMobile)
    await expect(menu.getByRole('link', { name: 'Tarefas' })).toBeVisible()
    await expect(menu.getByRole('link', { name: 'Central de Controle' })).toHaveCount(0)
    for (const restrito of ['Em análise', 'Manutenções programadas', 'Modelos de checklist', 'Equipamentos', 'Equipes']) {
      await expect(menu.getByRole('link', { name: restrito })).toHaveCount(0)
    }

    await page.goto('/central')
    await expect(page.getByText('Acesso não permitido para o seu perfil.')).toBeVisible()
  })
})

test.describe('Sessão', () => {
  test('volta à rota de origem depois do login', async ({ page }) => {
    await page.goto('/central')
    await expect(page).toHaveURL(/\/login$/)

    await preencherLogin(page, contas.supervisor.email, SENHA_DEMO)

    await expect(page).toHaveURL(/\/central$/)
  })

  test('ignora rota de origem não permitida ao perfil', async ({ page }) => {
    await page.goto('/central')

    await preencherLogin(page, contas.funcionario.email, SENHA_DEMO)

    // Vai para o primeiro módulo permitido (Tarefas), não para a Central.
    await expect(page).toHaveURL(/\/tarefas$/)
  })

  test('sessão continua após recarregar a página', async ({ page }) => {
    await entrar(page, contas.supervisor)

    await page.reload()

    await expect(menuDoUsuario(page, contas.supervisor)).toBeVisible()
  })

  test('cookie de sessão é HttpOnly e SameSite=Strict', async ({ page, context }) => {
    await entrar(page, contas.supervisor)

    const cookie = (await context.cookies()).find((c) => c.name === 'JSESSIONID')
    expect(cookie?.httpOnly).toBe(true)
    expect(cookie?.sameSite).toBe('Strict')
    expect(await page.evaluate(() => document.cookie)).not.toContain('JSESSIONID')
  })

  test('usuário logado que abre /login vai para o sistema', async ({ page }) => {
    await entrar(page, contas.administrador)

    await page.goto('/login')

    await expect(page).toHaveURL(/\/central$/)
  })

  test('sair encerra a sessão e protege as rotas novamente', async ({ page }) => {
    await entrar(page, contas.supervisor)

    await sair(page, contas.supervisor)
    await page.goto('/central')

    await expect(page).toHaveURL(/\/login$/)
    expect((await page.request.get('/api/auth/sessao')).status()).toBe(401)
  })

  test('sair pede confirmação e cancelar mantém a sessão', async ({ page }) => {
    await entrar(page, contas.supervisor)
    const url = page.url()

    const dialogo = await pedirSaida(page, contas.supervisor)
    await expect(dialogo.getByRole('button', { name: 'Cancelar' })).toBeFocused()
    await dialogo.getByRole('button', { name: 'Cancelar' }).click()

    await expect(dialogo).toBeHidden()
    await expect(page).toHaveURL(url)
    expect((await page.request.get('/api/auth/sessao')).status()).toBe(200)
  })

  test('Esc fecha a confirmação sem sair', async ({ page }) => {
    await entrar(page, contas.administrador)

    const dialogo = await pedirSaida(page, contas.administrador)
    await page.keyboard.press('Escape')

    await expect(dialogo).toBeHidden()
    await expect(menuDoUsuario(page, contas.administrador)).toBeVisible()
    expect((await page.request.get('/api/auth/sessao')).status()).toBe(200)
  })

  test('menu continua utilizável depois de cancelar a saída', async ({ page }) => {
    await entrar(page, contas.supervisor)

    const dialogo = await pedirSaida(page, contas.supervisor)
    await dialogo.getByRole('button', { name: 'Cancelar' }).click()

    await sair(page, contas.supervisor)
  })

  test('sessão expirada no servidor leva ao login', async ({ page, context }) => {
    await entrar(page, contas.supervisor)

    await context.clearCookies()
    await page.reload()

    await expect(page).toHaveURL(/\/login$/)
  })

  test('401 numa chamada da tela encerra a sessão no cliente', async ({ page }) => {
    await page.route('**/api/piso**', (route) =>
      route.fulfill({ status: 401, json: { status: 401, message: 'Sessão expirada. Entre novamente.' } }),
    )
    await page.goto('/login')

    await preencherLogin(page, contas.supervisor.email, SENHA_DEMO)

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Entrar' })).toBeVisible()
  })

  test('API sem sessão responde 401', async ({ page }) => {
    expect((await page.request.get('/api/piso')).status()).toBe(401)
  })
})
