export type LocalPublico = {
  codigo: string
  nome: string
  piso: string
}

export type ChamadoPublicoDados = {
  descricao: string
  codigoLocal: string | null
  localInformado: string
  contato: string | null
  chaveEnvio: string
}

export type ChamadoPublicoCriado = {
  id: string
  protocolo: string
  status: 'REGISTRADA' | 'EM_ANALISE'
}
