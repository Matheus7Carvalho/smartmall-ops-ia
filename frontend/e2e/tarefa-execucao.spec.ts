import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { contas, entrar } from './support/auth'
import { dialogoDescarte } from './support/cadastros'
import { camposSemLimite } from './support/limites'
import {
  apiComo,
  criarTarefaDoJoao,
  descartarProgramada,
  enviarParaAnaliseViaApi,
  imagem,
  type TarefaCriada,
} from './support/tarefas'

/**
 * Execução (responsável) e validação (Supervisor) da tarefa: docs/modulo-manutencao.md, passos 4 e 5.
 * Cada teste cria a própria manutenção programada única e a descarta no fim.
 */

let admin: APIRequestContext
let joao: APIRequestContext
let t: TarefaCriada

test.beforeEach(async ({ baseURL }) => {
  admin = await apiComo(baseURL!, contas.administrador)
  joao = await apiComo(baseURL!, contas.funcionario)
  t = await criarTarefaDoJoao(admin)
})

test.afterEach(async () => {
  await descartarProgramada(admin, t)
  await admin.dispose()
  await joao.dispose()
})

const formulario = (page: Page) => page.getByRole('form', { name: 'Execução da tarefa' })
const resumo = (page: Page) => page.locator('dl').first()
const historico = (page: Page) => page.getByRole('region', { name: 'Histórico' })

async function detalheDoJoao() {
  return (await (await joao.get(`/api/tarefa/${t.tarefaId}`)).json()) as {
    tarefa: { status: string; responsavel: { nome: string } | null }
    acoes: { executar: boolean }
  }
}

async function responderObrigatorios(page: Page) {
  const form = formulario(page)
  for (const pergunta of ['Sistema de tração inspecionado?', 'Cabos e freios em condição normal?', 'Portas e sensores funcionando?']) {
    await form.getByRole('group', { name: pergunta, exact: false }).getByText('Sim', { exact: true }).click()
  }
  await form.getByLabel('Desnível na parada (mm)').fill('2.5')
}

test.describe('Execução pelo responsável', () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page, contas.funcionario)
  })

  test('assume pela tela Tarefas, preenche o checklist, anexa evidência e envia para análise', async ({ page }) => {
    await page.goto(`/tarefas?dia=${t.dia}`)
    // Testes em paralelo podem cair no mesmo dia: o item certo é o que leva a esta tarefa.
    const item = page.getByRole('listitem').filter({ has: page.locator(`a[href="/tarefas/${t.tarefaId}"]`) })
    await expect(item.getByRole('link', { name: new RegExp(`^Abrir tarefa de ${t.titulo}`) })).toBeVisible()
    // O item inteiro abre a tarefa, não só o nome: clique na área do horário (canto superior esquerdo).
    await item.click({ position: { x: 16, y: 16 } })
    await expect(page).toHaveURL(new RegExp(`/tarefas/${t.tarefaId}$`))
    await expect(resumo(page)).toContainText('Agendada')

    await page.getByRole('button', { name: 'Assumir tarefa' }).click()
    const assumir = page.waitForResponse((r) => r.url().endsWith(`/api/tarefa/${t.tarefaId}/assumir`))
    await page.getByRole('alertdialog', { name: 'Assumir esta tarefa?' }).getByRole('button', { name: 'Assumir' }).click()
    expect((await assumir).ok()).toBe(true)
    await expect(formulario(page)).toBeVisible()
    await expect(resumo(page)).toContainText('Em execução')
    await expect(resumo(page)).toContainText(contas.funcionario.nome)
    expect(await camposSemLimite(page)).toEqual([])

    // Sem respostas: aponta os obrigatórios sem chamar a API.
    await page.getByRole('button', { name: 'Enviar para análise' }).click()
    await expect(formulario(page).getByText('Responda os itens obrigatórios.')).toBeVisible()
    await expect(formulario(page).getByText('Responda este item.')).toHaveCount(4)

    await responderObrigatorios(page)
    await formulario(page).getByLabel('Observação', { exact: true }).fill('Freio regulado.')

    // Sem imagem: não envia.
    await page.getByRole('button', { name: 'Enviar para análise' }).click()
    await expect(formulario(page).getByText('Anexe ao menos uma imagem como evidência.')).toBeVisible()

    const anexo = page.waitForResponse((r) => r.url().endsWith(`/api/tarefa/${t.tarefaId}/evidencia`))
    await page.getByLabel('Arquivo de imagem').setInputFiles(imagem('freio.png'))
    expect((await anexo).ok()).toBe(true)
    await expect(formulario(page).getByRole('img', { name: 'freio.png' })).toBeVisible()

    const envio = page.waitForResponse((r) => r.url().endsWith(`/api/tarefa/${t.tarefaId}/enviar`))
    await page.getByRole('button', { name: 'Enviar para análise' }).click()
    expect((await envio).ok()).toBe(true)

    await expect(formulario(page)).toHaveCount(0)
    await expect(resumo(page)).toContainText('Em análise')
    await expect(historico(page)).toContainText('Enviada para análise')
    await expect(historico(page)).toContainText('Freio regulado.')
    await expect(historico(page).getByRole('img', { name: 'freio.png' })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Checklist' })).toContainText('2,5')
  })

  test('salvar guarda o rascunho e o Cancelar segue a regra de descarte', async ({ page }) => {
    expect((await joao.post(`/api/tarefa/${t.tarefaId}/assumir`)).ok()).toBe(true)
    await page.goto(`/tarefas/${t.tarefaId}`)
    const form = formulario(page)
    const freios = form.getByRole('group', { name: 'Cabos e freios em condição normal?', exact: false })

    // Sem alterações: Cancelar sai direto (sem origem, para Tarefas).
    await page.getByRole('button', { name: 'Cancelar' }).click()
    await expect(page).toHaveURL(/\/tarefas$/)
    await page.goto(`/tarefas/${t.tarefaId}`)

    await freios.getByText('Não', { exact: true }).click()
    await expect(form).toHaveAttribute('data-alterado', 'true')
    await page.getByRole('button', { name: 'Cancelar' }).click()
    await dialogoDescarte(page).getByRole('button', { name: 'Cancelar' }).click()
    await expect(form).toHaveAttribute('data-alterado', 'true')

    const salvar = page.waitForResponse((r) => r.url().endsWith(`/api/tarefa/${t.tarefaId}/execucao`))
    await page.getByRole('button', { name: 'Salvar', exact: true }).click()
    expect((await salvar).ok()).toBe(true)
    await expect(form).toHaveAttribute('data-alterado', 'false')
    await expect(resumo(page)).toContainText('Em execução')

    await page.reload()
    await expect(freios.getByRole('radio', { name: 'Não' })).toBeChecked()

    await freios.getByText('Sim', { exact: true }).click()
    await page.getByRole('button', { name: 'Cancelar' }).click()
    await dialogoDescarte(page).getByRole('button', { name: 'Descartar' }).click()
    await expect(page).toHaveURL(/\/tarefas$/)
    expect((await detalheDoJoao()).tarefa.status).toBe('EM_EXECUCAO')
  })

  test('após reprovação vê o motivo no topo e as imagens do envio anterior', async ({ page, baseURL }) => {
    await enviarParaAnaliseViaApi(joao, t.tarefaId)
    const supervisor = await apiComo(baseURL!, contas.supervisor)
    const reprovacao = await supervisor.post(`/api/tarefa/${t.tarefaId}/reprovar`, { data: { observacao: 'Foto não mostra o sensor.' } })
    expect(reprovacao.ok(), await reprovacao.text()).toBe(true)
    await supervisor.dispose()

    await page.goto(`/tarefas/${t.tarefaId}`)

    const aviso = page.getByRole('alert', { name: 'Reprovação' })
    await expect(aviso).toContainText(`Reprovada por ${contas.supervisor.nome}`)
    await expect(aviso).toContainText('Motivo: Foto não mostra o sensor.')
    const evidencias = page.getByRole('region', { name: /^Evidências/ })
    await expect(evidencias.getByRole('heading', { name: '1º envio' })).toBeVisible()
    await expect(evidencias.getByRole('img', { name: 'painel.png' })).toBeVisible()
    await expect(evidencias.getByRole('button', { name: /^Remover/ })).toHaveCount(0)
    // As respostas do envio anterior continuam no formulário.
    await expect(formulario(page).getByRole('group', { name: 'Portas e sensores funcionando?', exact: false }).getByRole('radio', { name: 'Sim' })).toBeChecked()
  })

  test('em análise o responsável só consulta e não vê a avaliação', async ({ page }) => {
    await enviarParaAnaliseViaApi(joao, t.tarefaId)
    await page.goto(`/tarefas/${t.tarefaId}`)

    await expect(resumo(page)).toContainText('Em análise')
    await expect(formulario(page)).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Aprovar' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Reprovar' })).toHaveCount(0)

    await page.goto('/analise')
    await expect(page.getByText('Acesso não permitido para o seu perfil.')).toBeVisible()
  })
})

test.describe('Validação pelo Supervisor', () => {
  test.beforeEach(async ({ page }) => {
    await enviarParaAnaliseViaApi(joao, t.tarefaId, 'Troquei o sensor da porta.')
    await entrar(page, contas.supervisor)
    await page.goto('/analise')
    await expect(page.getByRole('heading', { level: 1, name: 'Análise de Tarefas' })).toBeVisible()
  })

  const linhaDaTarefa = (page: Page) => page.locator(`tr:has(a[href="/tarefas/${t.tarefaId}"])`)

  test('reprovar exige motivo e devolve a tarefa ao mesmo responsável', async ({ page }) => {
    await expect(linhaDaTarefa(page)).toContainText(contas.funcionario.nome)
    await linhaDaTarefa(page).getByRole('cell').first().click()
    await expect(page).toHaveURL(new RegExp(`/tarefas/${t.tarefaId}$`))

    await expect(historico(page)).toContainText('Troquei o sensor da porta.')
    await expect(historico(page).getByRole('img', { name: 'painel.png' })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Checklist' })).toContainText('Sim')

    await page.getByRole('button', { name: 'Reprovar' }).click()
    const dialogo = page.getByRole('alertdialog', { name: 'Reprovar tarefa?' })
    const motivo = dialogo.getByLabel('Motivo')
    await expect(motivo).toHaveAttribute('required', '')
    expect(await camposSemLimite(page)).toEqual([])
    await motivo.fill('Foto não mostra o sensor.')
    const reprovar = page.waitForResponse((r) => r.url().endsWith(`/api/tarefa/${t.tarefaId}/reprovar`))
    await dialogo.getByRole('button', { name: 'Reprovar' }).click()
    expect((await reprovar).ok()).toBe(true)

    // Volta para a fila, sem a tarefa.
    await expect(page).toHaveURL(/\/analise$/)
    await expect(linhaDaTarefa(page)).toHaveCount(0)

    const detalhe = await detalheDoJoao()
    expect(detalhe.tarefa.status).toBe('EM_EXECUCAO')
    expect(detalhe.tarefa.responsavel?.nome).toBe(contas.funcionario.nome)
    expect(detalhe.acoes.executar).toBe(true)
  })

  test('aprovar conclui a tarefa e registra no histórico', async ({ page }) => {
    await linhaDaTarefa(page).getByRole('link', { name: /^Analisar tarefa de/ }).click()

    await page.getByRole('button', { name: 'Aprovar' }).click()
    const aprovar = page.waitForResponse((r) => r.url().endsWith(`/api/tarefa/${t.tarefaId}/aprovar`))
    await page.getByRole('alertdialog', { name: 'Aprovar e concluir?' }).getByRole('button', { name: 'Aprovar' }).click()
    expect((await aprovar).ok()).toBe(true)
    await expect(page).toHaveURL(/\/analise$/)

    await page.goto(`/tarefas/${t.tarefaId}`)
    await expect(resumo(page)).toContainText('Concluída')
    await expect(historico(page)).toContainText('Aprovada')
    await expect(historico(page)).toContainText(contas.supervisor.nome)
    await expect(page.getByRole('button', { name: 'Aprovar' })).toHaveCount(0)
  })

  test('falha ao reprovar mantém o diálogo e o motivo digitado', async ({ page }) => {
    await page.route(`**/api/tarefa/${t.tarefaId}/reprovar`, (rota) =>
      rota.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ status: 400, message: 'Só tarefas em análise podem ser reprovadas.' }) }),
    )
    await page.goto(`/tarefas/${t.tarefaId}`)
    await page.getByRole('button', { name: 'Reprovar' }).click()
    const dialogo = page.getByRole('alertdialog', { name: 'Reprovar tarefa?' })
    await dialogo.getByLabel('Motivo').fill('Foto escura.')
    await dialogo.getByRole('button', { name: 'Reprovar' }).click()

    await expect(dialogo.getByText('Só tarefas em análise podem ser reprovadas.')).toBeVisible()
    await expect(dialogo.getByLabel('Motivo')).toHaveValue('Foto escura.')
  })
})
