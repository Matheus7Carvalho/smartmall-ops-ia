import { formatar } from '@/lib/datas'
import type { Frequencia } from './types'

type Regra = {
  frequencia: Frequencia
  intervalo: number
  dataInicio: string
  horario: string
  dataFim?: string | null
}

const diasDaSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']

/**
 * Frase curta da regra, igual à usada pelo backend (Recorrencia.java). Ex.: "A cada 2 semanas, segunda-feira, às 08:00".
 * `comVigencia: false` omite o período (quando ele aparece em coluna própria, como na listagem).
 */
export function descreverRecorrencia({ frequencia, intervalo, dataInicio, horario, dataFim }: Regra, { comVigencia = true } = {}) {
  if (!dataInicio || !horario) return ''
  const inicio = new Date(`${dataInicio}T00:00:00`)
  const n = Number(intervalo) || 1
  const hora = `às ${horario}`

  let texto: string
  switch (frequencia) {
    case 'UNICA':
      return comVigencia ? `Única, em ${formatar.data(dataInicio)} ${hora}` : `Única, ${hora}`
    case 'DIARIA':
      texto = n === 1 ? `Diária, ${hora}` : `A cada ${n} dias, ${hora}`
      break
    case 'SEMANAL': {
      const dia = diasDaSemana[inicio.getDay()]
      texto = n === 1 ? `Semanal, toda ${dia}, ${hora}` : `A cada ${n} semanas, ${dia}, ${hora}`
      break
    }
    case 'MENSAL': {
      const dia = inicio.getDate()
      const fimDoMes = dia > 28 ? ' (ou último dia do mês)' : ''
      texto = n === 1 ? `Mensal, todo dia ${dia}${fimDoMes}, ${hora}` : `A cada ${n} meses, dia ${dia}${fimDoMes}, ${hora}`
      break
    }
  }
  return comVigencia ? `${texto}, ${descreverVigencia({ frequencia, dataInicio, dataFim }).toLowerCase()}` : texto
}

/** Período em que a manutenção programada gera tarefas: "16/11/2026 a 31/12/2026", "A partir de 16/11/2026" ou a data, se única. */
export function descreverVigencia({ frequencia, dataInicio, dataFim }: Pick<Regra, 'frequencia' | 'dataInicio' | 'dataFim'>) {
  if (frequencia === 'UNICA') return formatar.data(dataInicio)
  return dataFim ? `${formatar.data(dataInicio)} a ${formatar.data(dataFim)}` : `A partir de ${formatar.data(dataInicio)}`
}

