import { UsersRoundIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { BotaoNovo } from '@/components/shared/botao-novo'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { ExcluirDialog } from '@/components/shared/excluir-dialog'
import { BarraFiltros, FiltroSelect, FiltroTexto } from '@/components/shared/filtros'
import { PageHeader } from '@/components/shared/page-header'
import { SemResultado } from '@/components/shared/sem-resultado'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { UsuarioTable } from '@/features/usuarios/components/usuario-table'
import { useExcluirUsuario, useUsuarios } from '@/features/usuarios/hooks'
import type { Usuario } from '@/features/usuarios/types'
import { perfilLabel } from '@/features/auth/types'
import { useFiltrosUrl } from '@/lib/filtros'

const FILTROS = ['nome', 'email', 'perfil', 'ativo'] as const
const PERFIS = (['ADMINISTRADOR', 'SUPERVISOR', 'FUNCIONARIO'] as const).map((valor) => ({ valor, rotulo: perfilLabel[valor] }))
const STATUS = [{ valor: 'true', rotulo: 'Ativos' }, { valor: 'false', rotulo: 'Inativos' }]

export function UsuariosPage() {
  const [params, setParams] = useSearchParams()
  const numero = Number(params.get('pagina') ?? 1)
  const pagina = Number.isSafeInteger(numero) && numero > 0 ? numero - 1 : 0
  const filtros = useFiltrosUrl(FILTROS, ['pagina'])
  const consulta = useUsuarios(pagina, filtros.valores)
  const excluir = useExcluirUsuario()
  const [excluindo, setExcluindo] = useState<Usuario | null>(null)
  const dados = consulta.data

  const mudarPagina = useCallback((proxima: number) => {
    const novos = new URLSearchParams(window.location.search)
    if (proxima === 0) novos.delete('pagina')
    else novos.set('pagina', String(proxima + 1))
    setParams(novos)
  }, [setParams])

  // A última página pode desaparecer depois de uma exclusão.
  useEffect(() => {
    if (dados && pagina > 0 && pagina >= dados.page.totalPages) mudarPagina(Math.max(0, dados.page.totalPages - 1))
  }, [dados, pagina, mudarPagina])

  const novo = <BotaoNovo para="novo">Novo membro</BotaoNovo>

  return (
    <>
      <PageHeader title="Membros e permissões" actions={dados && (dados.page.totalElements > 0 || filtros.ativos > 0) ? novo : undefined} />
      <BarraFiltros ativos={filtros.ativos} onLimpar={() => filtros.limpar()}>
        <FiltroTexto id="filtro-usuario-nome" label="Nome" valor={filtros.valores.nome} onChange={(valor) => filtros.definir('nome', valor)} />
        <FiltroTexto id="filtro-usuario-email" label="E-mail" valor={filtros.valores.email} onChange={(valor) => filtros.definir('email', valor)} />
        <FiltroSelect id="filtro-usuario-perfil" label="Perfil" valor={filtros.valores.perfil} onChange={(valor) => filtros.definir('perfil', valor)} opcoes={PERFIS} />
        <FiltroSelect id="filtro-usuario-ativo" label="Situação" valor={filtros.valores.ativo} onChange={(valor) => filtros.definir('ativo', valor)} opcoes={STATUS} />
      </BarraFiltros>
      {consulta.isPending && <Skeleton className="h-48 w-full" />}
      {consulta.isError && <ErrorState onRetry={() => consulta.refetch()} />}
      {dados?.page.totalElements === 0 && (filtros.ativos > 0 ? <SemResultado onLimpar={() => filtros.limpar()} /> : <EmptyState title="Nenhum membro cadastrado" icon={UsersRoundIcon} action={novo} />)}
      {dados && dados.content.length > 0 && (
        <>
          <UsuarioTable usuarios={dados.content} onExcluir={setExcluindo} />
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground" aria-label="Paginação de membros">
            <span>{dados.page.totalElements} {dados.page.totalElements === 1 ? 'membro' : 'membros'} · Página {dados.page.number + 1} de {dados.page.totalPages}</span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" disabled={pagina === 0} onClick={() => mudarPagina(pagina - 1)}>Anterior</Button>
              <Button type="button" variant="outline" size="sm" disabled={pagina + 1 >= dados.page.totalPages} onClick={() => mudarPagina(pagina + 1)}>Próxima</Button>
            </div>
          </div>
        </>
      )}
      <ExcluirDialog registro={excluindo} titulo="Excluir membro?" mensagemSucesso="Membro excluído." mutacao={excluir} onClose={() => setExcluindo(null)} />
    </>
  )
}
