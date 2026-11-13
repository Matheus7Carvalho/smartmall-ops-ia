# SmartMall Ops AI — Operação e ocorrências

Protótipo local em **HTML5** do SmartMall Ops IA. A identidade visual usa azul-marinho com degradês para azul-claro e a logo oficial do SmartMall Ops IA.

## Incluído

- RF01 — login de demonstração para Administrador, Supervisor e Funcionário, com menus e permissões de interface conforme o perfil;
- RF02 — dashboard operacional com ocorrências abertas, tarefas em andamento, equipamentos monitorados e alertas;
- Central de Controle para supervisão, com indicadores, fila prioritária, equipes, mapa operacional simplificado e painel de decisão;
- Navegação lateral, alertas recentes e fila operacional sintética;
- Central de ocorrências em uma única tela, com registro e prévia local de foto;
- Classificação demonstrativa e explicável por regras, com categoria e prioridade sugeridas;
- Sugestão de responsável baseada em especialidade, disponibilidade e carga de tarefas;
- Aprovação obrigatória por Administrador ou Supervisora Operacional antes da atribuição;
- Atualizações auditáveis da tarefa e encerramento bloqueado até o registro de uma resolução.

## Fluxo da ocorrência

`Registrar → Analisar → Aprovar → Executar → Encerrar`

O protótipo mantém todas as etapas na mesma tela. A classificação é uma simulação local e determinística: ela não representa um modelo de IA em produção nem autoriza intervenções técnicas. Situações de risco continuam exigindo os protocolos e a decisão humana do shopping.

## Central de Controle

Disponível para os perfis de Administrador e Supervisora Operacional, a Central de Controle reúne em uma única visão:

- indicadores de ocorrências, equipes, ativos, saúde operacional e condições locais;
- fila de ocorrências selecionável, com prioridade, status, local e horário relativo;
- mapa operacional em SVG, explicitamente simplificado e não georreferenciado;
- rota, localização de equipe e tempo de resposta identificados como estimativas demonstrativas;
- painel de acompanhamento para aprovar, iniciar, atualizar, reatribuir, registrar evidência e encerrar a ocorrência;
- histórico local de decisões e ações; o encerramento requer resumo da resolução e remove a ocorrência da fila ativa.

> A Central de Controle usa dados sintéticos. Ela não representa telemetria real, geolocalização real de equipes ou decisões automáticas da IA.

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
