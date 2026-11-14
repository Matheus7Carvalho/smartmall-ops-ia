/**
 * Datas do backend: LocalDate ("2026-11-16") e LocalDateTime ("2026-11-16T08:00:00"), sem fuso.
 * Tudo é tratado como horário local do shopping; nunca usar toISOString (converte para UTC).
 */

const pad = (n: number) => String(n).padStart(2, '0')

/** Date → "AAAA-MM-DD" no horário local. */
export function paraIsoData(data: Date) {
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`
}

/** "AAAA-MM-DD" → Date local (meia-noite). */
export function deIsoData(iso: string) {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(a, m - 1, d)
}

export function hojeIso() {
  return paraIsoData(new Date())
}

export function somarDias(data: Date, dias: number) {
  const nova = new Date(data)
  nova.setDate(nova.getDate() + dias)
  return nova
}

export function inicioDoMes(data: Date) {
  return new Date(data.getFullYear(), data.getMonth(), 1)
}

export function fimDoMes(data: Date) {
  return new Date(data.getFullYear(), data.getMonth() + 1, 0)
}

export function mesmoDia(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** 6 semanas (42 dias) começando no domingo anterior ao dia 1: grade fixa do calendário. */
export function gradeDoMes(mes: Date) {
  const primeiro = inicioDoMes(mes)
  const inicio = somarDias(primeiro, -primeiro.getDay())
  return Array.from({ length: 42 }, (_, i) => somarDias(inicio, i))
}

const fmtData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' })
const fmtHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const fmtMes = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
const fmtDiaLongo = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
const fmtDiaCurto = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })

export const formatar = {
  data: (valor: string | Date) => fmtData.format(typeof valor === 'string' ? new Date(valor.length === 10 ? `${valor}T00:00:00` : valor) : valor),
  hora: (valor: string | Date) => fmtHora.format(typeof valor === 'string' ? new Date(valor) : valor),
  mes: (valor: Date) => {
    const texto = fmtMes.format(valor)
    return texto.charAt(0).toUpperCase() + texto.slice(1)
  },
  diaLongo: (valor: Date) => fmtDiaLongo.format(valor),
  diaCurto: (valor: string | Date) => fmtDiaCurto.format(typeof valor === 'string' ? new Date(valor) : valor),
}
