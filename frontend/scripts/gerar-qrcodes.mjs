import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import QRCode from 'qrcode'

const locais = [
  { codigo: 'banheiro-norte', nome: 'Banheiro Norte' },
  { codigo: 'praca-alimentacao', nome: 'Praça de Alimentação' },
  { codigo: 'entrada', nome: 'Entrada Principal' },
]

function argumento(nome) {
  const indice = process.argv.indexOf(nome)
  return indice < 0 ? null : process.argv[indice + 1]
}

const baseInformada = argumento('--base-url')
if (!baseInformada) {
  console.error('Uso: npm run qr:gerar -- --base-url https://seu-dominio.com [--output ../docs/qrcodes]')
  process.exit(1)
}

let base
try {
  base = new URL(baseInformada)
} catch {
  console.error('Informe uma URL base válida com http:// ou https://.')
  process.exit(1)
}

if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password ||
    base.pathname !== '/' || base.search || base.hash ||
    ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname.toLowerCase())) {
  console.error('Use o domínio ou IP acessível ao celular, sem caminho, parâmetros, credenciais ou localhost.')
  process.exit(1)
}

const output = resolve(argumento('--output') ?? '../docs/qrcodes')
const opcoes = { errorCorrectionLevel: 'H', margin: 4, width: 1024,
  color: { dark: '#071936FF', light: '#FFFFFFFF' } }
await mkdir(output, { recursive: true })

const manifesto = []
for (const local of locais) {
  const url = new URL('/relatar', base)
  url.searchParams.set('local', local.codigo)
  const destino = url.toString()
  await Promise.all([
    QRCode.toFile(resolve(output, `${local.codigo}.png`), destino, { ...opcoes, type: 'png' }),
    QRCode.toFile(resolve(output, `${local.codigo}.svg`), destino, { ...opcoes, type: 'svg' }),
  ])
  manifesto.push({ ...local, url: destino })
  console.log(`${local.nome}: ${destino}`)
}

await writeFile(resolve(output, 'enderecos.json'), JSON.stringify(manifesto, null, 2) + '\n', 'utf8')
console.log(`Arquivos gerados em ${output}`)
