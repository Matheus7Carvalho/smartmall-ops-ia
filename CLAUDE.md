# SmartMall Ops AI

MVP de gestão operacional para shopping centers (cenário: Capim Dourado Shopping), feito para hackathon. Fluxo central: ocorrência → triagem sugerida → revisão humana → tarefa → Central de Controle → encerramento. Inclui manutenção preventiva de equipamentos.

Referências obrigatórias antes de implementar qualquer funcionalidade:

- `docs/modulo-manutencao.md` — passo a passo e regras do módulo de manutenção.
- `docs/SmartMall_Ops_AI_Documentacao_Inicial.md` — requisitos (RF/RNF), telas, modelo de dados e critérios de aceite.
- `INSTRUCTIONS.md` e `docs/dist/` — protótipo HTML5/JS existente. Serve de referência de fluxo e identidade visual, não de código a ser copiado.

## Glossário do domínio (usar estes nomes em tela, código, API e banco)

```
Chamado ──► Plano de ação (1..n tarefas) ──┐
                                            ├──► Tarefa ──► execução (checklist) ──► validação
Manutenção programada (recorrência) ────────┘
```

| Termo | O que é | No código | Situação |
|---|---|---|---|
| **Tarefa** | Unidade de trabalho com data, equipe, equipamento, status e, no futuro, prazo (SLA). É onde os dois fluxos chegam. | `Tarefa`, `/api/tarefa`, tela `/tarefas` | Implementado (gerada por manutenção programada) |
| **Responsável** | Membro da equipe que assumiu a tarefa. Continua o mesmo depois de uma reprovação | `Tarefa.responsavel`, `POST /api/tarefa/{id}/assumir` | Implementado |
| **Execução** | Checklist preenchido (cópia do modelo feita ao assumir), observação e evidências (imagens) | `TarefaItem`, `TarefaEvidencia`, tela `/tarefas/{id}` | Implementado |
| **Em análise** | Fila de validação: o Supervisor aprova (conclui) ou reprova (volta para execução) | `/api/tarefa/em-analise`, tela `/analise` | Implementado |
| **Origem da tarefa** | De onde a tarefa veio | `OrigemTarefa`: `MANUTENCAO_PROGRAMADA`; `CHAMADO` entra com os chamados | Implementado |
| **Manutenção programada** | Agendamento recorrente (ou único) que gera tarefas numa frequência | `ManutencaoProgramada`, `/api/manutencao-programada`, `/planejamento/manutencoes-programadas` | Implementado |
| **Modelo de checklist** | Molde de verificação usado pelas tarefas; o checklist preenchido fica na tarefa | `Checklist` (nome técnico mantido), `/api/checklist`, `/planejamento/modelos-checklist` | Implementado |
| **Disponibilidade** | Situação de hoje do funcionário, calculada: Indisponível (ausência vigente) > Ocupado (responsável por tarefa em execução) > Disponível. Presentes = disponíveis + ocupados | `/api/disponibilidade`, tela `/cadastros/equipes?visao=funcionarios` | Implementado |
| **Item de estoque** | Peça, ferramenta, consumível ou EPI do almoxarifado. Não confundir com **Equipamento** (ativo monitorado). Saldo só muda por movimentação | `ItemEstoque`, `/api/estoque/item`, tela `/estoque` | Implementado |
| **Movimentação** | Entrada (só gestão) ou retirada (todos) de um item, imutável: quem, quando, quanto, saldo depois e equipamento atendido. É a rastreabilidade do item; corrigir = movimentação contrária | `MovimentacaoEstoque`, `POST /api/estoque/item/{id}/entrada` e `/retirada`, `/api/estoque/movimentacao` | Implementado |
| **Ausência** | Período (dias inteiros) em que o funcionário não está disponível. Motivo genérico, sem texto livre (LGPD: nada de dado de saúde) | `Ausencia`, `/api/ausencia` | Implementado |
| **Chamado** | Registro de um problema (ocorrência), com triagem | — | A implementar |
| **Plano de ação** | Conjunto de uma ou várias tarefas geradas por um chamado | — | A implementar |

Não usar "plano" sozinho (ambíguo com Plano de ação) nem "agenda" como nome de módulo: a tela é Tarefas, e o calendário é só uma forma de vê-las. Status da tarefa: `AGENDADA → EM_EXECUCAO → EM_ANALISE → CONCLUIDA` (reprovada volta para `EM_EXECUCAO`); `CANCELADA` à parte. Menu: **Operação** (Central de Controle, Tarefas, Em análise, Estoque), **Planejamento** (Manutenções programadas, Modelos de checklist), **Cadastros**, **Gestão** (Relatórios: `/relatorios`, `GET /api/relatorio/tarefas`, só dados agregados).

## Decisões de arquitetura

| Tema | Decisão | Observação |
|---|---|---|
| Backend | Spring Boot 3.5 (Java 21), base no template `JLPimenta/arch-spring` | Substitui a proposta Node.js/Express do documento |
| Banco | PostgreSQL via Docker, migrações com Liquibase | Substitui a proposta SQLite |
| Frontend | React + TypeScript + Vite | TypeScript compila para JavaScript; atende RNF02 no cliente |
| UI | shadcn/ui + Tailwind CSS | Componentes em `src/components/ui` |
| IA / triagem | Classificação por regras no backend, sempre revisável | Serviço de IA real é P2 e opcional |

## Estrutura do repositório

```
/
├── backend/        Spring Boot (Maven)
├── frontend/       React + TypeScript (Vite)
├── docs/           Documentação, evidências de teste e protótipo HTML5 de referência (docs/dist, somente leitura)
├── compose.yaml    PostgreSQL (e, opcionalmente, a stack completa)
├── .env.example    Variáveis de ambiente (copiar para .env)
└── CLAUDE.md
```

## Execução local

Requisito: subir o sistema com o mínimo de passos. Qualquer mudança que adicione dependência de ambiente deve atualizar o README e o `.env.example`.

```bash
cd backend && ./mvnw spring-boot:run       # sobe o PostgreSQL via compose e a API em :8080 (Swagger em /)
cd frontend && npm install && npm run dev  # UI em :5173
docker compose --profile app up --build    # alternativa: stack completa em containers
```

- Perfil `dev` (padrão): `spring-boot-docker-compose` lê `../compose.yaml`, sobe o banco e injeta a conexão. Não configurar datasource no `dev`.
- Perfil `docker`: usado pelo container do backend; conexão por variáveis `POSTGRES_*`.
- O Vite faz proxy de `/api` para `http://localhost:8080`; no container, o nginx faz o mesmo. Sem CORS.
- Dados de demonstração entram por changeset Liquibase com `context:dev`. Nenhum passo manual de carga.
- `.env` na raiz é opcional; o `compose.yaml` tem valores padrão. Nunca versionar `.env` nem senhas em `application-*.properties`.
- `JAVA_HOME` deve apontar para a pasta do JDK, não para `bin`.

## Backend — padrões (arch-spring)

Pacote raiz: `com.smartmall.ops`. Dois agrupamentos: `api` (camada web) e `domain` (regra de negócio e dados).

```
com.smartmall.ops
├── api
│   ├── config/exception      ResponseError, FieldDataValidation, RestExceptionHandler
│   ├── config/swagger        OpenAPI e redirecionamento de "/" para o Swagger
│   └── controller/<recurso>  Controllers REST
└── domain
    ├── core                  Classes genéricas (não alterar sem necessidade)
    │   ├── controller        BaseController, BaseSearchController
    │   ├── entity            BaseEntity (id UUID String, dataCriacao, dataAtualizacao)
    │   ├── exception         DomainException
    │   ├── mapper            IBaseMapper<T, R, Q>
    │   ├── repository        BaseRepository<T> (JpaRepository + JpaSpecificationExecutor)
    │   └── service           IBaseService<T>, BaseService<T>
    ├── entity                Entidades JPA
    ├── model/<recurso>       <Recurso>Request, <Recurso>Response, I<Recurso>Mapper
    ├── repository/<recurso>  <Recurso>Repository
    └── service/<recurso>     I<Recurso>Service, <Recurso>Service
```

Convenção de genéricos: `T` = entidade, `R` = request, `Q` = response.

Para cada novo recurso, criar o conjunto completo:

1. `domain/entity/<Recurso>.java` — estende `BaseEntity`, `@Table(name = "NOME")`, colunas em `UPPER_SNAKE_CASE`.
2. Changeset Liquibase em `resources/db/changes/<recurso>/AAAAMMDD-N-descricao.sql`, incluído em `db/changelog-master.xml`. `ddl-auto=validate`: o schema vem só do Liquibase.
3. `model/<recurso>/<Recurso>Request` e `<Recurso>Response` (Lombok `@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor`), validação com Bean Validation no Request.
4. `I<Recurso>Mapper` com MapStruct (`@Mapper(componentModel = "spring")`) estendendo `IBaseMapper`.
   - **Relações:** o Request recebe ids (`pisoId`). O mapper converte o id em entidade "referência" com `Referencias.porId(id, Piso::new)`; o serviço troca pela entidade real e lança `DomainException("Piso não encontrado.")` se o id não existir. Exemplo: `IEquipamentoMapper` + `EquipamentoService.preparar`.
   - **Response:** expõe resumos (`Resumo`: id, nome, código), nunca a entidade relacionada inteira.
5. `<Recurso>Repository` estendendo `BaseRepository<T>`.
6. `I<Recurso>Service` estendendo `IBaseService<T>` e `<Recurso>Service` estendendo `BaseService<T>`. Regras de negócio em `validate()` ou em métodos próprios do serviço.
   - **`validate()` roda na criação e na edição** (`BaseService.update` também chama). Unicidade deve ignorar o próprio registro: `@Query("... and (:id is null or e.id <> :id)") boolean existeCodigo(String codigo, String id)`.
   - **Exclusão de registro em uso:** sobrescrever `delete` e lançar `DomainException` com o motivo ("Equipamento com manutenção programada não pode ser excluído."). Não depender do erro genérico de chave estrangeira.
   - **"Agora":** injetar `java.time.Clock` (bean em `TempoConfiguration`) e usar `LocalDateTime.now(clock)`, nunca `now()` direto. Nos testes, `Clock.fixed(...)`. O fuso da aplicação é `America/Araguaina` (variável `APP_FUSO_HORARIO`), definido no `main`.
7. Controller estendendo `BaseController` (CRUD) ou `BaseSearchController` (somente leitura), com `@Tag` do Swagger.

Regras:

- Rotas com prefixo `/api`, recurso em pt-BR no singular, kebab-case (`/api/ocorrencia`, `/api/manutencao-preventiva`).
- Transições de status (aprovar, atribuir, iniciar, concluir, encerrar) são endpoints explícitos (`POST /api/ocorrencia/{id}/aprovar`), não `PUT` genérico.
- Erro de regra de negócio: lançar `DomainException` com mensagem curta em pt-BR. O `RestExceptionHandler` converte para `ResponseError`.
- Toda mudança de status de ocorrência, tarefa e manutenção grava registro de histórico (RNF06): entidade, ação, responsável, data e resultado.
- Autorização por perfil (Administrador, Supervisor, Funcionário) verificada no servidor, não só no frontend (RNF05).
- Controllers não contêm regra de negócio; apenas delegam ao serviço.
- Testes de serviço para as regras do fluxo principal (RNF09). Controllers com `@WebMvcTest`, importando `SecurityConfiguration` e `PasswordConfiguration`.

## Limites de dados (obrigatório)

Nenhum campo de entrada fica sem limite. Um valor sem limite passa pela tela, estoura a coluna do banco (erro 500) ou trava a interface.

- **O mesmo número nas quatro camadas:** coluna do banco (`VARCHAR(n)`), `@Size(max = n)` no `*Request`, `.max(n)` no schema Zod e `maxLength={n}` no campo. No frontend, o valor vem de uma constante da feature (ex.: `features/checklists/limites.ts`), nunca de número solto.
- **Texto:** `@Size(max)` com mensagem em pt-BR. Senha: máximo de 72 (limite do BCrypt).
- **Número:** `@Min`/`@Max` no backend; `min`/`max` no `<input type="number">`.
- **Listas:** `@Size(max)` (ex.: até 50 itens por checklist) e o botão de adicionar desabilitado ao atingir o limite.
- **Contador:** texto livre usa `LimitedInput` (`components/shared`), que exige `maxLength`. O contador fica sempre visível em campos únicos de destaque (ex.: Nome) e, em listas, aparece a partir de 80% do limite.
- **Guardas automáticas, que devem continuar passando:**
  - backend: `LimitesDosRequestsTest` reprova qualquer `*Request` com texto ou lista sem `@Size(max)` ou número sem `@Max`;
  - frontend: `e2e/limites.spec.ts` reprova campos sem `maxlength` ou números sem `min`/`max`. Toda tela nova com formulário entra nesse spec.

Autenticação (`api/config/security`):

- Sessão HTTP com cookie `JSESSIONID` (HttpOnly, SameSite=Strict). Sem JWT. CSRF desabilitado porque o frontend é same-origin via proxy.
- Endpoints: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/sessao`. Todo o resto de `/api/**` exige sessão.
- Perfis no enum `Perfil` (`ADMINISTRADOR`, `SUPERVISOR`, `FUNCIONARIO`), expostos como `ROLE_<PERFIL>`.
- Restrição por perfil de um recurso inteiro: `requestMatchers(...).hasAnyRole(...)` em `SecurityConfiguration`. **Não** usar `@PreAuthorize` na classe do controller: ele não alcança os endpoints herdados de `BaseController`/`BaseSearchController` (o Spring procura a anotação na classe que declara o método). `@PreAuthorize` só em métodos declarados no próprio controller. Toda restrição tem teste `@WebMvcTest` com o perfil bloqueado.
- Usuário logado no controller: `@AuthenticationPrincipal UsuarioAutenticado`. Use o `id` dele como responsável no histórico.
- Senhas sempre com BCrypt (`PasswordEncoder`); `UsuarioResponse` nunca expõe a senha.
- 401 e 403 respondem `ResponseError` em JSON.

## Frontend — padrões

Stack: Vite, React, TypeScript (`strict`), Tailwind, shadcn/ui, React Router, TanStack Query para chamadas à API, React Hook Form + Zod para formulários (padrão do `Form` do shadcn).

```
frontend/src
├── components
│   ├── ui/          Componentes do shadcn (gerados via CLI; editar com parcimônia)
│   ├── layout/      AppShell, Sidebar, Header, PageHeader
│   └── shared/      Componentes reutilizáveis do domínio (ver lista abaixo)
├── features/<modulo>/   ocorrencias, central, tarefas, equipamentos, manutencao, historico, auth
│   ├── components/  Componentes específicos do módulo
│   ├── api.ts       Funções de acesso à API do módulo
│   ├── hooks.ts     Hooks do TanStack Query
│   ├── schemas.ts   Schemas Zod
│   └── types.ts     Tipos espelhando os Response/Request do backend
├── pages/           Uma página por rota; compõe componentes, sem lógica pesada
├── lib/             api client, cadastro (useAcoesCadastro), datas, use-agora, utils (cn)
└── routes.tsx
```

`components/shared` (usar antes de criar outro):

| Componente | Uso |
|---|---|
| `CadastroForm` | Envolve todo formulário de cadastro/edição: salvar e permanecer, descarte, `data-alterado`, `somenteLeitura` |
| `FormActions` | Barra fixa Cancelar/Salvar (já incluída no `CadastroForm`) |
| `RegistroLoader` | Carregando / erro / "não encontrado" de uma tela de edição |
| `SelectField` | Select ligado ao RHF com rótulo e erro |
| `LimitedInput`, `LimitedTextarea` | Texto com limite obrigatório e contador |
| `ExcluirDialog`, `ConfirmDialog` | Confirmação de exclusão (mostra o nome) e de ações em geral |
| `StatusBadge` | Status com tom padronizado (`neutro`, `info`, `sucesso`, `atencao`, `perigo`) |
| `AlternarVisao` | Botões de visualização da mesma tela (Calendário/Kanban, Equipes/Funcionários), com a visão na URL |
| `Medidor` | Barra de percentual acessível (`role="meter"`), com o valor em texto |
| `BotaoNovo` | Ação primária "Novo …" (azul), levando a origem |
| `LinhaClicavel` | Linha de tabela que abre o registro |
| `BarraFiltros`, `FiltroTexto`, `FiltroSelect`, `FiltroData` | Filtros de listagem (estado na URL com `useFiltrosUrl`) |
| `SemResultado` | Lista filtrada sem resultado, com "Limpar filtros" |
| `PageHeader`, `EmptyState`, `ErrorState`, `SimulatedBadge` | Estrutura e estados de tela |

Uma tela de cadastro nova segue o modelo de `pages/equipamento-form-page.tsx`: `useAcoesCadastro` + `RegistroLoader` + `<XForm>` com `CadastroForm`. A listagem segue `pages/equipamentos-page.tsx`.

Componentização:

- Página só compõe. Lógica de dados em hooks; markup repetido vira componente.
- Componente com mais de ~150 linhas ou mais de uma responsabilidade deve ser dividido.
- Antes de criar componente, verificar se já existe em `ui/` ou `shared/`. Adicionar componentes shadcn com `npx shadcn@latest add <nome>`.
- Props tipadas com `type`; sem `any`.
- **Menu lateral** (`components/layout/navigation.ts`): grupos (Operação, Manutenção, Cadastros); só entra item de módulo já implementado.
  - Cada item declara `perfis`, iguais aos do `SecurityConfiguration`. Item **sem** `perfis` libera todos os perfis.
  - A rota usa `<RequirePerfil rota="...">`, que consulta `podeAcessar`; rota fora do menu é negada por padrão.
  - A ordem dos itens define a tela inicial de cada perfil.
- **Datas** (`lib/datas.ts`): o backend envia `LocalDate`/`LocalDateTime` sem fuso.
  - Usar `paraIsoData`/`deIsoData`, nunca `toISOString()`, que converte para UTC e muda o dia.
  - "Agora" na renderização vem de `useAgora()`; `new Date()` direto no render é impuro e o lint acusa.
- Sessão: `useSessao()` (`features/auth/hooks.ts`). Rotas internas ficam sob `RequireAuth`. Um 401 em qualquer chamada limpa a sessão e leva ao login (`lib/query-client.ts`).
- Chamadas HTTP só via `lib/api.ts` (prefixo `/api`, erros como `ApiError`; upload com `api.upload` e `FormData`). Listagens paginadas retornam `Page<T>` (`content` + `page`).
- Status e prioridade sempre pelos componentes compartilhados, para manter cor e texto consistentes. Cada situação tem um tom próprio (`lib/tons.ts`: `seloDoTom`, `marcadorDoTom`, `pontoDoTom`), o mesmo no selo, no calendário e na legenda; duas situações não dividem o mesmo tom.
- Cores por tokens CSS do tema shadcn (`--primary`, etc.), nunca hex solto em componente. Paleta base do protótipo: navy `#061a37`, azul `#087cbe`, ciano `#36c6ea`, verde `#24ae72`, vermelho `#ec545b`, âmbar `#f0a633`.
- **Identidade visual (padrão do login):** painéis escuros em gradiente navy → azul (`bg-painel-marca`; o menu lateral usa o mesmo gradiente), destaque em ciano (`text-marca-ciano`), fundo da página levemente azulado, cartões brancos com borda clara e o botão principal em gradiente azul → ciano (`bg-gradiente-primario`, já na variante padrão do `Button`). Logo: `Logo`/`LogoIcone` (`components/layout/logo.tsx`), com `tom="claro"` sobre fundo escuro.

HTML5 e acessibilidade (tecnologia sorteada, seção 9 da documentação — é critério de avaliação):

- `index.html` com `<!DOCTYPE html>`, `lang="pt-BR"`, `charset` e `viewport`.
- Estrutura semântica: `header`, `nav`, `main`, `section`, `footer`, hierarquia de títulos correta (um `h1` por página).
- Formulários com `label` associado, `type` adequado, `required` quando aplicável e **sempre** `maxLength` (ou `min`/`max` em números), além da validação Zod. Ver "Limites de dados".
- Central de Controle: diagrama do piso em SVG inline, com marcadores focáveis e operáveis por teclado.
- Layout responsivo: sidebar no desktop, navegação compacta no mobile.

Estados obrigatórios em toda tela com dados: carregando (Skeleton), vazio, erro e sucesso.

## Layout, espaçamento e uso da tela

Objetivo: o usuário vê o máximo de informação útil sem rolar, sem áreas vazias desperdiçadas.

- **Largura:** formulários e listas usam até `max-w-6xl`. Campos curtos por natureza (nome, código) podem ser limitados (ex.: `max-w-xl`), mas o contêiner não. Não deixar mais da metade da tela vazia no desktop.
- **Itens repetidos** (perguntas, linhas, registros) ficam em **linhas compactas tipo tabela** no desktop:
  - uma linha por item e rótulos uma vez só, no cabeçalho;
  - cada campo mantém rótulo acessível (`md:sr-only`) e cada linha é um `<fieldset>` com `<legend>` (ex.: `checklists/components/item-grid.ts`).
  - No celular, as linhas viram cartões empilhados com rótulos visíveis.
- **Ações de lista crescente no topo:** "Adicionar …" fica no cabeçalho da lista (ao lado do título com a contagem `n/limite`), nunca no fim. O item novo recebe o foco e entra na área visível.
- **Formulário longo:** barra de ações fixa no rodapé (`sticky bottom-0`), com Cancelar e Salvar sempre visíveis. Usar `FormActions` (`components/shared`).
- **Ações secundárias de linha** (mover, remover): no desktop aparecem ao passar o mouse ou focar a linha; no celular ficam sempre visíveis.
- **Teclado:** Enter avança para o próximo campo lógico e, no último item, cria um novo. Nunca envia o formulário sem querer. Reordenar funciona por arrastar (mouse, toque e teclado) e por botões ↑ ↓.
- **Densidade:** espaçamento vertical entre grupos `gap-6`; dentro de linhas `gap-2`; altura de linha de item no desktop abaixo de 64 px (há teste).
- **Contador e mensagens dentro do espaço existente:** contadores ficam dentro do campo, para não deslocar o layout.
- **Botões:** a ação principal da página (Novo …, Salvar) usa a variante padrão (azul), sempre via `BotaoNovo` nos "Novo …". `outline`/`ghost` só para ações secundárias.

## Listagens (obrigatório)

- **Filtros:** toda listagem com cadastro tem `BarraFiltros` (`role="search"`) logo abaixo do título, com `FiltroTexto`, `FiltroSelect` e `FiltroData` (`components/shared/filtros.tsx`). "Limpar filtros" aparece quando há filtro ativo.
  - **Estado na URL:** `useFiltrosUrl` (`lib/filtros.ts`), para os filtros sobreviverem ao recarregar e à volta de um cadastro.
  - **Várias mudanças de uma vez:** usar `atualizar({...})` ou `limpar([...])`, nunca dois `definir` seguidos. O updater do `setSearchParams` vê os parâmetros da renderização anterior, e a segunda chamada desfaz a primeira.
  - **Busca de texto:** `contem()` ignora maiúsculas e acentos.
- **Lista vazia:** "Nenhum … cadastrado" (`EmptyState` com o botão Novo) é diferente de "Nenhum resultado para os filtros." (`SemResultado`, com Limpar filtros).
- **Linha clicável:** `LinhaClicavel` abre o registro em edição. Botões e links da linha mantêm a própria ação. Para o teclado, cada linha mantém o link "Editar …".
- **Item de lista clicável (fora de tabela):** a área inteira abre o registro. O link principal recebe `after:absolute after:inset-0` (o item é `relative`), e os outros links e botões do item, `relative z-10`. Referência: `features/tarefas/components/tarefa-item.tsx`. No E2E, clicar numa posição do item (`item.click({ position })`), não no texto, que fica sob o link.

## Navegação e fluxo

O usuário nunca deve se perder.

- **Origem:** todo link para uma tela de cadastro leva a origem (`state={useOrigemAtual()}`; `BotaoNovo` e `LinhaClicavel` já levam). O Cancelar/Voltar retorna para lá (`useVoltarPara`), com filtros e dia selecionado. Sem origem (URL direta), volta para a listagem.
- **Telas do mesmo fluxo se ligam nos dois sentidos.** Na manutenção:
  - em Tarefas, a origem da tarefa ("Manutenção programada") abre a manutenção programada;
  - a manutenção programada tem "Ver em Tarefas", que abre Tarefas no dia da próxima;
  - Tarefas tem "Programar manutenção".
  - Estados navegáveis ficam na URL (ex.: `/tarefas?dia=AAAA-MM-DD`).
- **Ao criar um módulo novo:** definir de onde o usuário chega e para onde vai, e testar o caminho de ida e volta no E2E.

## Telas de cadastro e edição (obrigatório)

Toda tela de cadastro ou edição segue este comportamento:

- **Cancelar com alterações:** se algum campo foi preenchido ou alterado (`formState.isDirty`, o que inclui adicionar, remover e reordenar itens), Cancelar abre um diálogo com o título "Descartar alterações?", o aviso "As informações não salvas serão perdidas." e os botões "Cancelar" (foco inicial; mantém a tela) e "Descartar" (sai sem salvar). Sem alterações, Cancelar sai direto. Se o usuário desfizer a alteração à mão, não há confirmação.
- **Salvar:** persiste, mostra a mensagem de sucesso e **permanece na mesma tela**.
  - **Cadastro novo:** depois de salvar, a tela vira a edição do registro criado (`navigate(<lista>/<id>, { replace: true })`), para que o próximo Salvar atualize em vez de duplicar.
  - **Valores salvos:** viram a nova base do formulário (`form.reset(salvos)`). Depois de salvar, Cancelar não pede confirmação.
  - **Ordem dos passos:** o `reset` roda num `useEffect` depois do envio, nunca dentro do `handleSubmit`, porque o RHF sobrescreve o estado ao concluir. A mensagem de sucesso sai só depois do `reset` (via `useEffectEvent`), para nunca existir "salvo" com alteração pendente. Referência: `features/checklists/components/checklist-form.tsx`.
  - **`<form data-alterado={isDirty}>`:** expõe o estado de alterações pendentes aos testes.
  - **Erro ao salvar:** a tela, os dados digitados e o estado de alterações pendentes são mantidos.
- **Componentes:** `CadastroForm` implementa tudo isso; `useAcoesCadastro` (`lib/cadastro.ts`) fornece as ações (salvar, troca para edição, mensagem de sucesso, erro). Registro que não pode ser editado (ex.: plano encerrado): `somenteLeitura`.
- **Ação principal além de Salvar** (ex.: "Enviar para análise"): prop `acaoExtra` do `CadastroForm`; Salvar passa a ser secundário (`outline`). Referência: `features/tarefas/components/execucao-form.tsx`.
- **Testes E2E de toda tela de cadastro:** salvar novo (vira edição e não duplica), salvar edição, Cancelar sem e com alterações, voltar no diálogo, Descartar e Cancelar depois de salvar.
- **Sincronizar o teste depois de Salvar:**
  - aguardar a resposta da API (`page.waitForResponse`) e `data-alterado="false"`;
  - não confiar só no toast: o de uma gravação anterior pode continuar na tela e o teste seguir antes da hora;
  - modelo: `salvar()` em `e2e/support/checklists.ts`.

## Texto de interface

- pt-BR, direto e curto. Rótulos de uma a três palavras; botões com verbo no infinitivo ("Registrar", "Aprovar", "Encerrar").
- Sem frases de efeito, saudações, explicações óbvias ou parágrafos descritivos na tela.
- Sem texto de ajuda quando o rótulo já basta. Descrição de página: no máximo uma linha, e só se necessária.
- Mensagens de erro dizem o que fazer: "Informe a localização", não "Ops! Algo deu errado".
- Dados simulados (rotas, posições, tempos, classificação sugerida) recebem o `SimulatedBadge` ("Simulado") — exigência RNF07 — sem textos longos de aviso.
- Não apresentar como implementada uma funcionalidade planejada.

O mesmo vale para código e documentação: comentários só quando explicam o porquê; README e docs objetivos.

## Testes

Toda funcionalidade é entregue com testes. Uma tarefa não está concluída sem eles passando.

Backend (`./mvnw test`):

- Teste unitário (JUnit 5 + Mockito, sem contexto Spring) para cada service e cada classe com regra: caminho feliz, cada `DomainException`, efeitos colaterais (o que é ou não salvo).
- `@WebMvcTest` para cada controller: status HTTP, formato do JSON, validação, 401 sem sessão e 403 por perfil.
- Nomes de métodos em pt-BR descrevendo o comportamento (`rejeitaCodigoDuplicado`).

Frontend (`npm run test:e2e`, Playwright em `frontend/e2e`):

- Cada funcionalidade do frontend tem seu spec: `e2e/<modulo>.spec.ts`. Helpers comuns em `e2e/support/` (login por perfil em `support/auth.ts`).
- Os testes rodam contra a stack real com a seed de dev; o backend precisa estar no ar.
- Cobrir: fluxo principal, erros exibidos, estados vazio e de erro, permissões por perfil e estrutura HTML5 (rótulos, `required`, um `h1`, um `main`).
- Localizar por papel e rótulo acessível (`getByRole`, `getByLabel`), não por classe CSS. Se um elemento não for localizável assim, corrigir a acessibilidade do componente.
- Todos rodam em `desktop` e `mobile`; tratar a gaveta do menu no celular.
- Estados difíceis de reproduzir (401, 500) são simulados com `page.route`.
- Testes não podem depender de dados criados por outro teste. Se precisar criar dados, criar no próprio teste com nome único.
- Testes com vários perfis: a página entra com um perfil e os dados de outro perfil são preparados pela API (`apiComo` em `e2e/support/tarefas.ts`).
- Testes em paralelo podem criar registros parecidos no mesmo dia: localizar o registro do teste pelo id (ex.: `[href="/tarefas/<id>"]`), não só pelo texto.

Testes instáveis (flaky) são defeito, não azar. Regras:

- **Nunca "corrigir" um teste intermitente com `.first()`, `.last()`, `waitForTimeout` ou aumento de timeout** sem entender a causa.
- **Quantas rodadas:** a suíte roda **uma vez** e o resultado é avaliado (inclusive os testes que passaram por motivo errado). Uma segunda rodada só quando a mudança tiver alto risco de regressão (ex.: renomeação ampla, mudança em componente compartilhado) ou houver falha suspeita de intermitência; neste caso, prefira repetir só o spec afetado (`--repeat-each`).
- **Sincronizar pelo efeito da ação, não por sinais que podem ser antigos.** Exemplos de sinal antigo: um toast ainda na tela, um texto que já existia, a URL que não muda. Os efeitos válidos:
  - a resposta da API (`page.waitForResponse`);
  - um estado exposto pela tela (ex.: `data-alterado`);
  - `expect.poll` para estilos com transição.
- **Mensagens repetíveis (toasts):** não usá-las como prova de que *esta* ação terminou.
- **Dados da seed são somente leitura nos testes.** Testes que mexem num registro da seed não salvam; os que precisam salvar criam o próprio registro e o apagam no `afterEach`.
- **Registro que a regra de negócio não deixa excluir** (ex.: manutenção programada com tarefa executada): o teste marca o registro com `marcaUnica()` (`E2E-…`) nas observações e o apaga com `DELETE /api/teste/e2e?marca=` (`LimpezaE2EController`: só no perfil `dev`, só Administrador, só marcas `E2E-`). Helper: `descartarProgramada` em `e2e/support/tarefas.ts`.
- **Ambiente estável:**
  - não rodar o E2E enquanto containers reiniciam;
  - não compilar o backend (`mvnw test`/`compile`) com o backend dev no ar durante o E2E: o devtools recarrega no meio da compilação e o login quebra;
  - falha em massa no login indica ambiente, não código. Conferir `GET /api/auth/sessao`: deve responder JSON com "Sessão expirada".
  - `e2e/global-setup.ts` faz essa conferência antes da suíte: espera até 60 s por frontend, backend com segurança e login da seed. Se o ambiente não ficar pronto, a suíte nem começa e a mensagem diz o que está errado. Ao surgir uma nova dependência de ambiente, incluir a verificação ali.
- **Teste instável descoberto:** registrar a causa e a correção em `docs/testes-instaveis.md`.

## Escopo e prioridade

Implementar na ordem: P0 completo antes de qualquer P1.

- P0: RF01 Autenticação por perfil, RF02 Dashboard, RF03 Ocorrências, RF04 Triagem com revisão humana, RF05 Tarefas, RF06 Central de Controle, RF08 Manutenção preventiva.
- P1: RF07 Rota ilustrativa, RF09 Checklist, RF10 Alertas, RF11 Histórico.
- P2: RF12 Análise de recorrência, serviço de IA real.

Fluxo de status da ocorrência: `REGISTRADA → EM_ANALISE → APROVADA → EM_EXECUCAO → ENCERRADA`. A sugestão de categoria, prioridade e equipe nunca é aplicada sem aprovação de Supervisor ou Administrador. Encerramento exige resolução registrada.

## Git

- Commits pequenos, mensagem em pt-BR no imperativo (`Adiciona endpoint de aprovação de ocorrência`).
- Branch por funcionalidade: `feat/<rf>-<descricao>`, `fix/<descricao>`.
- Não commitar `.env`, `node_modules/`, `target/`, `.idea/`, `frontend/dist/`.
