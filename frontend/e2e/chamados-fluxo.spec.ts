import { randomUUID } from 'node:crypto'
import { expect, test, type Page } from '@playwright/test'
import { contas, entrar } from './support/auth'
import { escolher } from './support/cadastros'
import { marcaUnica, diaIso } from './support/programadas'
import { apiComo, PNG_1X1 } from './support/tarefas'

const marcas: string[] = []
const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
test.describe.configure({ mode: 'serial' })

/** Cria o relato pela entrada pública real; a marca permite limpeza segura no perfil dev. */
async function criarRelato(page: Page, marca: string, comFoto = false) {
  const dados = {
    descricao: `${marca} Vazamento na pia do banheiro norte`,
    codigoLocal: 'banheiro-norte',
    localInformado: 'Banheiro norte, pia 2',
    contato: 'cliente@example.com',
    chaveEnvio: randomUUID(),
  }
  const resposta = await page.request.post('/api/publico/chamado', {
    multipart: {
      dados: { name: 'dados.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(dados)) },
      ...(comFoto ? { midia: { name: 'pia.png', mimeType: 'image/png', buffer: PNG_1X1 } } : {}),
    },
    headers: { 'X-Local-Codigo': dados.codigoLocal },
  })
  expect(resposta.status(), await resposta.text()).toBe(201)
  return await resposta.json() as { id: string; protocolo: string; status: string }
}

test.afterEach(async () => {
  if (!marcas.length) return
  const admin = await apiComo(BASE_URL, contas.administrador)
  try {
    for (const marca of marcas.splice(0)) {
      const resposta = await admin.delete(`/api/teste/e2e?marca=${encodeURIComponent(marca)}`)
      expect(resposta.ok(), await resposta.text()).toBe(true)
    }
  } finally {
    await admin.dispose()
  }
})

test('supervisor aprova relato público e tarefa é criada', async ({ page }) => {
  const marca = marcaUnica()
  marcas.push(marca)
  const criado = await criarRelato(page, marca, true)
  expect(criado.status).toBe('EM_ANALISE')

  await entrar(page, contas.supervisor)
  await page.goto(`/chamados/${criado.id}`)
  await expect(page.getByRole('heading', { name: `Chamado ${criado.protocolo}` })).toBeVisible()
  await expect(page.getByText(`${marca} Vazamento na pia do banheiro norte`)).toBeVisible()
  await expect(page.getByRole('img', { name: `Mídia anexada ao chamado ${criado.protocolo}` })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Baixar mídia' })).toBeVisible()
  await escolher(page, 'Tipo', 'Manutenção')
  await escolher(page, 'Prioridade', 'Alta')
  await escolher(page, 'Equipe responsável', 'Hidráulica')
  await page.getByLabel('Data e horário previstos').fill(`${diaIso(1)}T14:00`)
  await page.getByLabel('Duração (minutos)').fill('45')
  await page.getByRole('button', { name: 'Revisar aprovação' }).click()
  const resposta = page.waitForResponse((r) => r.url().endsWith(`/api/chamado/${criado.id}/aprovar`) && r.request().method() === 'POST')
  await page.getByRole('alertdialog', { name: 'Aprovar este chamado?' }).getByRole('button', { name: 'Aprovar e criar tarefa' }).click()
  const aprovado = await resposta
  expect(aprovado.ok(), await aprovado.text()).toBe(true)
  const dados = await aprovado.json() as { status: string; tarefaId: string | null; tipoConfirmado: string; prioridadeConfirmada: string }
  expect(dados).toMatchObject({ status: 'APROVADA', tipoConfirmado: 'MANUTENCAO', prioridadeConfirmada: 'ALTA' })
  expect(dados.tarefaId).toBeTruthy()
  await expect(page.getByRole('link', { name: 'Abrir tarefa criada' })).toHaveAttribute('href', `/tarefas/${dados.tarefaId}`)
  const tarefa = await page.request.get(`/api/tarefa/${dados.tarefaId}`)
  expect(tarefa.ok(), await tarefa.text()).toBe(true)
  const agenda = await page.request.get(`/api/tarefa?de=${diaIso(1)}&ate=${diaIso(1)}`)
  expect(agenda.ok(), await agenda.text()).toBe(true)
  expect((await agenda.json() as { id: string }[]).some((item) => item.id === dados.tarefaId)).toBe(true)
  await page.getByRole('link', { name: 'Abrir tarefa criada' }).click()
  await expect(page).toHaveURL(new RegExp(`/tarefas/${dados.tarefaId}$`))
  await expect(page.getByText('Sem checklist')).toBeVisible()

  const loginLuana = await page.request.post('/api/auth/login', { data: { email: 'luana.freitas@smartmall.local', senha: 'demo123' } })
  expect(loginLuana.ok(), await loginLuana.text()).toBe(true)
  await page.goto(`/tarefas?dia=${diaIso(1)}`)
  await expect(page.locator(`a[href="/tarefas/${dados.tarefaId}"]`).first()).toBeVisible()
  await page.goto(`/tarefas/${dados.tarefaId}`)
  await page.getByRole('button', { name: 'Assumir tarefa' }).click()
  await page.getByRole('alertdialog', { name: 'Assumir esta tarefa?' }).getByRole('button', { name: 'Assumir' }).click()
  await expect(page.getByRole('form', { name: 'Execução da tarefa' })).toBeVisible()
  await page.getByRole('button', { name: 'Enviar para análise' }).click()
  await expect(page.getByText('Registre a resolução do chamado.').first()).toBeVisible()
  await page.getByLabel('Resolução').fill('Pia reparada e vazamento interrompido.')
  await page.getByRole('button', { name: 'Enviar para análise' }).click()
  await expect(page.getByText('Em análise').first()).toBeVisible()

  const loginSupervisor = await page.request.post('/api/auth/login', { data: { email: contas.supervisor.email, senha: 'demo123' } })
  expect(loginSupervisor.ok(), await loginSupervisor.text()).toBe(true)
  await page.goto(`/tarefas/${dados.tarefaId}`)
  await page.getByRole('button', { name: 'Aprovar', exact: true }).click()
  const aprovacaoTarefa = page.waitForResponse((r) => r.url().endsWith(`/api/tarefa/${dados.tarefaId}/aprovar`) && r.request().method() === 'POST')
  await page.getByRole('form', { name: 'Aprovar e concluir?' }).getByRole('button', { name: 'Aprovar' }).click()
  expect((await aprovacaoTarefa).ok()).toBe(true)
  const concluida = await page.request.get(`/api/tarefa/${dados.tarefaId}`)
  expect(concluida.ok(), await concluida.text()).toBe(true)
  expect((await concluida.json() as { tarefa: { status: string } }).tarefa.status).toBe('CONCLUIDA')
})

test('supervisor arquiva relato sem criar tarefa', async ({ page }) => {
  const marca = marcaUnica()
  marcas.push(marca)
  const criado = await criarRelato(page, marca)
  await entrar(page, contas.supervisor)
  await page.goto(`/chamados/${criado.id}`)
  await page.getByLabel('Motivo do arquivamento').fill('Relato duplicado já tratado pela equipe.')
  await page.getByRole('button', { name: 'Revisar arquivamento' }).click()
  const resposta = page.waitForResponse((r) => r.url().endsWith(`/api/chamado/${criado.id}/arquivar`) && r.request().method() === 'POST')
  await page.getByRole('alertdialog', { name: 'Arquivar este chamado?' }).getByRole('button', { name: 'Arquivar' }).click()
  const arquivado = await resposta
  expect(arquivado.ok(), await arquivado.text()).toBe(true)
  expect(await arquivado.json()).toMatchObject({ status: 'ARQUIVADA', tarefaId: null, motivoArquivamento: 'Relato duplicado já tratado pela equipe.' })
  await expect(page.getByRole('heading', { name: 'Motivo do arquivamento' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Abrir tarefa criada' })).toHaveCount(0)
})
