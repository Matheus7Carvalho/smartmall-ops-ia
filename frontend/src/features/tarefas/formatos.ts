import { formatar } from '@/lib/datas'

/** "08:00–09:30" */
export function faixaHorario(dataHora: string, duracaoMinutos: number) {
  const inicio = new Date(dataHora)
  const fim = new Date(inicio.getTime() + duracaoMinutos * 60_000)
  return `${formatar.hora(inicio)}–${formatar.hora(fim)}`
}
