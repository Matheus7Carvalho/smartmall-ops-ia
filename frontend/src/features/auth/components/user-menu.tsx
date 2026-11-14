import { LogOutIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSair, useSessao } from '../hooks'
import { perfilLabel } from '../types'
import { ConfirmarSaidaDialog } from './confirmar-saida-dialog'

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase()
}

export function UserMenu() {
  const { data: usuario } = useSessao()
  const sair = useSair()
  const navigate = useNavigate()
  const [confirmando, setConfirmando] = useState(false)

  if (!usuario) return null

  const encerrar = () => sair.mutate(undefined, { onSettled: () => navigate('/login', { replace: true }) })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto gap-2 px-2 py-1">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">{iniciais(usuario.nome)}</AvatarFallback>
            </Avatar>
            <span className="hidden text-left leading-tight sm:grid">
              <span className="text-sm font-medium">{usuario.nome}</span>
              <span className="text-xs text-muted-foreground">{perfilLabel[usuario.perfil]}</span>
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="grid font-normal">
            <span className="font-medium">{usuario.nome}</span>
            <span className="truncate text-xs text-muted-foreground">{usuario.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setConfirmando(true)} disabled={sair.isPending}>
            <LogOutIcon aria-hidden />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmarSaidaDialog open={confirmando} onOpenChange={setConfirmando} onConfirm={encerrar} />
    </>
  )
}
