/** Tons de situação: as mesmas cores em selos, marcadores do calendário e legendas. */
export type Tom = 'neutro' | 'info' | 'andamento' | 'sucesso' | 'atencao' | 'perigo'

/** Selo de situação (StatusBadge). */
export const seloDoTom: Record<Tom, string> = {
  neutro: 'border-border bg-muted text-muted-foreground',
  info: 'border-primary/30 bg-primary/10 text-primary',
  andamento: 'border-andamento/30 bg-andamento/10 text-andamento',
  sucesso: 'border-success/30 bg-success/10 text-success',
  atencao: 'border-warning/40 bg-warning/15 text-foreground',
  perigo: 'border-destructive/30 bg-destructive/10 text-destructive',
}

/**
 * Marcador compacto (ex.: rótulo no calendário) no mesmo tom do StatusBadge.
 * A faixa lateral mantém o tom visível mesmo sobre fundo colorido (dia selecionado).
 */
export const marcadorDoTom: Record<Tom, string> = {
  neutro: 'border-l-muted-foreground/50 bg-muted text-muted-foreground',
  info: 'border-l-primary bg-primary/10 text-primary',
  andamento: 'border-l-andamento bg-andamento/10 text-andamento',
  sucesso: 'border-l-success bg-success/10 text-success',
  atencao: 'border-l-warning bg-warning/20 text-foreground',
  perigo: 'border-l-destructive bg-destructive/10 text-destructive',
}

/** Cor sólida do tom (pontos e amostras de legenda). */
export const pontoDoTom: Record<Tom, string> = {
  neutro: 'bg-muted-foreground/60',
  info: 'bg-primary',
  andamento: 'bg-andamento',
  sucesso: 'bg-success',
  atencao: 'bg-warning',
  perigo: 'bg-destructive',
}
