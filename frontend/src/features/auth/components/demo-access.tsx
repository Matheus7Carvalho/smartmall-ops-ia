import { Button } from '@/components/ui/button'
import { perfilLabel, type Perfil } from '../types'

/** Contas da seed de desenvolvimento (backend/src/main/resources/db/changes/usuario). */
const contas: { perfil: Perfil; email: string }[] = [
  { perfil: 'ADMINISTRADOR', email: 'admin@smartmall.local' },
  { perfil: 'SUPERVISOR', email: 'supervisor@smartmall.local' },
  { perfil: 'FUNCIONARIO', email: 'funcionario@smartmall.local' },
]
const SENHA_DEMO = 'demo123'

type DemoAccessProps = {
  disabled?: boolean
  onSelect: (email: string, senha: string) => void
}

export function DemoAccess({ disabled, onSelect }: DemoAccessProps) {
  return (
    <section aria-labelledby="demo-titulo" className="grid gap-3 border-t pt-5">
      <h2 id="demo-titulo" className="text-sm font-semibold">
        Perfis de demonstração
      </h2>
      <div className="flex flex-wrap gap-2">
        {contas.map((conta) => (
          <Button
            key={conta.perfil}
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full border-primary/20 bg-accent px-3 font-medium text-primary hover:bg-primary/10"
            disabled={disabled}
            onClick={() => onSelect(conta.email, SENHA_DEMO)}
          >
            {perfilLabel[conta.perfil]}
          </Button>
        ))}
      </div>
    </section>
  )
}
