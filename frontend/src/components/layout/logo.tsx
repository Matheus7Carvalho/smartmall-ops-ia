import logoCompleto from '@/assets/logo-smartmall.webp'
import logoClaro from '@/assets/logo-smartmall-claro.webp'
import logoIcone from '@/assets/logo-icone.png'
import logoIconeClaro from '@/assets/logo-icone-claro.png'
import { cn } from '@/lib/utils'

const NOME = 'SmartMall Ops IA'

type LogoProps = {
  /** "claro": versão para fundo escuro (navy vira branco). */
  tom?: 'padrao' | 'claro'
  className?: string
}

export function Logo({ tom = 'padrao', className }: LogoProps) {
  return (
    <img
      src={tom === 'claro' ? logoClaro : logoCompleto}
      alt={NOME}
      width={900}
      height={272}
      className={cn('h-auto w-full max-w-60 object-contain', className)}
    />
  )
}

/** Só o prédio com os nós: menu recolhido e espaços pequenos. */
export function LogoIcone({ tom = 'padrao', className }: LogoProps) {
  return (
    <img
      src={tom === 'claro' ? logoIconeClaro : logoIcone}
      alt={NOME}
      width={128}
      height={128}
      className={cn('size-8 rounded-md object-contain', className)}
    />
  )
}
