import { useEffect, useState } from 'react'

/** "Agora" estável durante a renderização, atualizado a cada minuto (atrasada, futuras, hoje). */
export function useAgora(intervaloMs = 60_000) {
  const [agora, setAgora] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setAgora(new Date()), intervaloMs)
    return () => clearInterval(timer)
  }, [intervaloMs])
  return agora
}
