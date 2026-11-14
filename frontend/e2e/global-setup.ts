import type { FullConfig } from '@playwright/test'

/**
 * Verificação de saúde antes da suíte E2E (ver docs/testes-instaveis.md, casos 3 e 4).
 * Confere, pela mesma URL que os testes usam:
 *  1. o frontend responde;
 *  2. o backend responde pelo proxy /api com a segurança da aplicação (401 em JSON, não o 401 vazio padrão do Spring);
 *  3. o login da seed funciona.
 * Tenta por até 60 s (cobre reinício de container ou do devtools). Se não ficar pronto, falha
 * logo, com uma mensagem clara, em vez de produzir dezenas de falhas enganosas.
 */
const PRAZO_MS = Number(process.env.E2E_SAUDE_PRAZO_MS ?? 60_000)
const INTERVALO_MS = 2_000

type Verificacao = { nome: string; executar: (base: string) => Promise<string | null> }

const verificacoes: Verificacao[] = [
  {
    nome: 'Frontend',
    executar: async (base) => {
      const r = await fetch(`${base}/login`)
      return r.ok ? null : `GET /login respondeu ${r.status}`
    },
  },
  {
    nome: 'Backend e segurança',
    executar: async (base) => {
      const r = await fetch(`${base}/api/auth/sessao`)
      const corpo = await r.text()
      if (r.status !== 401) return `GET /api/auth/sessao respondeu ${r.status} (esperado 401)`
      if (!corpo.includes('Sessão expirada')) {
        return 'GET /api/auth/sessao respondeu 401 sem o JSON da aplicação: o backend subiu sem a SecurityConfiguration (recarga do devtools no meio de uma compilação?)'
      }
      return null
    },
  },
  {
    nome: 'Login da seed',
    executar: async (base) => {
      const r = await fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'supervisor@smartmall.local', senha: 'demo123' }),
      })
      return r.ok ? null : `Login com supervisor@smartmall.local respondeu ${r.status} (seed de dev aplicada?)`
    },
  },
]

async function primeiraFalha(base: string): Promise<string | null> {
  for (const v of verificacoes) {
    try {
      const erro = await v.executar(base)
      if (erro) return `${v.nome}: ${erro}`
    } catch (e) {
      return `${v.nome}: sem resposta (${(e as Error).message})`
    }
  }
  return null
}

export default async function globalSetup(config: FullConfig) {
  const base = config.projects[0]?.use.baseURL ?? 'http://localhost:5173'
  const inicio = Date.now()
  let falha = await primeiraFalha(base)

  while (falha && Date.now() - inicio < PRAZO_MS) {
    await new Promise((resolve) => setTimeout(resolve, INTERVALO_MS))
    falha = await primeiraFalha(base)
  }

  if (falha) {
    throw new Error(
      `Ambiente E2E indisponível em ${base} após ${PRAZO_MS / 1000}s.\n${falha}\n` +
        'Suba o backend (docker compose --profile app up ou ./mvnw spring-boot:run) e rode de novo.',
    )
  }
}
