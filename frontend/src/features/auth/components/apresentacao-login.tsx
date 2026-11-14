import { useCallback, useState } from 'react'
import { Logo } from '@/components/layout/logo'
import { FraseMarca } from './frase-marca'

/** Círculos concêntricos decorativos no canto do painel. */
function Circulos() {
  return (
    <svg aria-hidden viewBox="0 0 400 400" className="pointer-events-none absolute -right-24 -bottom-24 size-[28rem] text-marca-ciano/25">
      {[190, 150, 110].map((r) => (
        <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="currentColor" strokeWidth="1" />
      ))}
    </svg>
  )
}

/** Painel da marca no login (só em telas largas): logo e frase. */
export function ApresentacaoLogin() {
  // Easter egg: dois cliques no logo soltam o elefante, que derruba as letras da frase.
  const [rodada, setRodada] = useState(0)
  const soltarElefante = () => {
    window.getSelection()?.removeAllRanges()
    setRodada((r) => (r > 0 ? r : Date.now()))
  }
  const fim = useCallback(() => setRodada(0), [])

  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-painel-marca p-12 text-white lg:flex">
      <div onDoubleClick={soltarElefante} className="w-fit select-none">
        <Logo tom="claro" className="max-w-52" />
      </div>
      <FraseMarca rodada={rodada} onFim={fim} />
      {/* Mantém a frase no meio do painel (justify-between). */}
      <span aria-hidden />

      <Circulos />
    </aside>
  )
}
