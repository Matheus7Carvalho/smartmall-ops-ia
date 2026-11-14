# Agentes do SmartMall Ops AI

Este repositório usa agentes Codex definidos em `.codex/agents/`. Eles são papéis para tarefas futuras: criar a configuração não inicia implementações.

## Fontes e escopo

- Antes de cada tarefa neste repositório, abra e confira `CLAUDE.md`; aplique as seções relevantes antes de analisar, delegar ou editar. Releia-o quando o escopo mudar.
- `README.md` descreve a execução atual. `CLAUDE.md` e `docs/modulo-manutencao.md` registram as decisões vigentes. `docs/SmartMall_Ops_AI_Documentacao_Inicial.md` contém requisitos e também propostas anteriores de Node.js/SQLite.
- A aplicação integrada está em `backend/` e `frontend/`. `docs/dist/` é um protótipo HTML independente, usado apenas como referência.
- Antes de editar, confira `git status` e preserve mudanças do usuário. Não toque em `debug.log`, `.env` ou dados locais sem tarefa específica.
- Migrações Liquibase já aplicadas são imutáveis; adicione novos changesets. Execute testes que validem a regra alterada e relate o que não pôde ser verificado.

## Encaminhamento

| Agente | Primeira tarefa | Escopo principal |
| --- | --- | --- |
| `integridade_manutencao` | Preservar o contexto histórico das tarefas quando a programação muda | Backend, migrações e testes da manutenção |
| `frontend_listagens` | Mostrar registros além da primeira página | Frontend React e testes das listagens |
| `seguranca_implantacao` | Separar configuração de demonstração e implantação externa | Compose, perfis, proxy e documentação |
| `chamados_fluxo` | Completar chamado, triagem, tarefa e Central | Fluxo integrado após decisão sobre o modelo de Tarefa |

Os três primeiros podem trabalhar em paralelo se seus arquivos não se cruzarem. Inicie `chamados_fluxo` depois que o contrato histórico de Tarefa estiver definido. O agente principal integra os resultados, resolve conflitos e valida o fluxo completo. Não execute a suíte E2E enquanto o backend estiver recompilando com devtools ativo.
