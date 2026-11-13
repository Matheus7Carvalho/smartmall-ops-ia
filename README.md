# SmartMall Ops AI — Cadastro de ocorrência

Protótipo local em **HTML5** do SmartMall Ops IA. A identidade visual usa azul-marinho com degradês para azul-claro e a logo oficial do SmartMall Ops IA.

## Incluído

- RF01 — login de demonstração para Administrador, Supervisor e Funcionário, com menus e permissões de interface conforme o perfil;
- RF02 — dashboard operacional com ocorrências abertas, tarefas em andamento, equipamentos monitorados e alertas;
- Navegação lateral, alertas recentes e fila operacional sintética;
- Padrão visual de cadastro de ocorrência preservado como base para a próxima tela do fluxo.

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
python -m http.server 4173 --directory dist
```

Abra `http://127.0.0.1:4173/`. Nenhum dado é enviado para fora do computador e esta versão não possui integração, persistência nem envio de formulário.
