# SmartMall Ops AI — Operação e ocorrências

Protótipo local em **HTML5** do SmartMall Ops IA. A identidade visual usa azul-marinho com degradês para azul-claro e a logo oficial do SmartMall Ops IA.

## Incluído

- RF01 — login de demonstração para Administrador, Supervisor e Funcionário, com menus e permissões de interface conforme o perfil;
- RF02 — dashboard operacional com ocorrências abertas, tarefas em andamento, equipamentos monitorados e alertas;
- Central de Controle para supervisão, com indicadores, fila prioritária ampliada, mapa operacional simplificado em menu expansível e painel de decisão;
- Quadro Kanban de tarefas para funcionários, com visualização pessoal e etapas A Fazer, Em Andamento, Aguardando Equipamento, Travada e Finalizada;
- Navegação lateral, alertas recentes e fila operacional sintética;
- Fluxo de ocorrências em cinco modais: Registro, Análise, Aprovação, Execução e Encerramento;
- Registro público de ocorrência, sem login, com imagem ou vídeo opcional, descrição e localização;
- Acesso por QR Code simulado com localização pré-cadastrada e bloqueada para edição;
- Classificação demonstrativa e explicável por regras, com categoria, prioridade e equipe indicada;
- Aprovação obrigatória por Administrador ou Supervisora Operacional antes da execução;
- Execução técnica com materiais usados, rota estimada, início da atividade, descrição do serviço e gastos;
- Encerramento com histórico, tempo, responsável técnico, gastos e finalização restrita a Administrador ou Supervisora Operacional.

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

> A Central de Controle usa dados sintéticos. Ela não representa telemetria real, geolocalização real de equipes ou decisões automáticas da IA.

## Tarefas em Kanban

O módulo **Tarefas** apresenta um quadro Kanban de acompanhamento operacional com cinco etapas: **A Fazer**, **Em Andamento**, **Aguardando Equipamento**, **Travada** e **Finalizada**. O perfil de Funcionário visualiza apenas os cartões atribuídos a ele; os perfis de Administrador e Supervisora Operacional visualizam a distribuição completa da equipe.

Cada cartão identifica a atividade, ocorrência ou rotina relacionada, prioridade, local, responsável, especialidade, prazo e pendência. As ações rápidas alteram o status apenas nesta demonstração local — elas não substituem o registro operacional real.

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
