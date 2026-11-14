import type { ReactNode } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router'
import { AppShell } from '@/components/layout/app-shell'
import { RequireAuth } from '@/features/auth/components/require-auth'
import { RequirePerfil } from '@/features/auth/components/require-perfil'
import { EmAnalisePage } from '@/pages/em-analise-page'
import { TarefaPage } from '@/pages/tarefa-page'
import { TarefasPage } from '@/pages/tarefas-page'
import { CentralPage } from '@/pages/central-page'
import { ChecklistFormPage } from '@/pages/checklist-form-page'
import { ChecklistsPage } from '@/pages/checklists-page'
import { ChamadoPage } from '@/pages/chamado-page'
import { ChamadosPage } from '@/pages/chamados-page'
import { EquipamentoFormPage } from '@/pages/equipamento-form-page'
import { EquipamentosPage } from '@/pages/equipamentos-page'
import { EquipeFormPage } from '@/pages/equipe-form-page'
import { EquipesPage } from '@/pages/equipes-page'
import { HomeRedirect } from '@/pages/home-redirect'
import { LoginPage } from '@/pages/login-page'
import { RelatarPage } from '@/pages/relatar-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { ManutencaoProgramadaFormPage } from '@/pages/manutencao-programada-form-page'
import { ManutencoesProgramadasPage } from '@/pages/manutencoes-programadas-page'
import { UsuarioFormPage } from '@/pages/usuario-form-page'
import { UsuariosPage } from '@/pages/usuarios-page'
import { RelatoriosPage } from '@/pages/relatorios-page'
import { EstoquePage } from '@/pages/estoque-page'
import { ItemEstoqueFormPage } from '@/pages/item-estoque-form-page'

/** Aplica os perfis do item de menu correspondente à rota. */
function protegida(rota: string, pagina: ReactNode) {
  return <RequirePerfil rota={rota}>{pagina}</RequirePerfil>
}

/** Listagem + cadastro novo + edição, todos com os perfis do item de menu. */
function cadastro(rota: string, lista: ReactNode, formulario: ReactNode, novo = 'novo'): RouteObject {
  return {
    path: rota.slice(1),
    children: [
      { index: true, element: protegida(rota, lista) },
      { path: novo, element: protegida(rota, formulario) },
      { path: ':id', element: protegida(rota, formulario) },
    ],
  }
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/relatar', element: <RelatarPage /> },
  {
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <HomeRedirect /> },
      { path: 'central', element: protegida('/central', <CentralPage />) },
      {
        path: 'chamados',
        children: [
          { index: true, element: protegida('/chamados', <ChamadosPage />) },
          { path: ':id', element: protegida('/chamados', <ChamadoPage />) },
        ],
      },
      {
        path: 'tarefas',
        children: [
          { index: true, element: protegida('/tarefas', <TarefasPage />) },
          { path: ':id', element: protegida('/tarefas', <TarefaPage />) },
        ],
      },
      { path: 'analise', element: protegida('/analise', <EmAnalisePage />) },
      cadastro('/estoque', <EstoquePage />, <ItemEstoqueFormPage />),
      cadastro('/planejamento/manutencoes-programadas', <ManutencoesProgramadasPage />, <ManutencaoProgramadaFormPage />, 'nova'),
      cadastro('/planejamento/modelos-checklist', <ChecklistsPage />, <ChecklistFormPage />),
      cadastro('/cadastros/equipamentos', <EquipamentosPage />, <EquipamentoFormPage />),
      cadastro('/cadastros/equipes', <EquipesPage />, <EquipeFormPage />, 'nova'),
      cadastro('/cadastros/usuarios', <UsuariosPage />, <UsuarioFormPage />),
      { path: 'relatorios', element: protegida('/relatorios', <RelatoriosPage />) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
