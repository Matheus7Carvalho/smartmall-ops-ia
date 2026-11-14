import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import elefante from '@/assets/elefante.gif'
import { cn } from '@/lib/utils'

/** Tempo para o elefante atravessar o painel (a queda de cada letra acompanha a passagem). */
const TRAVESSIA_MS = 4000
/** Depois da travessia, quanto tempo as letras ficam "no chão" antes de voltar. */
const PAUSA_MS = 1800
/** 2,5x o tamanho original do primeiro easter egg (140 px). */
const LARGURA_ELEFANTE = 350
/** Proporção do GIF (329 × 312). */
const ALTURA_ELEFANTE = Math.round((LARGURA_ELEFANTE * 312) / 329)

// "Boas-vindas" vale para qualquer pessoa, sem supor gênero ("bem-vindo/bem-vinda").
const TITULO = 'Boas-vindas ao'
const DESTAQUE = 'SmartMall Ops IA'
const SUBTITULO = 'Acompanhe chamados, tarefas, equipes e estoque do Capim Dourado Shopping.'

/** Texto quebrado em letras (aria-hidden); a frase inteira fica para leitores de tela em `sr-only`. */
function Letras({ texto }: { texto: string }) {
  const palavras = texto.split(' ')
  return (
    <span aria-hidden>
      {palavras.map((palavra, i) => (
        <span key={i}>
          <span className="inline-block whitespace-nowrap">
            {[...palavra].map((letra, j) => (
              <span key={j} data-letra className="letra-marca inline-block">
                {letra}
              </span>
            ))}
          </span>
          {i < palavras.length - 1 && ' '}
        </span>
      ))}
    </span>
  )
}

/**
 * Frase da marca no login. Easter egg: `rodada` > 0 faz o elefante atravessar o painel por cima do texto,
 * derrubando as letras, e sumir na borda com a parte branca (o painel corta o que passa dela); as letras
 * voltam logo depois. Com "reduzir movimento" ativo, as letras não caem (ver index.css).
 */
export function FraseMarca({ rodada, onFim }: { rodada: number; onFim: () => void }) {
  const bloco = useRef<HTMLDivElement>(null)
  const [voltando, setVoltando] = useState(false)
  const ativo = rodada > 0

  // O elefante entra pela esquerda do painel e anda até sumir por inteiro na borda direita.
  // Cada letra cai quando a tromba (frente) chega nela: a frente vai de 0 ao percurso durante a travessia.
  useLayoutEffect(() => {
    const el = bloco.current
    const painel = el?.offsetParent as HTMLElement | null
    if (!ativo || !el || !painel) return
    const percurso = painel.clientWidth + LARGURA_ELEFANTE
    el.querySelectorAll<HTMLElement>('[data-letra]').forEach((letra) => {
      // Letras e elefante medidos no mesmo referencial: o painel (bloco sem position).
      const x = letra.offsetLeft + letra.offsetWidth / 2
      letra.style.setProperty('--atraso', `${Math.round((x / percurso) * TRAVESSIA_MS)}ms`)
      letra.style.setProperty('--giro', `${Math.round((Math.random() - 0.5) * 220)}deg`)
      letra.style.setProperty('--deriva', `${Math.round((Math.random() - 0.3) * 60)}px`)
    })
    el.style.setProperty('--travessia', `${TRAVESSIA_MS}ms`)
    el.style.setProperty('--percurso', `${percurso}px`)
    el.style.setProperty('--largura-elefante', `${LARGURA_ELEFANTE}px`)
    // Pés um pouco abaixo do fim do texto: o corpo passa por cima da frase.
    el.style.setProperty('--topo-elefante', `${el.offsetTop + el.offsetHeight - ALTURA_ELEFANTE + 56}px`)
  }, [ativo, rodada])

  useEffect(() => {
    if (!ativo) return
    const fim = setTimeout(() => {
      setVoltando(true)
      onFim()
    }, TRAVESSIA_MS + PAUSA_MS)
    return () => clearTimeout(fim)
  }, [ativo, rodada, onFim])

  useEffect(() => {
    if (!voltando) return
    const t = setTimeout(() => setVoltando(false), 800)
    return () => clearTimeout(t)
  }, [voltando])

  return (
    <div ref={bloco} data-derrubando={ativo || undefined} className={cn('grid max-w-xl gap-5', voltando && 'animate-in duration-700 fade-in')}>
      <p className="text-5xl leading-[1.05] font-bold tracking-tight">
        <span className="sr-only">
          {TITULO} {DESTAQUE}
        </span>
        <Letras texto={TITULO} />{' '}
        <span className="text-marca-ciano">
          <Letras texto={DESTAQUE} />
        </span>
      </p>
      <p className="max-w-md text-base text-white/85">
        <span className="sr-only">{SUBTITULO}</span>
        <Letras texto={SUBTITULO} />
      </p>
      {ativo && (
        <img
          key={rodada}
          src={elefante}
          alt="Elefante"
          width={LARGURA_ELEFANTE}
          // Posicionado no painel (o bloco não tem position), na altura da frase e na frente das letras.
          className="elefante-marca pointer-events-none absolute left-0 z-10 drop-shadow-2xl"
          style={{ width: LARGURA_ELEFANTE, top: 'var(--topo-elefante)' }}
        />
      )}
    </div>
  )
}
