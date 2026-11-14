const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

/** Datas do backend chegam como LocalDateTime sem fuso; são tratadas como horário local. */
export function formatarDataHora(valor: string | null | undefined) {
  return valor ? dataHora.format(new Date(valor)) : '—'
}
