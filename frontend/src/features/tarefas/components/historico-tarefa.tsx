import { formatar } from '@/lib/datas'
import { acaoLabel, type TarefaDetalhe } from '../types'
import { Miniaturas } from './miniaturas'

/** RNF06: cada mudança de status, com quem, quando, observação/motivo e as imagens de cada envio. */
export function HistoricoTarefa({ detalhe }: { detalhe: TarefaDetalhe }) {
  const { tarefa, historico, evidencias } = detalhe
  return (
    <section aria-labelledby="historico-titulo" className="grid gap-3">
      <h2 id="historico-titulo" className="text-lg font-semibold">
        Histórico
      </h2>
      {historico.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem registros.</p>
      ) : (
        <ol className="grid gap-4 border-l pl-4">
          {[...historico].reverse().map((h) => (
            <li key={h.id} className="relative grid gap-1.5">
              <span className="absolute top-1.5 -left-[1.3rem] size-2.5 rounded-full border-2 border-background bg-primary" aria-hidden />
              <p className="text-sm">
                <span className="font-medium">
                  {acaoLabel[h.acao]}
                  {h.acao === 'ENVIADA' && h.envio && h.envio > 1 ? ` (${h.envio}º envio)` : ''}
                </span>
                <span className="text-muted-foreground">
                  {' '}
                  · {h.usuario.nome} · <time dateTime={h.dataHora}>{`${formatar.data(h.dataHora)} ${formatar.hora(h.dataHora)}`}</time>
                </span>
              </p>
              {h.observacao && (
                <p className="text-sm whitespace-pre-line">
                  <span className="text-muted-foreground">{h.acao === 'REPROVADA' ? 'Motivo: ' : 'Observação: '}</span>
                  {h.observacao}
                </p>
              )}
              {h.acao === 'ENVIADA' && (
                <Miniaturas tarefaId={tarefa.id} evidencias={evidencias.filter((e) => e.envio === h.envio)} />
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
