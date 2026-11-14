# Testes instáveis (flaky)

Registro de testes que passaram e falharam sem mudança de código, com causa e correção. Regras de prevenção em `CLAUDE.md`, seção "Testes".

| # | Teste(s) | Sintoma | Causa | Tipo | Situação |
|---|---|---|---|---|---|
| 1 | `checklists.spec.ts` › edita nome e itens | Strict mode: `getByText('Checklist salvo.')` encontrou 2 elementos | Duas gravações seguidas deixam dois toasts na tela | Teste | Contornado com `.last()`; esse contorno escondeu o caso 2 |
| 2 | `checklists.spec.ts` › edição salva continua na tela; edita nome e itens | Diálogo "Descartar alterações?" aparece depois de salvar, às vezes | O helper `salvar()` esperava o toast, mas o toast da gravação anterior ainda estava visível; o teste seguia antes de a segunda gravação terminar | Teste (sincronização falsa) | Corrigido: `salvar()` aguarda a resposta da API e `data-alterado="false"` |
| 3 | `auth.spec.ts` (6 testes, só desktop) | Falhas na primeira execução logo após recriar o container do frontend | O teste começou enquanto o nginx reiniciava | Ambiente | Prevenido: `e2e/global-setup.ts` espera até 60 s o ambiente ficar pronto antes de iniciar |
| 4 | Suíte inteira (login) | "Falha na requisição." e 401 sem corpo em todo login | O `mvnw test` recompilou as classes; o devtools do backend dev recarregou no meio e subiu sem `SecurityConfiguration` | Ambiente | Detectado: `e2e/global-setup.ts` reprova a suíte com mensagem específica quando o 401 vem sem o JSON da aplicação. Prevenção: não compilar o backend durante o E2E |

| 5 | `listagens.spec.ts` › filtra por código, nome… | A linha "CFTV-L2" às vezes não aparecia | Texto de busca errado no teste ("camaras"). O teste passava porque conferia a linha logo após "Limpar filtros", quando a lista inteira ainda estava visível (sinal antigo) | Teste | Corrigido: busca certa e conferência da quantidade de linhas, que só bate depois do filtro aplicado |
| 6 | Agenda › "Limpar filtros" (descoberto ao investigar o caso 5) | Um dos dois filtros voltava depois de limpar | Defeito real: o `setSearchParams(fn)` entrega à `fn` os parâmetros da última renderização. Duas atualizações seguidas faziam a segunda desfazer a primeira | Código | Corrigido em `lib/filtros.ts` (parte de `window.location` e aplica várias mudanças de uma vez), com teste próprio |
| 7 | `tarefa-execucao.spec.ts` › assume pela tela Tarefas… | Strict mode: o link "Abrir tarefa de BOM-B01…" encontrou 2 ou 3 elementos | Na suíte completa, outros testes do mesmo spec criaram tarefas do mesmo equipamento no mesmo dia (data sorteada num intervalo de 15 dias) | Teste | Corrigido: o link é localizado também pelo `href` com o id da tarefa criada no teste |
| 9 | `estoque.spec.ts` › cancelar… (só desktop) | O segundo "Cancelar" não abria o diálogo "Descartar alterações?" | O clique saiu enquanto o diálogo anterior ainda fechava (animação); caiu na sobreposição | Teste (sincronização) | Corrigido: espera o diálogo sumir (`toBeHidden`) antes de clicar de novo |
| 8 | `central.spec.ts` › mostra os números calculados pelo servidor (só desktop) | `response.json`: corpo indisponível ("navigated away") | O Supervisor já cai na Central ao entrar; o `waitForResponse` capturou a resposta dessa carga, e o `goto` seguinte descartou o corpo | Teste (sinal antigo) | Corrigido: espera a primeira carga renderizar, depois registra a espera e recarrega (`abrirCentral`) |
| 9 | `usuarios.spec.ts` › mantém filtros (desktop/mobile) | Rafael não aparecia após limpar filtros | A lista sem filtros é paginada; outros testes criaram membros e Rafael saiu da primeira página | Teste | Corrigido: confirma que a primeira página sem filtros carrega registros, sem exigir um membro específico |
| 10 | `tarefas-kanban.spec.ts` › cada coluna mostra as tarefas do mês (desktop) | A API retornou 3 agendadas e o Kanban mostrou 4 | Outro teste criou uma tarefa entre a consulta feita pelo teste e a consulta da tela | Teste | Corrigido: a tela recebe o mesmo instantâneo da API usado na comparação |

## Riscos ainda presentes

- **Toasts como confirmação:** `Checklist excluído.` e o toast após `salvar()` são aceitáveis só porque há outra sincronização antes (resposta da API ou remoção da linha).
- **Contagem de itens da seed** (`5` e `4` em "mostra os checklists da seed"): quebra se algum teste salvar alterações num checklist da seed. Hoje os testes que abrem a seed só cancelam.
- **Sobras fora do perfil dev:** a limpeza de tarefas executadas usa `DELETE /api/teste/e2e`, que só existe no perfil `dev`. Contra a stack em containers (perfil `docker`), o helper encerra a manutenção programada e ela fica na listagem como "Encerrada" (observação `E2E-…`).
- **Arrastar com o mouse** (`page.mouse` com `steps`): estável nas execuções feitas, mas depende de tempo de animação. Se oscilar, o caminho pelo teclado já cobre a funcionalidade.
