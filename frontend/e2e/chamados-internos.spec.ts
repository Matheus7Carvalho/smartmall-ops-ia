import { expect, test, type Page } from '@playwright/test'
import { contas, entrar } from './support/auth'
import { escolher } from './support/cadastros'

const ID = 'f1600000-0000-4000-8000-000000000001'
const EQUIPE_ID = 'f1600000-0000-4000-8000-000000000002'
const PROTOCOLO = 'CH-2026-0001'

const relato = {
  id: ID,
  protocolo: PROTOCOLO,
  status: 'EM_ANALISE',
  descricao: 'Vazamento próximo à pia do banheiro norte.',
  localQrCodigo: 'banheiro-norte',
  localQrNome: 'Banheiro norte',
  localInformado: 'Banheiro norte, pia 2',
  contato: 'cliente@example.com',
  tipoSugerido: 'MANUTENCAO',
  prioridadeSugerida: 'MEDIA',
  equipeSugeridaId: EQUIPE_ID,
  tipoConfirmado: null,
  prioridadeConfirmada: null,
  equipeConfirmadaId: null,
  criadoEm: '2026-11-14T10:00:00',
  midia: null,
  tarefaId: null,
  motivoArquivamento: null,
  historico: [],
}

async function simularChamados(page: Page) {
  let atual: Record<string, unknown> = { ...relato }
  let ultimaAprovacao: Record<string, unknown> | null = null
  let ultimoArquivamento: Record<string, unknown> | null = null

  await page.route((url) => url.pathname === '/api/chamado', async (rota) => {
    const status = new URL(rota.request().url()).searchParams.get('status')
    const content = !status || status === atual.status ? [atual] : []
    await rota.fulfill({ json: { content, page: { size: 20, number: 0, totalElements: content.length, totalPages: content.length ? 1 : 0 } } })
  })
  await page.route((url) => url.pathname === `/api/chamado/${ID}`, (rota) => rota.fulfill({ json: atual }))
  await page.route((url) => url.pathname === `/api/chamado/${ID}/aprovar`, async (rota) => {
    ultimaAprovacao = rota.request().postDataJSON()
    atual = { ...atual, status: 'APROVADA', tipoConfirmado: String(ultimaAprovacao?.tipo), prioridadeConfirmada: String(ultimaAprovacao?.prioridade), equipeConfirmadaId: String(ultimaAprovacao?.equipeId), tarefaId: 'f1600000-0000-4000-8000-000000000003' }
    await rota.fulfill({ json: atual })
  })
  await page.route((url) => url.pathname === `/api/chamado/${ID}/arquivar`, async (rota) => {
    ultimoArquivamento = rota.request().postDataJSON()
    atual = { ...atual, status: 'ARQUIVADA', motivoArquivamento: String(ultimoArquivamento?.motivo) }
    await rota.fulfill({ json: atual })
  })
  await page.route((url) => url.pathname === '/api/equipe', (rota) => rota.fulfill({ json: { content: [{ id: EQUIPE_ID, nome: 'Equipe hidráulica', membros: [] }], page: { size: 200, number: 0, totalElements: 1, totalPages: 1 } } }))
  await page.route((url) => url.pathname === '/api/equipamento' || url.pathname === '/api/checklist', (rota) => rota.fulfill({ json: { content: [], page: { size: 200, number: 0, totalElements: 0, totalPages: 0 } } }))
  return { ultimaAprovacao: () => ultimaAprovacao, ultimoArquivamento: () => ultimoArquivamento }
}

test('lista, filtra e abre o relato mantendo a origem', async ({ page }) => {
  await entrar(page, contas.supervisor)
  await simularChamados(page)
  await page.goto('/chamados')
  await expect(page.getByRole('heading', { name: 'Chamados externos' })).toBeVisible()
  const registro = page.locator('tr:visible, article[data-chamado]:visible').filter({ hasText: PROTOCOLO })
  await expect(registro).toContainText('Banheiro norte, pia 2')
  await escolher(page, 'Status', 'Em análise')
  await expect(page).toHaveURL(/status=EM_ANALISE/)
  await registro.getByRole('link', { name: `Abrir chamado ${PROTOCOLO}` }).click()
  await expect(page.getByRole('heading', { name: `Chamado ${PROTOCOLO}` })).toBeVisible()
  await expect(page.getByText(relato.descricao)).toBeVisible()
  await expect(page.getByText('cliente@example.com')).toBeVisible()
  await page.getByRole('link', { name: 'Voltar à fila' }).click()
  await expect(page).toHaveURL(/status=EM_ANALISE/)
})

test('exige classificação humana e cria tarefa após confirmação', async ({ page }) => {
  await entrar(page, contas.supervisor)
  const simulado = await simularChamados(page)
  await page.goto(`/chamados/${ID}`)
  await expect(page.getByText('As sugestões ajudam na triagem')).toBeVisible()
  await page.getByRole('button', { name: 'Revisar aprovação' }).click()
  await expect(page.getByText('Selecione o tipo.')).toBeVisible()
  await escolher(page, 'Tipo', 'Manutenção')
  await escolher(page, 'Prioridade', 'Alta')
  await escolher(page, 'Equipe responsável', 'Equipe hidráulica')
  const futura = new Date(Date.now() + 2 * 60 * 60 * 1000)
  const local = `${futura.getFullYear()}-${String(futura.getMonth() + 1).padStart(2, '0')}-${String(futura.getDate()).padStart(2, '0')}T${String(futura.getHours()).padStart(2, '0')}:${String(futura.getMinutes()).padStart(2, '0')}`
  await page.getByLabel('Data e horário previstos').fill(local)
  await page.getByLabel('Duração (minutos)').fill('45')
  await page.getByRole('button', { name: 'Revisar aprovação' }).click()
  const dialogo = page.getByRole('alertdialog', { name: 'Aprovar este chamado?' })
  await expect(dialogo).toBeVisible()
  expect(simulado.ultimaAprovacao()).toBeNull()
  const resposta = page.waitForResponse((r) => r.url().endsWith(`/api/chamado/${ID}/aprovar`) && r.request().method() === 'POST')
  await dialogo.getByRole('button', { name: 'Aprovar e criar tarefa' }).click()
  expect((await resposta).ok()).toBe(true)
  expect(simulado.ultimaAprovacao()).toMatchObject({ tipo: 'MANUTENCAO', prioridade: 'ALTA', equipeId: EQUIPE_ID, dataHoraPrevista: local, duracaoMinutos: 45 })
  await expect(page.getByRole('link', { name: 'Abrir tarefa criada' })).toBeVisible()
})

test('arquiva com motivo e sem criar tarefa', async ({ page }) => {
  await entrar(page, contas.supervisor)
  const simulado = await simularChamados(page)
  await page.goto(`/chamados/${ID}`)
  const arquivar = page.getByRole('button', { name: 'Revisar arquivamento' })
  await expect(arquivar).toBeDisabled()
  await page.getByLabel('Motivo do arquivamento').fill('Relato duplicado recebido pela equipe.')
  await arquivar.click()
  expect(simulado.ultimoArquivamento()).toBeNull()
  const resposta = page.waitForResponse((r) => r.url().endsWith(`/api/chamado/${ID}/arquivar`) && r.request().method() === 'POST')
  await page.getByRole('alertdialog', { name: 'Arquivar este chamado?' }).getByRole('button', { name: 'Arquivar' }).click()
  expect((await resposta).ok()).toBe(true)
  expect(simulado.ultimoArquivamento()).toEqual({ motivo: 'Relato duplicado recebido pela equipe.' })
  await expect(page.getByText('Relato duplicado recebido pela equipe.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Abrir tarefa criada' })).toHaveCount(0)
})

test('valida data, duração e limite do motivo antes do envio', async ({ page }) => {
  await entrar(page, contas.supervisor)
  const simulado = await simularChamados(page)
  await page.goto(`/chamados/${ID}`)
  await escolher(page, 'Tipo', 'Manutenção')
  await escolher(page, 'Prioridade', 'Alta')
  await escolher(page, 'Equipe responsável', 'Equipe hidráulica')
  await page.getByLabel('Data e horário previstos').fill('2020-01-01T08:00')
  await page.getByLabel('Duração (minutos)').fill('0')
  await page.getByRole('button', { name: 'Revisar aprovação' }).click()
  await expect(page.getByText('Escolha um horário futuro.')).toBeVisible()
  await expect(page.getByText('Mínimo de 1 minuto.')).toBeVisible()
  expect(simulado.ultimaAprovacao()).toBeNull()

  const motivo = page.getByLabel('Motivo do arquivamento')
  await motivo.fill('a'.repeat(501))
  await expect(motivo).toHaveValue('a'.repeat(500))
  await expect(page.getByText('500/500')).toBeVisible()
  expect(simulado.ultimoArquivamento()).toBeNull()
})
