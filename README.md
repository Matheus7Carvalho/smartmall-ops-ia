# SmartMall Ops AI

MVP de gestão operacional para shopping centers. Requisitos em [docs/SmartMall_Ops_AI_Documentacao_Inicial.md](docs/SmartMall_Ops_AI_Documentacao_Inicial.md). Padrões de projeto em [CLAUDE.md](CLAUDE.md).

| Pasta | Conteúdo |
|---|---|
| `backend/` | API Spring Boot 3.5 (Java 21), PostgreSQL, Liquibase |
| `frontend/` | React + TypeScript (Vite), Tailwind, shadcn/ui |
| `docs/dist/` | Protótipo HTML5 original, apenas referência |
| `docs/` | Documentação |

## Requisitos

- Docker Desktop em execução
- Java 21 (`JAVA_HOME` apontando para a pasta do JDK, não para `bin`)
- Node.js 22+

## Rodar em modo desenvolvimento

```bash
cd backend && ./mvnw spring-boot:run
```

```bash
cd frontend && npm install && npm run dev
```

- Frontend: http://localhost:5173
- API e Swagger: http://localhost:8080

O backend sobe o PostgreSQL do `compose.yaml` automaticamente e aplica as migrações com dados de demonstração. O `.env` é opcional; veja `.env.example`.

No VS Code com PowerShell, use dois terminais abertos na raiz do projeto. No primeiro:

```powershell
cd backend
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21.0.12.1' # ajuste se o JDK 21 estiver em outra pasta
.\mvnw.cmd spring-boot:run
```

No segundo:

```powershell
cd frontend
npm install
npm run dev
```

## Rodar tudo em containers

```bash
docker compose --profile app up --build
```

Frontend em http://localhost:5173, API em http://localhost:5173/api. A porta 8080 do backend não é publicada no modo com containers. No modo desenvolvimento acima, a API continua em http://localhost:8080.

O nginx aceita até 21 MB no envio de chamado público (`POST /api/publico/chamado`), mantém 6 MB nas outras APIs e limita os envios por IP na borda. Os limites adicionais do backend podem ser configurados pelas variáveis `CHAMADO_PUBLICO_*` em `.env.example`.

## Registrar chamado pelo QR Code

No navegador da máquina, abra `http://localhost:5173/relatar?local=banheiro-norte`. Para um QR Code lido no celular, use um domínio ou IP acessível ao aparelho, como `http://<IP-da-maquina>:5173/relatar?local=banheiro-norte` no modo com containers; `localhost` no celular aponta para o próprio aparelho. O visitante informa o problema e pode enviar mídia sem login; o local vem preenchido pelo código da URL. A equipe revisa o pré-cadastro em `/chamados` com perfil Supervisor ou Administrador. A seed de desenvolvimento também oferece `praca-alimentacao` e `entrada`.

No formulário, **Abrir câmera** pede permissão ao navegador, mostra a prévia e permite **Fotografar**; **Escolher arquivo** abre a galeria ou o explorador para anexar foto/vídeo. A câmera do navegador funciona em `localhost` ou HTTPS. Se o QR Code abrir um endereço `http://<IP>` no celular, o formulário e o anexo continuam disponíveis, mas a câmera mostra uma orientação para usar HTTPS. Para usar a câmera pelo QR Code, gere os códigos com a URL HTTPS definitiva.

Os QR Codes de demonstração estão em `docs/qrcodes/demo/` (PNG para impressão e SVG vetorial). Eles apontam para o IP Wi-Fi desta máquina no momento da geração (`192.168.10.111:5173`); use-os apenas na mesma rede, com a stack em containers ativa. Esse IP pode mudar. Confira `enderecos.json` antes de imprimir.

Para gerar os três QR Codes com o endereço definitivo do sistema:

```bash
cd frontend
npm install
npm run qr:gerar -- --base-url https://seu-dominio.com --output ../docs/qrcodes/finais
```

O gerador exige um domínio ou IP acessível pelo celular e recusa `localhost`. Cada código abre `/relatar?local=<codigo>` para o local correspondente.

### Como acessar as funções

| Função | Como abrir | Acesso |
|---|---|---|
| Formulário de relato | Abra `http://localhost:5173/relatar?local=banheiro-norte` no computador, ou leia um QR Code de `docs/qrcodes/demo/` com o celular quando o servidor estiver acessível na rede. O campo Local vem preenchido e pode ser editado. | Sem login |
| Triagem dos chamados | Abra `http://localhost:5173/login`, entre como Supervisor ou Administrador e vá em **Operação → Chamados**. Abra um relato para aprovar e criar tarefa ou arquivar com motivo. | Supervisor e Administrador |
| Tarefa aprovada | No chamado aprovado, clique em **Abrir tarefa criada**. A equipe responsável também encontra a tarefa em **Operação → Tarefas**. | Equipe responsável e gestão |
| Membros e permissões | Após entrar, vá em **Cadastros → Membros e permissões**. | Administrador |

Os arquivos PNG/SVG e a lista das URLs codificadas ficam em [`docs/qrcodes/demo/`](docs/qrcodes/demo/README.md). O Vite iniciado apenas com `npm run dev` nesta máquina atende `localhost`; para testar a leitura pelo celular, use a stack em containers ou inicie o Vite com `npm run dev -- --host 0.0.0.0` e confirme que o celular alcança o IP da máquina.

## Contas de demonstração

Criadas pela seed do Liquibase (contexto `dev`). A tela de login tem atalhos para cada perfil.

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `admin@smartmall.local` | `demo123` |
| Supervisor | `supervisor@smartmall.local` | `demo123` |
| Funcionário | `funcionario@smartmall.local` | `demo123` |

Também há funcionários para compor as equipes, todos com senha `demo123`: `pedro.lima@`, `luana.freitas@`, `elisa.rocha@` e `caio.nunes@smartmall.local`.

A seed traz ainda 8 equipamentos, 4 equipes, 2 modelos de checklist e 2 manutenções programadas. A semanal do Elevador E1 começa no passado, então Tarefas já mostra tarefas atrasadas.

## Testes

```bash
cd backend && ./mvnw test
```

```bash
cd frontend && npm run build && npm run lint
```

Testes E2E (Playwright). Exigem o backend no ar com a seed de dev; o Vite é iniciado automaticamente se não estiver rodando. Na primeira vez, instale o navegador:

```bash
cd frontend && npx playwright install chromium
```

```bash
cd frontend && npm run test:e2e
```

Relatório em `frontend/playwright-report`. Para outra URL: `E2E_BASE_URL=http://host:porta npm run test:e2e`.

Antes dos testes, uma verificação aguarda até 60 s pelo frontend, pelo backend e pelo login da seed. Se o ambiente não estiver pronto, a suíte não roda e a mensagem indica a causa.
