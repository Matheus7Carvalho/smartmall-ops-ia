# SmartMall Ops AI — Operação e ocorrências

Protótipo local em **HTML5** do SmartMall Ops IA. A identidade visual usa azul-marinho com degradês para azul-claro e a logo oficial do SmartMall Ops IA.

## Incluído

- RF01 — login de demonstração para Administrador, Supervisor e Funcionário, com menus e permissões de interface conforme o perfil;
- RF02 — dashboard operacional com ocorrências abertas, tarefas em andamento, equipamentos monitorados e alertas;
- Navegação lateral, alertas recentes e fila operacional sintética;
- Central de ocorrências em uma única tela, com registro e prévia local de foto;
- Classificação demonstrativa e explicável por regras, com categoria e prioridade sugeridas;
- Sugestão de responsável baseada em especialidade, disponibilidade e carga de tarefas;
- Aprovação obrigatória por Administrador ou Supervisora Operacional antes da atribuição;
- Atualizações auditáveis da tarefa e encerramento bloqueado até o registro de uma resolução.

## Fluxo da ocorrência

`Registrar → Analisar → Aprovar → Executar → Encerrar`

O protótipo mantém todas as etapas na mesma tela. A classificação é uma simulação local e determinística: ela não representa um modelo de IA em produção nem autoriza intervenções técnicas. Situações de risco continuam exigindo os protocolos e a decisão humana do shopping.

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
