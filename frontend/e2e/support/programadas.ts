import { expect, type Page } from '@playwright/test'
import { excluirViaApi, SEED, sufixoUnico } from './cadastros'

export const LISTA_PROGRAMADAS = '/planejamento/manutencoes-programadas'

const pad = (n: number) => String(n).padStart(2, '0')

/** Data local "AAAA-MM-DD" daqui a N dias (nunca toISOString: converte para UTC). */
export function diaIso(dias: number) {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Horário pouco provável de colidir com outro teste em paralelo (10:00–17:59). */
export function horarioUnico() {
  return `${pad(10 + Math.floor(Math.random() * 8))}:${pad(Math.floor(Math.random() * 60))}`
}

/** Marca nas observações para achar e apagar os planos criados pelo teste. */
export function marcaUnica() {
  return `E2E-${sufixoUnico(8)}`
}

type NovoPlano = { marca: string; frequencia?: string; intervalo?: number; dataInicio?: string; horario?: string; duracaoMinutos?: number }

/** Cria um plano pela API (Bomba hidráulica B01 / Hidráulica). Retorna o id. */
export async function criarProgramadaViaApi(page: Page, plano: NovoPlano) {
  const resposta = await page.request.post('/api/manutencao-programada', {
    data: {
      equipamentoId: SEED.equipamentoBombaB01,
      checklistId: SEED.checklistElevador,
      equipeId: SEED.equipeHidraulica,
      frequencia: plano.frequencia ?? 'DIARIA',
      intervalo: plano.intervalo ?? 1,
      dataInicio: plano.dataInicio ?? diaIso(1),
      horario: plano.horario ?? horarioUnico(),
      duracaoMinutos: plano.duracaoMinutos ?? 30,
      observacoes: plano.marca,
    },
  })
  expect(resposta.ok(), await resposta.text()).toBe(true)
  return ((await resposta.json()) as { id: string }).id
}

export async function excluirProgramadasMarcadas(page: Page, marcas: string[]) {
  if (!marcas.length) return
  await excluirViaApi<{ id: string; observacoes: string | null }>(page, 'manutencao-programada', (p) =>
    marcas.some((m) => p.observacoes?.includes(m)),
  )
}

/** Linha da listagem de planos pelo id (o link de edição termina com o id). */
export function linhaDaProgramada(page: Page, id: string) {
  return page.locator(`tr:has(a[href$="/${id}"])`)
}
