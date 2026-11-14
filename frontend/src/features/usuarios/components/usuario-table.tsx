import { PencilIcon, Trash2Icon } from 'lucide-react'
import { Link } from 'react-router'
import { LinhaClicavel } from '@/components/shared/linha-clicavel'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { perfilLabel } from '@/features/auth/types'
import { useOrigemAtual } from '@/lib/navegacao'
import type { Usuario } from '../types'

type Props = { usuarios: Usuario[]; onExcluir: (usuario: Usuario) => void }

export function UsuarioTable({ usuarios, onExcluir }: Props) {
  const origem = useOrigemAtual()
  return (
    <>
      <div className="grid gap-3 sm:hidden">
        {usuarios.map((usuario) => (
          <article
            key={usuario.id}
            data-usuario={usuario.id}
            aria-label={`Membro ${usuario.nome}`}
            className="relative rounded-lg border p-4 hover:bg-muted/50 has-[a[data-abrir]:focus-visible]:ring-2 has-[a[data-abrir]:focus-visible]:ring-ring"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Nome</p>
                <Link
                  to={usuario.id}
                  state={origem}
                  data-abrir
                  className="break-words font-medium after:absolute after:inset-0 after:content-['']"
                  aria-label={`Abrir ${usuario.nome}`}
                >
                  {usuario.nome}
                </Link>
              </div>
              <div className="relative z-10 flex shrink-0 gap-1">
                <Button asChild variant="ghost" size="icon-sm">
                  <Link to={usuario.id} state={origem} aria-label={`Editar ${usuario.nome}`}><PencilIcon aria-hidden /></Link>
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label={`Excluir ${usuario.nome}`} onClick={() => onExcluir(usuario)}><Trash2Icon aria-hidden /></Button>
              </div>
            </div>
            <div className="mt-3 grid gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="break-all">{usuario.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Perfil</p>
                <p>{perfilLabel[usuario.perfil]}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Status</p>
                <StatusBadge tom={usuario.ativo ? 'sucesso' : 'neutro'}>{usuario.ativo ? 'Ativo' : 'Inativo'}</StatusBadge>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="hidden rounded-lg border sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24"><span className="sr-only">Ações</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((usuario) => (
              <LinhaClicavel key={usuario.id} para={usuario.id}>
                <TableCell className="font-medium whitespace-normal">{usuario.nome}</TableCell>
                <TableCell className="whitespace-normal">{usuario.email}</TableCell>
                <TableCell>{perfilLabel[usuario.perfil]}</TableCell>
                <TableCell><StatusBadge tom={usuario.ativo ? 'sucesso' : 'neutro'}>{usuario.ativo ? 'Ativo' : 'Inativo'}</StatusBadge></TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link to={usuario.id} state={origem} aria-label={`Editar ${usuario.nome}`}><PencilIcon aria-hidden /></Link>
                    </Button>
                    <Button variant="ghost" size="icon-sm" aria-label={`Excluir ${usuario.nome}`} onClick={() => onExcluir(usuario)}><Trash2Icon aria-hidden /></Button>
                  </div>
                </TableCell>
              </LinhaClicavel>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
