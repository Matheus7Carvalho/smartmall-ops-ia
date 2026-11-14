# **DOCUMENTAÇÃO INICIAL DO PROJETO SmartMall Ops AI** 

_Arquitetura requisitos e plano do MVP_ 

#### **Versão 1.2** 

13 de novembro de 2026 

Plataforma web em JavaScript e HTML5 

Repositório de verificação: Matheus7Carvalho/smartmall-ops-ia 

Este documento registra a base técnica e funcional do MVP. Ele separa o que já está presente no protótipo público do que é proposto para as próximas etapas. 

SmartMall Ops AI  |  Documentação inicial Página 1 

## **Informações do documento** 

|**Item**|**Definição**|
|---|---|
|Propósito|Consolidar a documentação inicial do MVP SmartMall Ops AI<br>para desenvolvimento, teste e apresentação.|
|Público|Equipe do projeto, mentores, avaliadores e pessoas<br>responsáveis pela operação do cenário demonstrado.|
|Base de verificação|Repositório público e README verificados em 13 de<br>novembro de 2026.|
||Protótipo web, fluxo de ocorrências, Central de Controle|
|Escopo|l<br>multipisos, manutenção preventiva, qualidade e plano de<br>trabalho.|
||Itens marcados como propostos, planejados ou a confirmar|
|Regra de leitura|i<br>não devem ser apresentados como funcionalidades já<br>implementadas.|



## **Sumário** 

- 1 Visão geral e objetivo 

- 2 Estado atual verificado 

- 3 Plataforma tecnologias e arquitetura 

- 4 Requisitos funcionais do MVP 

- 5 Central de Controle multipisos 

- 6 Manutenção preventiva 

- 7 Dados qualidade e segurança 

- 8 Agentes de apoio ao desenvolvimento 

- 9 Incorporação da prática sorteada 

- 10 Plano de 30 horas e validação 

SmartMall Ops AI  |  Documentação inicial Página 2 

## **1 Visão geral e objetivo** 

O SmartMall Ops AI é um MVP de gestão operacional para shopping centers. A proposta é concentrar o registro e o tratamento de ocorrências, a coordenação de equipes, a localização operacional e a manutenção preventiva em uma aplicação web. O cenário de demonstração é o Capim Dourado Shopping. 

O produto deve ajudar a equipe a transformar um relato de problema em uma atividade acompanhável: registrar a ocorrência, sugerir uma classificação, submeter a decisão à revisão humana, atribuir o atendimento, registrar atualizações e encerrar com uma resolução. Dados e classificações demonstrativas não substituem protocolos de segurança nem decisões técnicas do shopping. 

### **Objetivo do MVP** 

Demonstrar uma jornada integrada e compreensível entre ocorrência, equipe, Central de Controle e manutenção preventiva, usando JavaScript como linguagem principal e HTML5 como base obrigatória da interface. 

### **Perfis de uso** 

|**Perfil**|**Responsabilidades no MVP**|
|---|---|
|Administrador|Gerencia usuários e permissões de demonstração,<br>acompanha indicadores e pode revisar atribuições.|
|Supervisor|Acompanha a operação, revisa a sugestão de classificação,<br>aprova a atribuição e valida o encerramento.|
||Consulta tarefas permitidas, registra atualizações e executa|
|Funcionário|procedimentos demonstrativos de atendimento ou<br>manutenção.|



## **2 Estado atual verificado** 

A verificação do repositório confirma um protótipo local distribuído em HTML5, CSS e JavaScript. O README declara que a aplicação usa dados sintéticos, autenticação demonstrativa com sessionStorage, classificação local por regras e uma Central de Controle de supervisão. O fluxo de ocorrências é Registrar, Analisar, Aprovar, Executar e Encerrar. 

|**Elemento verificado**|**Evidência no repositório**|**Situação**|
|---|---|---|
|Interface web|dist/index.html possui estrutura HTML5 em<br>pt-BR, navegação lateral, telas de login,<br>dashboard e ocorrências.|Confirmado|
|Lógica de interface|dist/assets/app.js controla perfis<br>demonstrativos, o fluxo de ocorrências, a<br>sugestão por regras e o histórico local.|Confirmado|
|Estilo e responsividade|dist/assets/styles.css é referenciado pela<br>página principal e sustenta a identidade<br>visual do protótipo.|Confirmado|



SmartMall Ops AI  |  Documentação inicial Página 3 

|**Elemento verificado**|**Evidência no repositório**|**Situação**|
|---|---|---|
|Autenticação|Credenciais demonstrativas e<br>sessionStorage são usados apenas no<br>navegador local.|Confirmado como demonstração|
|Persistência e integração|O README informa que não há integração,<br>persistência ou envio de formulário nesta<br>versão.|Não implementado|
|Central de Controle|O protótipo possui indicadores, fila<br>prioritária, equipes, mapa operacional SVG<br>simplificado, painel de decisão e histórico<br>local com dados sintéticos.|Implementada como demonstração|
|Manutenção preventiva|Há indicadores e alertas sintéticos de<br>equipamentos, mas não um módulo de<br>agendamento e checklist completo.|Planejado|



Fonte da verificação: repositório SmartMall Ops AI e <u>README principal</u> 

O repositório é a referência para o estado de implementação. A documentação de arquitetura abaixo descreve o estado-alvo do MVP quando estiver identificada como proposta. 

SmartMall Ops AI  |  Documentação inicial Página 4 

## **3 Plataforma tecnologias e arquitetura** 

### **Plataforma** 

A plataforma é uma aplicação web responsiva, acessível em navegadores de computadores, tablets e smartphones. Essa escolha reduz o tempo de demonstração e mantém o HTML5 como estrutura obrigatória da interface. O JavaScript concentra a lógica do cliente e pode sustentar também a camada de servidor em uma etapa posterior. 

### **Tecnologias confirmadas propostas e a confirmar** 

|**Tecnologia ou prática**|**Uso previsto**|**Status**|**Base**|
|---|---|---|---|
|HTML5|Estrutura semântica,<br>formulários, navegação e<br>acessibilidade básica.|Confirmada|index.html verificado|
|JavaScript|Fluxos de interface, permissões<br>demonstrativas, regras de<br>triagem e histórico local.|Confirmada|app.js verificado|
|CSS|Identidade visual, layout e<br>responsividade.|Confirmada|styles.css referenciado|
|sessionStorage|Sessão de demonstração local.|Confirmada apenas para demo|README e app.js|
|Git e GitHub|Versionamento, revisão e<br>rastreabilidade do código.|Confirmada|Repositório público|
|Node.js e Express|API REST, regras no servidor,<br>autorização e validação<br>centralizada.|Proposta|Decisão arquitetural|
|SQLite|Persistir ocorrências, tarefas,<br>ativos, manutenções e histórico<br>durante o MVP.|Proposta|Decisão arquitetural|
|Serviço de IA|Gerar sugestões estruturadas<br>para classificação de texto,<br>sempre revisáveis.|Planejada|Escopo condicionado|
|Agentes de PO programação e<br>testes|Apoio ao planejamento,<br>implementação e qualidade do<br>desenvolvimento.|A confirmar|Proposta apresentada na<br>conversa|



### **Arquitetura lógica proposta** 

A versão atual opera apenas no navegador. A arquitetura abaixo separa a implementação existente do caminho de evolução proposto, sem afirmar que o backend, banco de dados ou integração de IA já estejam ativos. 

**Interface web** HTML5, CSS e JavaScript. Dashboard, ocorrências, Central de Controle, tarefas e manutenção. _Estado atual: ocorrências e Central de Controle demonstrativas no cliente._ 

- **↓** HTTP e JSON entre a interface e os serviços. 

**API de aplicação** Node.js e Express. Autorização, validações, regras de negócio, auditoria e orquestração. _Proposta._ 

- **↓** Acesso a dados e chamadas controladas de serviço. 

SmartMall Ops AI  |  Documentação inicial Página 5 

**Persistência e IA** SQLite para o MVP e um serviço opcional de sugestão textual para triagem. _Propostos; revisão humana obrigatória._ 

### **Responsabilidades por camada** 

|**Camada**|**Responsabilidades**|
|---|---|
|Apresentação|Exibir dados, receber formulários, validar campos básicos,<br>mostrar a planta ou diagrama do piso e indicar se dados são<br>simulados.|
|Aplicação|Autorizar ações, aplicar regras de ocorrência e manutenção,<br>registrar mudanças de status e devolver respostas consistentes.|
|Dados|Guardar usuários, ocorrências, tarefas, equipamentos,<br>agendamentos, checklists e trilha de auditoria.|
||Receber texto da ocorrência, retornar categoria, prioridade,<br>i|
|Sugestão assistida|equipe sugerida e justificativa. Não aprovar nem executar ações<br>técnicas.|



SmartMall Ops AI  |  Documentação inicial Página 6 

### **3.1 Proposta e estrutura inicial das telas** 

Esta seção define uma estrutura inicial de navegação e conteúdo para o MVP. A indicação de status separa o que existe no protótipo do que ainda é planejado. 

Navegação global: cabeçalho com nome do cenário e perfil ativo; menu lateral ou navegação compacta em telas estreitas; conteúdo principal; avisos de dados simulados. Os itens do menu devem respeitar o perfil Administrador, Supervisor ou Funcionário. 

Fluxo principal: Dashboard → Ocorrências → Detalhe e triagem → Revisão do Supervisor → Tarefa atribuída → acompanhamento na Central de Controle → encerramento com resolução. A manutenção preventiva inicia pelo cadastro do ativo e segue para agenda, execução de checklist e validação. 

Tela 1 — Acesso e perfil. Objetivo: entrar no ambiente demonstrativo. Componentes: identificação do produto, campos de credenciais demonstrativas, ação de entrar e aviso de que a autenticação é apenas local. Ações: entrar e encerrar sessão. Status: tela de login existente; autenticação demonstrativa via sessionStorage. 

Tela 2 — Dashboard operacional. Objetivo: oferecer visão rápida da operação. Componentes: cartões de ocorrências abertas, tarefas em andamento, equipamentos monitorados e alertas; fila prioritária; atalhos para registrar ocorrência e abrir a Central. Ações: filtrar ou abrir cada item. Status: painel existente com dados sintéticos; integrações e persistência não implementadas. 

Tela 3 — Ocorrências. Objetivo: registrar e acompanhar relatos. Componentes: lista com busca e filtros por status, prioridade e piso; formulário de nova ocorrência com descrição, localização, categoria e foto opcional; detalhe com histórico, sugestão de classificação, justificativa e equipe sugerida. Ações: registrar, revisar sugestão, aprovar ou corrigir classificação, atribuir, atualizar e encerrar. Status: fluxo demonstrativo no cliente; triagem por regras locais, sem serviço de IA ativo. 

Tela 4 — Central de Controle. Objetivo: situar ocorrências, equipes e equipamentos por piso. Componentes: seletor de piso, diagrama operacional, legenda, marcadores e painel de detalhes do item selecionado, com rótulo de simulação. Ações: alternar piso, selecionar marcador e abrir ocorrência ou ativo. Status: implementada de forma simplificada, com SVG e dados sintéticos; não georreferenciada. 

Tela 5 — Tarefas e atendimento. Objetivo: organizar o trabalho atribuído às equipes. Componentes: lista por responsável, status e prazo; detalhe vinculado à ocorrência; campos de atualização e resolução. Ações: iniciar, registrar andamento e concluir; mudanças devem compor o histórico. Status: parcialmente implementada no fluxo local; integração com servidor e persistência são propostas. 

Tela 6 — Ativos e manutenção preventiva. Objetivo: programar e registrar revisões. Componentes: lista de ativos com código, tipo, localização e condição; agenda de revisões; detalhe do ativo; checklist demonstrativo, observações e evidência quando aplicável. Ações: cadastrar ativo, agendar revisão, registrar execução e submeter à validação do Supervisor. Status: planejada; os checklists não substituem procedimentos técnicos aprovados. 

Tela 7 — Histórico e validação. Objetivo: permitir rastreabilidade e conferência. Componentes: linha do tempo ou tabela com entidade, alteração, responsável, data, resultado e referência à evidência; filtros por ocorrência, tarefa, ativo e período. Ações: consultar e filtrar, sem alterar registros passados. Status: histórico local parcial; trilha de auditoria persistente é proposta. 

Responsividade e acessibilidade: em computadores, usar navegação lateral e painéis lado a lado; em tablets e smartphones, empilhar cartões e painéis, manter ações principais visíveis e permitir navegação por teclado. Formulários devem ter rótulos, mensagens de validação e estados legíveis. 

Critério de consistência: cada tela deve identificar dados sintéticos, estados vazios, carregamento e erro; qualquer função marcada como planejada não deve ser apresentada como implementada. 

SmartMall Ops AI  |  Documentação inicial Página 7 

## **4 Requisitos funcionais do MVP** 

P0 é essencial para a demonstração integrada. P1 será realizado depois do fluxo principal, caso haja disponibilidade. P2 é opcional e não deve comprometer o núcleo do MVP. 

|**ID**<br>RF01|**Funcionalidade**<br>Autenticação|**Requisito resumido**<br>Permitir entrada<br>demonstrativa por<br>Administrador, Supervisor<br>e Funcionário, com menus<br>conforme o perfil.|**Prioridade**<br>P0|**Situação**<br>Parcialmente<br>implementada|
|---|---|---|---|---|
|RF02|Dashboard|Exibir ocorrências abertas,<br>tarefas em andamento,<br>equipamentos<br>monitorados e alertas.|P0|Implementado com dados<br>sintéticos|
|RF03|Ocorrências|Registrar problema com<br>descrição, localização,<br>categoria e foto opcional<br>em ambiente<br>demonstrativo.|P0|Fluxo local implementado|
|RF04|Triagem assistida|Sugerir categoria,<br>prioridade e equipe com<br>justificativa e permitir<br>revisão humana antes da<br>atribuição.|P0|Implementada por regras<br>locais|
|RF05|Tarefas|Permitir atribuir, iniciar,<br>atualizar e concluir<br>atividades, mantendo o<br>histórico de mudanças.|P0|Parcialmente<br>implementada|
|RF06|Central de Controle|Selecionar piso disponível<br>e localizar ocorrências,<br>equipes e equipamentos<br>no diagrama operacional.|P0|Implementada de forma<br>simplificada e sintética|
|RF07|Rota de atendimento|Exibir um percurso<br>ilustrativo e uma<br>estimativa de<br>deslocamento entre<br>equipe e ocorrência.|P1|Planejada e simulada|
|RF08|Manutenção preventiva|Cadastrar ativos,<br>programar revisões,<br>acompanhar prazos e<br>registrar execução.|P0|Planejada|
|RF09|Checklist|Preencher itens de<br>manutenção, registrar<br>observações e submeter a<br>execução à validação do<br>supervisor.|P1|Planejada|
|RF10|Alertas operacionais|Destacar ocorrências<br>prioritárias, revisões<br>próximas do vencimento e<br>equipamentos<br>indisponíveis.|P1|Parcialmente<br>implementada|



SmartMall Ops AI  |  Documentação inicial Página 8 

|**ID**|**Funcionalidade**|**Requisito resumido**|**Prioridade**|**Situação**|
|---|---|---|---|---|
|RF11|Histórico|Consultar responsáveis,<br>atualizações de status e<br>manutenções concluídas.|P1|Parcialmente local|
|RF12|Análise de recorrência|Sinalizar falhas repetidas,<br>inspeções atrasadas ou<br>indicadores simulados fora<br>da faixa configurada.|P2|Planejada|



A manutenção preditiva não será apresentada como previsão estatística validada enquanto não houver dados históricos suficientes e validação técnica. No MVP, o máximo aceitável é uma sinalização baseada em regras e em dados claramente identificados como demonstrativos. 

## **5 Central de Controle multipisos** 

A Central de Controle já está presente no protótipo para os perfis de Administrador e Supervisora Operacional. Ela reúne indicadores, fila prioritária, equipes, mapa operacional SVG simplificado, painel de decisão e histórico local. A seleção atual apresenta Piso L1 e Praça de Alimentação como contexto demonstrativo; a cobertura completa e validada de múltiplos pisos continua fora do que foi confirmado no repositório. 

### **Fluxo operacional** 

1. O supervisor seleciona um piso na Central de Controle. 

2. A tela apresenta marcadores de ocorrências e ativos disponíveis naquele piso. 

3. Ao selecionar uma ocorrência, a Central exibe descrição, prioridade, responsável, status e o ponto de referência informado. 

4. Se o recurso de rota estiver ativo, a aplicação exibe um trajeto ilustrativo entre a equipe e a ocorrência, acompanhado de aviso de simulação. 

Status atual: o mapa é explicitamente simplificado e não georreferenciado. Indicadores, rota, localização de equipe e tempos de resposta são sintéticos e demonstrativos. 

### **Critérios de aceitação** 

- O usuário consegue alternar entre todos os pisos realmente disponibilizados para a demonstração, sem afirmar pisos que não tenham sido validados. 

- Cada ocorrência demonstrada aparece em apenas um piso e possui identificação, status e prioridade legíveis. 

- O marcador de equipamento pode ser aberto para consultar identificação, condição, última revisão e próxima atividade, quando esses dados estiverem cadastrados. 

- Rotas, posições de equipe e tempos estimados exibem uma indicação visual e textual de que são demonstrativos até a validação das distâncias e conexões físicas. 

- O recurso não depende de cálculo de rota real para compor o MVP. A prioridade é demonstrar a localização e o contexto operacional com segurança de interpretação. 

SmartMall Ops AI  |  Documentação inicial Página 9 

### **Limites do MVP** 

A planta e as marcações usadas na demonstração deverão ser tratadas como referência operacional do cenário. Conexões entre pisos, corredores transitáveis, posição em tempo real e estimativas confiáveis de deslocamento exigem levantamento físico e validação da operação. Esses itens ficam fora da promessa funcional do MVP. 

## **6 Manutenção preventiva** 

O módulo de manutenção preventiva complementa a gestão de ocorrências ao permitir acompanhar equipamentos antes que uma falha seja registrada. Ele deve iniciar com um cadastro simples de ativos, agenda de revisões, alerta de prazo e checklist demonstrativo de execução. 

|**Elemento**|**Comportamento esperado no MVP**|**Status**|
|---|---|---|
|Cadastro de equipamento|Registrar código, tipo, localização,<br>condição e responsável de referência.|Planejado|
|Agenda de revisão|Criar atividade com data prevista,<br>responsável, status e vínculo com o<br>equipamento.|Planejado|
|Alerta de vencimento|Destacar inspeções próximas ou<br>atrasadas no dashboard e na Central de<br>Controle.|Planejado|
|Checklist|Apresentar itens demonstrativos, permitir<br>marcar execução, adicionar observação e<br>registrar evidência quando aplicável.|Planejado|
|Histórico|Relacionar cada execução ao<br>equipamento e manter data, responsável<br>e resultado.|Proposto|



Limitação importante: os checklists técnicos reais devem ser definidos e aprovados por profissionais habilitados e pelos procedimentos do shopping. O MVP utilizará itens demonstrativos e não deve validar condições de segurança nem liberar equipamentos para operação. 

## **7 Dados qualidade e segurança** 

### **Modelo de dados inicial** 

|**Entidade**|**Informações principais**|**Relações relevantes**|
|---|---|---|
|Usuário|ID, nome, e-mail, perfil e credencial<br>protegida em produção.|Cria e atualiza ocorrências, tarefas e<br>manutenções.|
|Ocorrência|ID, descrição, categoria, prioridade, piso,<br>localização, status e responsável.|Origina tarefas e aparece na Central de<br>Controle.|
|Tarefa|ID, ocorrência vinculada, responsável,<br>prazo, status e atualizações.|Mantém o andamento do atendimento.|
|Equipamento|ID, identificação, tipo, piso, localização e<br>condição.|Possui agenda e histórico de manutenção.|



SmartMall Ops AI  |  Documentação inicial Página 10 

|**Entidade**|**Informações principais**|**Relações relevantes**|
|---|---|---|
|Manutenção|ID, equipamento, data prevista, execução,<br>responsável e status.|Possui checklist e evidências.|
|Checklist|Itens verificados, observações, evidências e<br>resultado.|Vinculado a uma manutenção.|
|Piso|ID, nome validado, referência visual e<br>coordenadas de marcadores.|Agrupa ocorrências e equipamentos na<br>Central.|



### **Requisitos não funcionais** 

|**ID**|**Requisito**|
|---|---|
|RNF01|A interface deve usar HTML5 válido, estrutura semântica e<br>rótulos compreensíveis nos formulários.|
|RNF02|A lógica principal do MVP deve ser desenvolvida em JavaScript.|
|RNF03|A aplicação deve manter leitura e operação adequadas em telas<br>de computador, tablet e smartphone.|
|RNF04|Dados de formulário devem receber validação no cliente e,<br>quando houver servidor, também no servidor.|
|RNF05|Ações protegidas em produção devem validar autenticação e<br>autorização no servidor; sessionStorage não é solução de<br>produção.|
|RNF06|Atualizações de ocorrência, tarefa e manutenção devem formar<br>uma trilha de auditoria.|
|RNF07|Dados, rotas, indicadores e classificações simulados devem ser<br>identificados na interface.|
|RNF08|O código e a documentação devem ser versionados no GitHub.|
|RNF09|O fluxo principal deve possuir critérios de aceitação e casos de<br>teste executáveis ou registrados.|



SmartMall Ops AI  |  Documentação inicial Página 11 

## **8 Agentes de apoio ao desenvolvimento** 

Os agentes de PO, programação e testes são uma proposta de apoio ao planejamento, à implementação e à qualidade. A tecnologia sorteada, confirmada pela equipe, é HTML5. A adoção dos agentes é opcional e depende de revisão humana. 

|**Agente proposto**|**Responsabilidade**|**Entrada**|**Saída esperada**|**Controle humano**|
|---|---|---|---|---|
|PO|Transformar necessidades<br>em requisitos, priorizar o<br>escopo e registrar critérios<br>de aceitação.|Objetivos do MVP e<br>feedback da equipe.|Histórias, critérios e lista<br>priorizada.|Equipe aprova prioridade e<br>escopo.|
|Programação|Apoiar a implementação<br>em JavaScript e HTML5,<br>sugerir organização e<br>corrigir defeitos<br>identificados.|Requisito aprovado e<br>contexto do repositório.|Código, explicação de<br>mudanças e testes locais<br>sugeridos.|Pessoa desenvolvedora<br>revisa e integra.|
|Testes|Criar casos de teste,<br>verificar requisitos e<br>registrar falhas ou<br>regressões.|Critérios de aceitação e<br>versão disponível.|Evidências de teste e lista<br>de defeitos.|Equipe valida severidade e<br>aceite.|



### **Fluxo de colaboração proposto** 

5. Uma pessoa da equipe descreve a necessidade e define a decisão de negócio que precisa ser tomada. 

6. O agente de PO devolve requisito, critérios de aceitação e prioridade para revisão humana. 

7. Após aprovação, o agente de programação apoia a mudança delimitada e a equipe revisa o resultado no repositório. 

8. O agente de testes cria e executa ou descreve os testes, mantendo o resultado vinculado ao requisito. 

9. A equipe humana decide o aceite, registra limitações e autoriza a demonstração. 

Os agentes não devem receber segredos, credenciais de produção ou autorização para publicar, mesclar ou aprovar mudanças sem a confirmação explícita da equipe. 

## **9 Descrição de como a tecnologia ou prática sorteada será incorporada à solução** 

Tecnologia sorteada confirmada: HTML5. Sua incorporação ocorre diretamente na interface web do SmartMall Ops AI, nos módulos existentes e nas telas propostas nesta documentação. 

### **Aplicação de HTML5 na solução** 

O HTML5 estrutura as telas de acesso, dashboard, ocorrências, Central de Controle, tarefas, ativos, manutenção preventiva e histórico. Serão usados elementos semânticos como header, nav, main, section e footer, com títulos hierárquicos para organizar conteúdo e navegação. Os formulários usarão label, input, select, textarea e button, com tipos adequados e atributos required, minlength e maxlength quando aplicáveis. A validação nativa melhora o preenchimento e será complementada por JavaScript e, quando houver backend, por validação no servidor. 

Na Central de Controle, o documento HTML5 integra o SVG do diagrama operacional e os controles de seleção de piso e detalhes dos marcadores. CSS define a apresentação responsiva e JavaScript controla filtros, estados e interações. A acessibilidade será apoiada por rótulos associados aos campos, textos 

SmartMall Ops AI  |  Documentação inicial Página 12 

alternativos, ordem de foco e operação por teclado. O uso de HTML5 já é confirmado no protótipo; formulários e telas ainda planejados seguirão essa mesma base. 

### **Evidências mínimas para a demonstração** 

- Código-fonte com declaração <!DOCTYPE html>, idioma pt-BR, metadados de codificação e viewport e elementos semânticos. 

- Demonstração de formulário com rótulos, campos obrigatórios, tipos de entrada adequados e mensagens de validação. 

- Verificação de navegação por teclado, hierarquia de títulos e leitura em computador, tablet e smartphone. 

- Registro no GitHub das telas HTML5, critérios de aceitação e resultados dos testes da jornada principal. 

Critério de aceite: demonstrar a estrutura HTML5 das telas e seu uso nos formulários e na Central de Controle, vinculando código, comportamento e evidências. Agentes de PO, programação e testes permanecem como apoio opcional descrito na seção 8. 

SmartMall Ops AI  |  Documentação inicial Página 13 

## **10 Plano de 30 horas e validação** 

O plano prioriza o fluxo completo de ocorrência e evita prometer integrações que não possam ser demonstradas com segurança. As horas são estimativas para uma equipe que parte do protótipo já existente. 

|**Bloco**|**Atividades**|**Entrega observável**|**Horas**|
|---|---|---|---|
|1 Base e escopo|Conferir repositório, registrar o<br>estado atual, organizar backlog<br>P0 e preparar ambiente de<br>demonstração.|Escopo aprovado e ambiente<br>local reproduzível.|2|
|2 Ocorrências|Completar captura,<br>classificação por regras ou<br>serviço controlado, aprovação,<br>atribuição e encerramento.|Fluxo Registrar a Encerrar<br>demonstrável.|6|
|3 Central de Controle|Consolidar navegação por pisos,<br>marcadores e painel de<br>detalhes; validar a sinalização<br>de dados simulados.|Ocorrência e ativo localizados<br>em piso selecionado.|5|
|4 Manutenção preventiva|Cadastrar ativos<br>demonstrativos, agenda, alerta<br>de prazo e checklist simples.|Revisão agendada e execução<br>registrada.|5|
|5 Dados e integração|Persistir dados locais ou<br>implementar somente o<br>backend estritamente<br>necessário, com validação e<br>trilha de histórico.|Dados preservados conforme<br>solução escolhida.|4|
|6 Qualidade|Executar casos de teste, corrigir<br>falhas P0 e conferir permissões<br>de demonstração e mensagens<br>de limite.|Evidências de teste e lista de<br>limitações.|4|
|7 Apresentação|Revisar narrativa, dados<br>sintéticos, documentação e<br>roteiro de demonstração.|Demonstração coerente e<br>documentação atualizada.|4|



**Total previsto:** 30 horas. 

### **Critérios mínimos de validação do MVP** 

- Uma pessoa registra uma ocorrência com descrição e localização demonstrativas. 

- A aplicação sugere categoria, prioridade e equipe; um Administrador ou Supervisor revisa antes da atribuição. 

- A ocorrência aparece na Central de Controle no piso selecionado, com aviso quando a marcação ou rota for simulada. 

- Uma manutenção preventiva é agendada para um equipamento e sua execução pode ser registrada em checklist demonstrativo. 

- A tarefa possui responsável, atualização e encerramento com resolução registrada. 

- O resultado dos testes principais e as limitações do protótipo são apresentados à equipe avaliadora. 

SmartMall Ops AI  |  Documentação inicial Página 14 

### **Riscos de escopo e tratamento** 

|**Risco**|**Tratamento**|
|---|---|
|Backend, persistência e IA consumirem mais tempo que o<br>disponível|Manter o fluxo demonstrável no cliente, usar dados locais<br>identificados e implementar servidor apenas para a necessidade<br>comprovada.|
|Rotas e tempos serem interpretados como dados reais|Rotular trajetos, posições e estimativas como simulação; não<br>apresentar cálculo físico validado sem levantamento.|
|Uso de HTML5 sem evidência demonstrável|Vincular a estrutura semântica, os formulários e o SVG às telas<br>demonstradas e registrar os resultados de validação.|
|Checklist ser confundido com procedimento técnico oficial|Usar checklist demonstrativo e indicar a necessidade de<br>definição por profissionais habilitados.|



## **11 Próximos passos** 

10. Validar e registrar as evidências de incorporação de HTML5, tecnologia sorteada confirmada, conforme a seção 9. 

11. Definir quais pisos e quais elementos da planta serão usados na demonstração, validando nomenclatura e limitações de rota. 

12. Priorizar RF03 a RF06 e RF08 como jornada mínima integrada antes de expandir alertas, histórico e análise de recorrência. 

13. Escolher de forma explícita entre persistência local para demonstração e um backend mínimo, mantendo a decisão registrada no repositório. 

14. Executar os casos de teste do fluxo principal e atualizar o documento para refletir apenas funcionalidades efetivamente implementadas. 

## **12 Referências de verificação** 

Repositório do projeto: https://github.com/Matheus7Carvalho/smartmall-ops-ia README verificado: https://github.com/Matheus7Carvalho/smartmall-ops-ia/blob/main/README.md 

Consulta realizada em 13 de novembro de 2026. As informações sobre a conversa de requisitos foram incorporadas como contexto de projeto e identificadas como proposta quando não verificáveis no repositório. 

SmartMall Ops AI  |  Documentação inicial Página 15 

