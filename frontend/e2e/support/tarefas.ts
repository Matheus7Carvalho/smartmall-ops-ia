import { expect, request, type APIRequestContext } from '@playwright/test'
import { contas, SENHA_DEMO, type Conta } from './auth'
import { SEED } from './cadastros'
import { diaIso, marcaUnica } from './programadas'

/** PNG 1×1 válido: o backend identifica o formato pelo conteúdo. */
export const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
)

export const imagem = (nome = 'painel.png') => ({ name: nome, mimeType: 'image/png', buffer: PNG_1X1 })

/** Sessão de API de um perfil, independente da página (ex.: preparar dados com outro usuário). */
export async function apiComo(baseURL: string, conta: Conta) {
  const api = await request.newContext({ baseURL })
  const login = await api.post('/api/auth/login', { data: { email: conta.email, senha: SENHA_DEMO } })
  expect(login.ok(), await login.text()).toBe(true)
  return api
}

export type TarefaCriada = { tarefaId: string; programadaId: string; marca: string; dia: string; titulo: string }

/**
 * Manutenção programada única só para o teste: Bomba B01, modelo "Elevador — inspeção preventiva" e
 * equipe "Elevadores e escadas" (João Costa, o Funcionário da seed, é membro). Data distante, para não
 * poluir as semanas que aparecem na demonstração.
 */
export async function criarTarefaDoJoao(admin: APIRequestContext): Promise<TarefaCriada> {
  const dia = diaIso(100 + Math.floor(Math.random() * 15))
  const marca = marcaUnica()
  const programada = await admin.post('/api/manutencao-programada', {
    data: {
      equipamentoId: SEED.equipamentoBombaB01,
      checklistId: SEED.checklistElevador,
      equipeId: SEED.equipeElevadores,
      frequencia: 'UNICA',
      intervalo: 1,
      dataInicio: dia,
      horario: '09:00',
      duracaoMinutos: 60,
      observacoes: marca,
    },
  })
  expect(programada.ok(), await programada.text()).toBe(true)
  const programadaId = ((await programada.json()) as { id: string }).id
  const tarefas = (await (await admin.get(`/api/tarefa?de=${dia}&ate=${dia}&manutencaoProgramadaId=${programadaId}`)).json()) as {
    id: string
  }[]
  expect(tarefas).toHaveLength(1)
  return { tarefaId: tarefas[0].id, programadaId, marca, dia, titulo: 'BOM-B01 · Bomba hidráulica B01' }
}

/**
 * Apaga a manutenção programada do teste com todas as tarefas, inclusive executadas, pelo endpoint de
 * limpeza (só no perfil dev). Fora do dev (404), a exclusão normal; se houver tarefa executada, ela é encerrada.
 */
export async function descartarProgramada(admin: APIRequestContext, { programadaId, marca }: Pick<TarefaCriada, 'programadaId' | 'marca'>) {
  const limpeza = await admin.delete(`/api/teste/e2e?marca=${marca}`)
  if (limpeza.ok()) return
  expect(limpeza.status(), await limpeza.text()).toBe(404)
  const exclusao = await admin.delete(`/api/manutencao-programada/${programadaId}`)
  if (!exclusao.ok()) await admin.post(`/api/manutencao-programada/${programadaId}/encerrar`)
}

type Item = { id: string; tipoResposta: string }

/** Responde todos os itens do checklist com valores válidos. */
export function respostasValidas(itens: Item[]) {
  return itens.map((i) => ({ itemId: i.id, resposta: i.tipoResposta === 'SIM_NAO' ? 'SIM' : i.tipoResposta === 'NUMERO' ? '2' : 'ok' }))
}

/** Pela API, como João: assume, anexa uma imagem e envia para análise com uma observação. */
export async function enviarParaAnaliseViaApi(joao: APIRequestContext, tarefaId: string, observacao = 'Executada conforme o modelo') {
  const assumida = await joao.post(`/api/tarefa/${tarefaId}/assumir`)
  expect(assumida.ok(), await assumida.text()).toBe(true)
  const { itens } = (await assumida.json()) as { itens: Item[] }
  const anexo = await joao.post(`/api/tarefa/${tarefaId}/evidencia`, { multipart: { arquivo: imagem() } })
  expect(anexo.ok(), await anexo.text()).toBe(true)
  const envio = await joao.post(`/api/tarefa/${tarefaId}/enviar`, { data: { observacao, respostas: respostasValidas(itens) } })
  expect(envio.ok(), await envio.text()).toBe(true)
}

export { contas }
