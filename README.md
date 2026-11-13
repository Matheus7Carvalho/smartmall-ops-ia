# SmartMall Ops AI — Operação e ocorrências

Protótipo local em **HTML5** do SmartMall Ops IA. A identidade visual usa azul-marinho com degradês para azul-claro e a logo oficial do SmartMall Ops IA.

## Incluído

- RF01 — login de demonstração para Administrador, Supervisor e Funcionário, com menus e permissões de interface conforme o perfil;
- RF02 — dashboard operacional com ocorrências abertas, tarefas em andamento, equipamentos monitorados e alertas;
- Central de Controle para supervisão, com indicadores, fila prioritária ampliada, mapa operacional simplificado em menu expansível e painel de decisão;
- Quadro Kanban de tarefas para funcionários, com visualização pessoal e etapas A Fazer, Em Andamento, Aguardando Equipamento, Travada e Finalizada;
- Tela de Equipes com presença operacional, pessoas disponíveis, ocupadas e indisponíveis, conectada aos status demonstrativos de ocorrências;
- Tela de Usuários e permissões exclusiva para Administradores, com perfis ativos, papéis e privilégios de acesso detalhados;
- Estoque de equipamentos com saldos, alerta de mínimo, entradas, retiradas e histórico auditável por item e por movimentação;
- Navegação lateral, alertas recentes e fila operacional sintética;
- Fluxo de ocorrências em cinco modais: Registro, Análise, Aprovação, Execução e Encerramento;
- Registro público de ocorrência, sem login, com imagem ou vídeo opcional, descrição e localização;
- Acesso por QR Code simulado com localização pré-cadastrada e bloqueada para edição;
- Classificação demonstrativa e explicável por regras, com categoria, prioridade e equipe indicada;
- Aprovação obrigatória por Administrador ou Supervisora Operacional antes da execução;
- Execução técnica com materiais usados, rota estimada, início da atividade, descrição do serviço e gastos;
- Encerramento com histórico, tempo, responsável técnico, gastos e finalização restrita a Administrador ou Supervisora Operacional.
- Padrão unificado de dropdowns: largura total do conteúdo, organização vertical e acabamento visual consistente nas telas e formulários.

## Fluxo da ocorrência

`Registrar → Analisar → Aprovar → Executar → Encerrar`

As etapas são exibidas como botões na tela de Ocorrências e cada uma abre uma modal específica. A classificação é uma simulação local e determinística: ela não representa um modelo de IA em produção nem autoriza intervenções técnicas. Situações de risco continuam exigindo os protocolos e a decisão humana do shopping.

### Registro público e QR Code

O botão **“Registrar ocorrência sem login”** na tela de acesso abre a modal de Registro para clientes ou funcionários do local. Para simular a leitura de um QR Code com local pré-cadastrado, abra a URL abaixo:

```text
http://127.0.0.1:4174/?qr=1&local=praca-alimentacao
```

O parâmetro `local` aceita, nesta demonstração: `praca-alimentacao`, `banheiro-l1`, `corredor-l2`, `entrada` e `estacionamento`.

## Central de Controle

Disponível para os perfis de Administrador e Supervisora Operacional, a Central de Controle reúne em uma única visão:

- indicadores agregados de ocorrências, equipes, ativos, saúde operacional e condições locais;
- fila de ocorrências prioritárias ampliada e selecionável, com prioridade, status, local e horário relativo;
- mapa operacional em SVG, explicitamente simplificado, não georreferenciado e disponível em um menu expansível separado;
- rota, localização de equipe e tempo de resposta identificados como estimativas demonstrativas;
- painel de acompanhamento para aprovar, iniciar, atualizar, reatribuir, registrar evidência e encerrar a ocorrência;
- histórico local de decisões e ações; o encerramento requer resumo da resolução e remove a ocorrência da fila ativa.

O seletor de piso segue o padrão visual dos dropdowns do sistema: ocupa toda a largura da área de conteúdo e fica em uma linha própria abaixo do cabeçalho. A Central também segue o fluxo vertical do sistema: **Fila Ativa**, **Ocorrência selecionada** e **Mapa expansível** ocupam a largura integral em blocos sucessivos, sem painéis lado a lado.

> A Central de Controle usa dados sintéticos. Ela não representa telemetria real, geolocalização real de equipes ou decisões automáticas da IA.

## Tarefas em Kanban

O módulo **Tarefas** apresenta um quadro Kanban de acompanhamento operacional com cinco etapas: **A Fazer**, **Em Andamento**, **Aguardando Equipamento**, **Travada** e **Finalizada**. O perfil de Funcionário visualiza apenas os cartões atribuídos a ele; os perfis de Administrador e Supervisora Operacional visualizam a distribuição completa da equipe.

Cada cartão identifica a atividade, ocorrência ou rotina relacionada, prioridade, local, responsável, especialidade, prazo e pendência. As ações rápidas alteram o status apenas nesta demonstração local — elas não substituem o registro operacional real.

## Equipes

O módulo **Equipes** oferece uma visão de presença operacional em blocos verticais de largura total. Ele destaca o total de profissionais presentes, disponíveis, ocupados e indisponíveis, além de separar as listas de **Funcionários presentes**, **Funcionários disponíveis** e **Funcionários ocupados**.

Cada pessoa exibe nome, especialidade, quantidade de atividades vinculadas e status atual. Os dados são demonstrativos e acompanham o estado local das ocorrências, incluindo atendimento e deslocamento.

## Usuários e permissões

O módulo **Usuários e permissões** é acessível somente ao perfil de **Administrador**. Ele apresenta os perfis cadastrados, e-mail de demonstração, papel, estado da conta e permissões atribuídas. Para Supervisora Operacional e Funcionário, o item de navegação fica oculto e a rota não é disponibilizada.

As informações são apenas demonstrativas: criação, edição, remoção e alteração de privilégios não estão disponíveis neste protótipo local.

## Estoque de equipamentos

O módulo **Equipamentos** reúne o inventário demonstrativo em uma única tela. Ele apresenta o saldo disponível, o estoque mínimo, alertas de reposição e localização no almoxarifado. A consulta acontece em dois dropdowns de largura total e empilhados: **Saldo atual** para escolher o item e **Item selecionado** para abrir seus detalhes.

Ao selecionar um item, o segundo dropdown exibe sua descrição, saldo, código, localização e a **rastreabilidade individual** das entradas e retiradas relacionadas a ele. O histórico geral consolidado não é mostrado na tela de estoque: ele fica reservado para o módulo de Relatórios.

Os fluxos locais disponíveis são:

- **Registrar entrada:** cadastra um novo item ou acrescenta quantidade a um código existente;
- **Retirar equipamento:** valida o saldo, exige uma finalidade e atualiza a quantidade disponível;
- **Rastreabilidade por item:** registra usuário, horário, ação e justificativa apenas nas movimentações do item selecionado;
- **Histórico geral:** consolidado exclusivamente na área de Relatórios.

As movimentações são demonstrativas e permanecem no navegador durante a execução atual. Em produção, esse fluxo exige inventário físico, autorização no servidor e persistência de dados.

## Credenciais de demonstração

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | `admin@smartmall.local` | `demo123` |
| Supervisor | `supervisor@smartmall.local` | `demo123` |
| Funcionário | `funcionario@smartmall.local` | `demo123` |

> A autenticação usa `sessionStorage` exclusivamente para demonstração local. Ela **não é segura para produção**; um sistema real exige backend, senhas com hash, sessões ou tokens seguros, controle de acesso no servidor e auditoria.

## Visualização local

Com Python instalado, execute na pasta deste projeto:

```powershell
python -m http.server 4174 --directory dist
```

Abra `http://127.0.0.1:4174/`. Nenhum dado é enviado para fora do computador e esta versão não possui integração, persistência nem envio de formulário. O anexo de imagem e o histórico existem somente enquanto a página estiver aberta.
