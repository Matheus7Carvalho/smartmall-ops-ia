(() => {
  "use strict";

  const USERS = Object.freeze([
    {
      email: "admin@smartmall.local",
      password: "demo123",
      name: "Rafael Mendes",
      role: "Administrador",
      initials: "RM",
      permissions: ["dashboard", "control", "occurrences", "tasks", "equipment", "teams", "users", "reports"],
      description: "Você possui acesso administrativo aos indicadores, equipes e permissões do ambiente demonstrativo.",
    },
    {
      email: "supervisor@smartmall.local",
      password: "demo123",
      name: "Ana Souza",
      role: "Supervisora Operacional",
      initials: "AS",
      permissions: ["dashboard", "control", "occurrences", "tasks", "equipment", "teams", "reports"],
      description: "Você pode acompanhar a operação, revisar ocorrências e coordenar equipes.",
    },
    {
      email: "funcionario@smartmall.local",
      password: "demo123",
      name: "João Costa",
      role: "Funcionário",
      initials: "JC",
      permissions: ["dashboard", "occurrences", "tasks", "equipment"],
      description: "Você pode consultar sua operação, tarefas e o estado dos equipamentos.",
    },
  ]);

  const TEAMS = Object.freeze([
    { id: "joao", name: "João Costa", initials: "JC", specialty: "Climatização / HVAC", available: true, openTasks: 0 },
    { id: "pedro", name: "Pedro Lima", initials: "PL", specialty: "Climatização / HVAC", available: false, openTasks: 2 },
    { id: "luana", name: "Luana Freitas", initials: "LF", specialty: "Hidráulica", available: true, openTasks: 1 },
    { id: "maria", name: "Maria Souza", initials: "MS", specialty: "Limpeza", available: true, openTasks: 0 },
    { id: "elisa", name: "Elisa Rocha", initials: "ER", specialty: "Segurança", available: true, openTasks: 0 },
    { id: "caio", name: "Caio Nunes", initials: "CN", specialty: "Infraestrutura", available: true, openTasks: 1 },
  ]);

  const SUPERVISORY_ROLES = new Set(["Administrador", "Supervisora Operacional"]);
  const storageKey = "smartmall-ops-ia-demo-session";

  const authView = document.querySelector("#auth-view");
  const appView = document.querySelector("#app-view");
  const dashboardContent = document.querySelector(".dashboard-content");
  const controlView = document.querySelector("#control-view");
  const occurrencesView = document.querySelector("#occurrences-view");
  const tasksView = document.querySelector("#tasks-view");
  const tasksTitle = document.querySelector("#tasks-title");
  const tasksSubtitle = document.querySelector("#tasks-subtitle");
  const tasksAssignee = document.querySelector("#tasks-assignee");
  const tasksBoardSummary = document.querySelector("#tasks-board-summary");
  const tasksFeedback = document.querySelector("#tasks-feedback");
  const tasksBoard = document.querySelector("#tasks-board");
  const equipmentView = document.querySelector("#equipment-view");
  const teamsView = document.querySelector("#teams-view");
  const teamsPresentCount = document.querySelector("#teams-present-count");
  const teamsAvailableCount = document.querySelector("#teams-available-count");
  const teamsBusyCount = document.querySelector("#teams-busy-count");
  const teamsOfflineCount = document.querySelector("#teams-offline-count");
  const teamsPresentGroupCount = document.querySelector("#teams-present-group-count");
  const teamsAvailableGroupCount = document.querySelector("#teams-available-group-count");
  const teamsBusyGroupCount = document.querySelector("#teams-busy-group-count");
  const teamsPresentList = document.querySelector("#teams-present-list");
  const teamsAvailableList = document.querySelector("#teams-available-list");
  const teamsBusyList = document.querySelector("#teams-busy-list");
  const inventoryStockSelect = document.querySelector("#inventory-stock-select");
  const inventoryTotalItems = document.querySelector("#inventory-total-items");
  const inventoryTotalUnits = document.querySelector("#inventory-total-units");
  const inventoryLowStock = document.querySelector("#inventory-low-stock");
  const inventoryDetailName = document.querySelector("#inventory-detail-name");
  const inventoryDetailStatus = document.querySelector("#inventory-detail-status");
  const inventoryDetailQuantity = document.querySelector("#inventory-detail-quantity");
  const inventoryDetailUnit = document.querySelector("#inventory-detail-unit");
  const inventoryDetailCode = document.querySelector("#inventory-detail-code");
  const inventoryDetailMinimum = document.querySelector("#inventory-detail-minimum");
  const inventoryDetailCategory = document.querySelector("#inventory-detail-category");
  const inventoryDetailLocation = document.querySelector("#inventory-detail-location");
  const inventoryDetailDescription = document.querySelector("#inventory-detail-description");
  const inventoryDetailDropdown = document.querySelector("#inventory-detail-dropdown");
  const inventoryTraceDropdown = document.querySelector("#inventory-trace-dropdown");
  const inventoryItemHistory = document.querySelector("#inventory-item-history");
  const inventorySelectedIcon = document.querySelector("#inventory-selected-icon");
  const inventorySelectedName = document.querySelector("#inventory-selected-name");
  const inventorySelectedCode = document.querySelector("#inventory-selected-code");
  const inventorySelectedQuantity = document.querySelector("#inventory-selected-quantity");
  const inventorySelectedUnit = document.querySelector("#inventory-selected-unit");
  const inventoryEntryModal = document.querySelector("#inventory-entry-modal");
  const inventoryWithdrawalModal = document.querySelector("#inventory-withdrawal-modal");
  const inventoryEntryForm = document.querySelector("#inventory-entry-form");
  const inventoryWithdrawalForm = document.querySelector("#inventory-withdrawal-form");
  const inventoryEntryMessage = document.querySelector("#inventory-entry-message");
  const inventoryWithdrawalMessage = document.querySelector("#inventory-withdrawal-message");
  const inventoryWithdrawalItem = document.querySelector("#inventory-withdrawal-item");
  const inventoryWithdrawalQuantity = document.querySelector("#inventory-withdrawal-quantity");
  const inventoryWithdrawalReason = document.querySelector("#inventory-withdrawal-reason");
  const inventoryWithdrawalStock = document.querySelector("#inventory-withdrawal-stock");
  const emailField = document.querySelector("#email");
  const passwordField = document.querySelector("#password");
  const loginError = document.querySelector("#login-error");

  const occurrenceForm = document.querySelector("#occurrence-form");
  const incidentPhoto = document.querySelector("#incident-photo");
  const photoPreview = document.querySelector("#photo-preview");
  const incidentDescription = document.querySelector("#incident-description");
  const incidentLocation = document.querySelector("#incident-location");
  const incidentFormMessage = document.querySelector("#incident-form-message");
  const analysisEmpty = document.querySelector("#analysis-empty");
  const analysisResult = document.querySelector("#analysis-result");
  const aiCategory = document.querySelector("#ai-category");
  const aiPriority = document.querySelector("#ai-priority");
  const priorityRules = document.querySelector("#priority-rules");
  const priorityExplanation = document.querySelector("#priority-explanation");
  const teamCount = document.querySelector("#team-count");
  const teamSuggestions = document.querySelector("#team-suggestions");
  const workflowState = document.querySelector("#workflow-state");
  const supervisorApproval = document.querySelector("#supervisor-approval");
  const supervisorCheck = document.querySelector("#supervisor-check");
  const approveAssignment = document.querySelector("#approve-assignment");
  const taskControls = document.querySelector("#task-controls");
  const taskUpdate = document.querySelector("#task-update");
  const startTask = document.querySelector("#start-task");
  const saveUpdate = document.querySelector("#save-update");
  const completionField = document.querySelector("#completion-field");
  const completionNote = document.querySelector("#completion-note");
  const resolveTask = document.querySelector("#resolve-task");
  const auditLog = document.querySelector("#audit-log");
  const steps = [...document.querySelectorAll(".occurrence-steps li")];

  const controlQueueList = document.querySelector("#control-queue-list");
  const controlQueueCount = document.querySelector("#control-queue-count");
  const controlActiveCount = document.querySelector("#control-active-count");
  const controlActiveSupport = document.querySelector("#control-active-support");
  const controlTeamCount = document.querySelector("#control-team-count");
  const controlTeamList = document.querySelector("#control-team-list");
  const controlMapMode = document.querySelector("#control-map-mode");
  const controlMapContext = document.querySelector("#control-map-context");
  const controlMapRoute = document.querySelector("#control-map-route");
  const controlTeamMarker = document.querySelector("#control-team-marker");
  const controlIncidentMarker = document.querySelector("#control-incident-marker");
  const controlMapMarkerLabel = document.querySelector("#control-map-marker-label");
  const controlMapCaption = document.querySelector("#control-map-caption");
  const controlMapStageNote = document.querySelector("#control-map-stage-note");
  const operationalMap = document.querySelector("#operational-map");
  const controlDetailTitle = document.querySelector("#control-detail-title");
  const controlDetailStatus = document.querySelector("#control-detail-status");
  const controlDetailPriority = document.querySelector("#control-detail-priority");
  const controlDetailName = document.querySelector("#control-detail-name");
  const controlDetailDescription = document.querySelector("#control-detail-description");
  const controlDetailLocation = document.querySelector("#control-detail-location");
  const controlDetailResponse = document.querySelector("#control-detail-response");
  const controlDetailSuggestion = document.querySelector("#control-detail-suggestion");
  const controlDetailInitials = document.querySelector("#control-detail-initials");
  const controlDetailTeam = document.querySelector("#control-detail-team");
  const controlDetailSpecialty = document.querySelector("#control-detail-specialty");
  const controlProgressLabel = document.querySelector("#control-progress-label");
  const controlProgressNote = document.querySelector("#control-progress-note");
  const controlActionMessage = document.querySelector("#control-action-message");
  const controlPrimaryAction = document.querySelector("#control-primary-action");
  const controlReassignButton = document.querySelector("#control-reassign-button");
  const controlEvidenceButton = document.querySelector("#control-evidence-button");
  const controlResolutionLabel = document.querySelector("#control-resolution-label");
  const controlResolutionNote = document.querySelector("#control-resolution-note");
  const controlResolveButton = document.querySelector("#control-resolve-button");
  const controlHistoryList = document.querySelector("#control-history-list");
  const controlFloor = document.querySelector("#control-floor");
  const controlTabs = [...document.querySelectorAll("[data-control-tab]")];

  const publicReportButton = document.querySelector("#public-report-button");
  const modalStepButtons = [...document.querySelectorAll("[data-modal-step] button")];
  const modalFlowSummary = document.querySelector("#modal-flow-summary");
  const publicRegistrationForm = document.querySelector("#public-registration-form");
  const publicIncidentMedia = document.querySelector("#public-incident-media");
  const publicMediaPreview = document.querySelector("#public-media-preview");
  const publicIncidentDescription = document.querySelector("#public-incident-description");
  const publicIncidentLocation = document.querySelector("#public-incident-location");
  const publicRegistrationMessage = document.querySelector("#public-registration-message");
  const qrLocationPanel = document.querySelector("#qr-location-panel");
  const qrLocationDescription = document.querySelector("#qr-location-description");
  const modalAnalysisCategory = document.querySelector("#modal-analysis-category");
  const modalAnalysisPriority = document.querySelector("#modal-analysis-priority");
  const modalAnalysisTeam = document.querySelector("#modal-analysis-team");
  const modalAnalysisLocation = document.querySelector("#modal-analysis-location");
  const modalAnalysisRules = document.querySelector("#modal-analysis-rules");
  const modalAnalysisExplanation = document.querySelector("#modal-analysis-explanation");
  const modalAnalysisMessage = document.querySelector("#modal-analysis-message");
  const modalAnalysisNext = document.querySelector("#modal-analysis-next");
  const modalApprovalAccess = document.querySelector("#modal-approval-access");
  const modalApprovalReview = document.querySelector("#modal-approval-review");
  const modalApprovalTitle = document.querySelector("#modal-approval-title");
  const modalApprovalPriority = document.querySelector("#modal-approval-priority");
  const modalApprovalTeam = document.querySelector("#modal-approval-team");
  const modalApprovalCheck = document.querySelector("#modal-approval-check");
  const modalApprovalUser = document.querySelector("#modal-approval-user");
  const modalApprovalMessage = document.querySelector("#modal-approval-message");
  const modalApproveButton = document.querySelector("#modal-approve-button");
  const modalExecutionAccess = document.querySelector("#modal-execution-access");
  const modalExecutionForm = document.querySelector("#modal-execution-form");
  const modalExecutionTitle = document.querySelector("#modal-execution-title");
  const modalExecutionTeam = document.querySelector("#modal-execution-team");
  const modalExecutionLocation = document.querySelector("#modal-execution-location");
  const modalExecutionRoute = document.querySelector("#modal-execution-route");
  const modalExecutionMaterials = document.querySelector("#modal-execution-materials");
  const modalStartExecution = document.querySelector("#modal-start-execution");
  const modalExecutionDescriptionLabel = document.querySelector("#modal-execution-description-label");
  const modalExecutionDescription = document.querySelector("#modal-execution-description");
  const modalExecutionCostLabel = document.querySelector("#modal-execution-cost-label");
  const modalExecutionCost = document.querySelector("#modal-execution-cost");
  const modalExecutionMessage = document.querySelector("#modal-execution-message");
  const modalSendToClose = document.querySelector("#modal-send-to-close");
  const modalCloseTechnician = document.querySelector("#modal-close-technician");
  const modalCloseDuration = document.querySelector("#modal-close-duration");
  const modalCloseCost = document.querySelector("#modal-close-cost");
  const modalCloseHistory = document.querySelector("#modal-close-history");
  const modalCloseAccess = document.querySelector("#modal-close-access");
  const modalCloseUser = document.querySelector("#modal-close-user");
  const modalCloseMessage = document.querySelector("#modal-close-message");
  const modalFinalizeButton = document.querySelector("#modal-finalize-button");
  const flowDialogs = Object.freeze({
    register: document.querySelector("#modal-register"),
    analyze: document.querySelector("#modal-analyze"),
    approve: document.querySelector("#modal-approve"),
    execute: document.querySelector("#modal-execute"),
    close: document.querySelector("#modal-close"),
  });

  let currentUser = null;
  let photoUrl = "";
  let publicMediaUrl = "";
  let qrRegistrationActive = false;

  class OccurrenceWorkflow {
    constructor() {
      this.reset();
    }

    reset() {
      this.state = "draft";
      this.analysis = null;
      this.selectedTeamId = "";
      this.history = [{ time: "Agora", message: "Fluxo de demonstração iniciado." }];
    }

    addAudit(message) {
      this.history.push({
        time: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
        message,
      });
    }

    classify(description, location) {
      const text = `${description} ${location}`.toLocaleLowerCase("pt-BR");
      const has = (expression) => expression.test(text);
      let category = "Infraestrutura geral";
      let specialty = "Infraestrutura";
      let priority = "Média";
      const rules = ["Descrição com informação suficiente para uma triagem inicial."];
      let explanation = "Prioridade média por impacto operacional ainda sem sinal de emergência identificado.";

      if (has(/fumaça|incêndio|evacua|explos|cheiro de queimado|choque|faísca|curto/)) {
        category = "Segurança / risco imediato";
        specialty = "Segurança";
        priority = "Crítica";
        rules.unshift("Termo de risco imediato identificado: exige protocolo de segurança e validação humana.");
        explanation = "Prioridade crítica porque o relato pode indicar risco à segurança. A sugestão não substitui o protocolo de emergência.";
      } else if (has(/ar[ -]?condicionado|climatiza|calor|temperatura|refrigera/)) {
        category = "Infraestrutura › Climatização";
        specialty = "Climatização / HVAC";
        priority = location === "Praça de Alimentação" ? "Alta" : "Média";
        rules.unshift("Palavras-chave associadas à climatização direcionam a triagem para a equipe HVAC.");
        if (location === "Praça de Alimentação") {
          rules.push("Área de alimentação recebe impacto elevado por fluxo de visitantes e conforto térmico.");
          explanation = "Prioridade alta pela combinação de falha de climatização e área de alimentação.";
        } else {
          explanation = "Prioridade média: falha de climatização fora de área de fluxo elevado.";
        }
      } else if (has(/vazamento|água|alagamento|torneira|esgoto|infiltra/)) {
        category = "Infraestrutura › Hidráulica";
        specialty = "Hidráulica";
        priority = has(/alagamento|escorrega|grande/) || location.includes("Banheiro") ? "Alta" : "Média";
        rules.unshift("Termos relacionados a água e vazamento encaminham para a especialidade hidráulica.");
        rules.push("Risco de piso molhado ou interrupção de uso aumenta a prioridade de atendimento.");
        explanation = priority === "Alta"
          ? "Prioridade alta pelo possível risco de queda e impacto de uso do espaço."
          : "Prioridade média: vazamento reportado sem sinal de risco ampliado.";
      } else if (has(/lixo|sujeira|limpeza|derramado|higieniza/)) {
        category = "Serviços › Limpeza";
        specialty = "Limpeza";
        priority = has(/vidro|químico|escorrega/) ? "Alta" : "Baixa";
        rules.unshift("Termos ligados à conservação do ambiente direcionam a triagem para a equipe de limpeza.");
        explanation = priority === "Alta"
          ? "Prioridade alta por possível risco de acidente no local."
          : "Prioridade baixa por não haver risco ou interrupção operacional descritos.";
      } else {
        rules.unshift("Não houve correspondência de alto risco; a ocorrência segue para infraestrutura geral.");
      }

      const eligibleTeams = TEAMS
        .filter((team) => team.available && team.specialty === specialty)
        .sort((first, second) => first.openTasks - second.openTasks);

      this.analysis = { category, specialty, priority, rules, explanation, eligibleTeams };
      this.selectedTeamId = eligibleTeams[0]?.id || "";
      this.state = "review";
      this.addAudit(`Ocorrência registrada em ${location}.`);
      this.addAudit(`Triagem local sugeriu ${category} com prioridade ${priority}.`);
      return this.analysis;
    }

    selectTeam(teamId) {
      if (!this.analysis?.eligibleTeams.some((team) => team.id === teamId)) return false;
      this.selectedTeamId = teamId;
      const team = TEAMS.find((candidate) => candidate.id === teamId);
      this.addAudit(`Responsável sugerido revisado para ${team.name}.`);
      return true;
    }

    approve(user) {
      if (this.state !== "review" || !this.selectedTeamId || !SUPERVISORY_ROLES.has(user.role)) return false;
      const team = TEAMS.find((candidate) => candidate.id === this.selectedTeamId);
      this.state = "assigned";
      this.addAudit(`${user.name} aprovou e atribuiu a tarefa para ${team.name}.`);
      return true;
    }

    start() {
      if (this.state !== "assigned") return false;
      this.state = "in_progress";
      this.addAudit("Atendimento iniciado pela equipe responsável.");
      return true;
    }

    update(message) {
      if (this.state !== "in_progress" || !message.trim()) return false;
      this.addAudit(`Atualização registrada: ${message.trim()}`);
      return true;
    }

    resolve(note) {
      if (this.state !== "in_progress" || note.trim().length < 8) return false;
      this.state = "resolved";
      this.addAudit(`Ocorrência encerrada com a resolução: ${note.trim()}`);
      return true;
    }
  }

  const occurrence = new OccurrenceWorkflow();

  const CONTROL_ROSTER = Object.freeze([
    { id: "joao", name: "João Costa", initials: "JC", specialty: "Climatização / HVAC", available: true, openTasks: 1 },
    { id: "marcos", name: "Marcos Vinicius", initials: "MV", specialty: "Climatização / HVAC", available: true, openTasks: 0 },
    { id: "luana", name: "Luana Freitas", initials: "LF", specialty: "Hidráulica", available: true, openTasks: 1 },
    { id: "maria", name: "Maria Souza", initials: "MS", specialty: "Limpeza", available: true, openTasks: 0 },
    { id: "elisa", name: "Elisa Rocha", initials: "ER", specialty: "Segurança", available: true, openTasks: 0 },
    { id: "caio", name: "Caio Nunes", initials: "CN", specialty: "Infraestrutura", available: false, openTasks: 2 },
  ]);

  const CONTROL_INCIDENT_TEMPLATES = Object.freeze([
    {
      id: "2417",
      title: "Falha na climatização",
      category: "Climatização / HVAC",
      location: "Praça de Alimentação · Piso L1",
      shortLocation: "Praça de Alimentação",
      priority: "Alta",
      priorityClass: "high",
      state: "in_progress",
      teamId: "joao",
      candidateIds: ["joao", "marcos"],
      response: "6 min",
      age: "há 2 min",
      description: "O ar-condicionado da praça de alimentação parou de funcionar e o ambiente está muito quente.",
      suggestion: "Equipe HVAC recomendada por especialidade, disponibilidade e proximidade simulada.",
      map: {
        zone: "zone-food",
        x: 542,
        y: 244,
        teamX: 250,
        teamY: 309,
        route: "M250 309C335 308 366 243 519 244",
        captionX: 365,
        captionY: 355,
        caption: "350 m · 6 min estimados",
      },
      history: [
        { time: "há 2 min", message: "Ocorrência registrada na Praça de Alimentação." },
        { time: "há 1 min", message: "Encaminhamento HVAC aprovado pela supervisão." },
        { time: "Agora", message: "Equipe em atendimento; rota estimada exibida no mapa." },
      ],
    },
    {
      id: "2416",
      title: "Vazamento de água",
      category: "Infraestrutura / Hidráulica",
      location: "Banheiro · Piso L1",
      shortLocation: "Banheiro · Piso L1",
      priority: "Média",
      priorityClass: "medium",
      state: "assigned",
      teamId: "luana",
      candidateIds: ["luana", "caio"],
      response: "4 min",
      age: "há 11 min",
      description: "Há vazamento próximo aos lavatórios; a área foi sinalizada e aguarda atendimento técnico.",
      suggestion: "Equipe hidráulica sugerida pela natureza do chamado e disponibilidade demonstrativa.",
      map: {
        zone: "zone-bathrooms",
        x: 154,
        y: 298,
        teamX: 284,
        teamY: 286,
        route: "M284 286C245 285 215 296 177 298",
        captionX: 207,
        captionY: 345,
        caption: "210 m · 4 min estimados",
      },
      history: [
        { time: "há 11 min", message: "Ocorrência registrada no Banheiro do Piso L1." },
        { time: "há 8 min", message: "Equipe hidráulica atribuída pela supervisão." },
      ],
    },
    {
      id: "2415",
      title: "Limpeza necessária",
      category: "Serviços / Limpeza",
      location: "Corredor · Piso L2",
      shortLocation: "Corredor · Piso L2",
      priority: "Baixa",
      priorityClass: "low",
      state: "review",
      teamId: "maria",
      candidateIds: ["maria"],
      response: "12 min",
      age: "há 24 min",
      description: "A área do corredor requer limpeza de rotina. Não foram informados riscos imediatos.",
      suggestion: "Equipe de limpeza sugerida por especialidade e menor carga atual.",
      map: {
        zone: "zone-corridor",
        x: 330,
        y: 223,
        teamX: 402,
        teamY: 302,
        route: "M402 302C382 278 361 250 347 229",
        captionX: 350,
        captionY: 355,
        caption: "180 m · 12 min estimados",
      },
      history: [
        { time: "há 24 min", message: "Ocorrência registrada no corredor do Piso L2." },
        { time: "há 22 min", message: "Sugestão de equipe preparada para revisão humana." },
      ],
    },
  ]);

  const CONTROL_STATE_LABELS = Object.freeze({
    review: "Aguardando aprovação",
    assigned: "Atribuída",
    in_progress: "Em atendimento",
    resolved: "Concluída",
  });

  class ControlCenter {
    constructor() {
      this.reset();
    }

    reset() {
      this.incidents = CONTROL_INCIDENT_TEMPLATES.map((incident) => ({
        ...incident,
        map: { ...incident.map },
        history: incident.history.map((entry) => ({ ...entry })),
      }));
      this.selectedId = "2417";
    }

    get activeIncidents() {
      return this.incidents.filter((incident) => incident.state !== "resolved");
    }

    get selected() {
      return this.incidents.find((incident) => incident.id === this.selectedId)
        || this.activeIncidents[0]
        || null;
    }

    getTeam(teamId) {
      return CONTROL_ROSTER.find((team) => team.id === teamId) || null;
    }

    addHistory(incident, message) {
      incident.history.push({
        time: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
        message,
      });
    }

    select(incidentId) {
      if (!this.activeIncidents.some((incident) => incident.id === incidentId)) return false;
      this.selectedId = incidentId;
      return true;
    }

    primaryAction(user, note) {
      const incident = this.selected;
      if (!incident || !SUPERVISORY_ROLES.has(user?.role)) {
        return { success: false, message: "Esta ação exige um perfil de Administrador ou Supervisora Operacional." };
      }

      if (incident.state === "review") {
        incident.state = "assigned";
        this.addHistory(incident, `${user.name} aprovou e atribuiu a ocorrência à equipe sugerida.`);
        return { success: true, message: "Encaminhamento aprovado e tarefa atribuída." };
      }

      if (incident.state === "assigned") {
        incident.state = "in_progress";
        this.addHistory(incident, `${user.name} iniciou o atendimento supervisionado.`);
        return { success: true, message: "Atendimento iniciado. Registre a evolução antes de encerrar." };
      }

      if (incident.state === "in_progress") {
        if (!note.trim()) return { success: false, message: "Descreva a atualização antes de registrá-la no histórico." };
        this.addHistory(incident, `Atualização registrada: ${note.trim()}`);
        return { success: true, message: "Atualização adicionada ao histórico local." };
      }

      return { success: false, message: "Esta ocorrência já foi concluída." };
    }

    reassign(user) {
      const incident = this.selected;
      if (!incident || !SUPERVISORY_ROLES.has(user?.role)) {
        return { success: false, message: "A reatribuição requer um perfil supervisor ou administrador." };
      }
      const choices = CONTROL_ROSTER.filter((team) => incident.candidateIds.includes(team.id) && team.available);
      if (choices.length < 2) return { success: false, message: "Não há outra equipe compatível disponível nesta demonstração." };
      const currentIndex = choices.findIndex((team) => team.id === incident.teamId);
      const nextTeam = choices[(currentIndex + 1) % choices.length];
      incident.teamId = nextTeam.id;
      this.addHistory(incident, `${user.name} reatribuiu a ocorrência para ${nextTeam.name}.`);
      return { success: true, message: `Responsável atualizado para ${nextTeam.name}.` };
    }

    registerEvidence(user) {
      const incident = this.selected;
      if (!incident || !SUPERVISORY_ROLES.has(user?.role)) {
        return { success: false, message: "O registro de evidência requer um perfil autorizado." };
      }
      this.addHistory(incident, `${user.name} registrou uma evidência demonstrativa no chamado.`);
      return { success: true, message: "Evidência demonstrativa adicionada ao histórico." };
    }

    resolve(user, note) {
      const incident = this.selected;
      if (!incident || !SUPERVISORY_ROLES.has(user?.role)) {
        return { success: false, message: "O encerramento requer um perfil supervisor ou administrador." };
      }
      if (incident.state !== "in_progress") {
        return { success: false, message: "Inicie o atendimento antes de encerrar a ocorrência." };
      }
      if (note.trim().length < 8) {
        return { success: false, message: "Informe um resumo da resolução com pelo menos 8 caracteres." };
      }
      incident.state = "resolved";
      this.addHistory(incident, `${user.name} encerrou a ocorrência: ${note.trim()}`);
      const nextIncident = this.activeIncidents[0];
      if (nextIncident) this.selectedId = nextIncident.id;
      return { success: true, message: `Ocorrência #${incident.id} concluída e removida da fila ativa.` };
    }
  }

  const controlCenter = new ControlCenter();

  const TASK_COLUMNS = Object.freeze([
    { id: "todo", label: "A Fazer" },
    { id: "in_progress", label: "Em Andamento" },
    { id: "waiting_equipment", label: "Aguardando Equipamento" },
    { id: "blocked", label: "Travada" },
    { id: "done", label: "Finalizada" },
  ]);

  class TaskBoard {
    constructor() {
      this.reset();
    }

    reset() {
      this.tasks = [
        { id: "T-2511", title: "Inspecionar AC-07", occurrence: "Manutenção preventiva", location: "Corredor L1", priority: "Média", priorityTone: "medium", assigneeEmail: "funcionario@smartmall.local", assignee: "João Costa", specialty: "Climatização / HVAC", due: "Hoje · 13:30", status: "todo", note: "Verificar ruído e limpeza do filtro." },
        { id: "T-2417", title: "Restabelecer climatização", occurrence: "Ocorrência #2417", location: "Praça de Alimentação · L1", priority: "Alta", priorityTone: "high", assigneeEmail: "funcionario@smartmall.local", assignee: "João Costa", specialty: "Climatização / HVAC", due: "Hoje · 14:30", status: "in_progress", note: "Equipe em deslocamento para diagnóstico." },
        { id: "T-2508", title: "Trocar filtro do AC-03", occurrence: "Manutenção preventiva", location: "Cobertura", priority: "Média", priorityTone: "medium", assigneeEmail: "funcionario@smartmall.local", assignee: "João Costa", specialty: "Climatização / HVAC", due: "Hoje · 16:00", status: "waiting_equipment", note: "Aguardando filtro MERV 8 no almoxarifado." },
        { id: "T-2503", title: "Acessar casa de máquinas", occurrence: "Inspeção de rotina", location: "Piso técnico", priority: "Baixa", priorityTone: "low", assigneeEmail: "funcionario@smartmall.local", assignee: "João Costa", specialty: "Climatização / HVAC", due: "Aguardando liberação", status: "blocked", note: "Acesso depende da liberação do lojista." },
        { id: "T-2499", title: "Registrar leitura térmica", occurrence: "Checklist operacional", location: "Praça de Alimentação · L1", priority: "Baixa", priorityTone: "low", assigneeEmail: "funcionario@smartmall.local", assignee: "João Costa", specialty: "Climatização / HVAC", due: "Finalizada · 09:40", status: "done", note: "Leitura dentro do parâmetro após ajuste." },
        { id: "T-2416", title: "Conter vazamento de água", occurrence: "Ocorrência #2416", location: "Banheiro · Piso L1", priority: "Alta", priorityTone: "high", assigneeEmail: "supervisor@smartmall.local", assignee: "Luana Freitas", specialty: "Hidráulica", due: "Hoje · 13:10", status: "todo", note: "Isolar área e identificar origem do vazamento." },
        { id: "T-2501", title: "Revisar elevador E2", occurrence: "Alerta preventivo", location: "Acesso norte", priority: "Média", priorityTone: "medium", assigneeEmail: "admin@smartmall.local", assignee: "Caio Nunes", specialty: "Infraestrutura", due: "Hoje · 15:00", status: "waiting_equipment", note: "Aguardando ferramenta de diagnóstico homologada." },
      ];
    }

    visibleTasks(user) {
      if (!user) return [];
      return user.role === "Funcionário"
        ? this.tasks.filter((task) => task.assigneeEmail === user.email)
        : [...this.tasks];
    }

    move(taskId, user) {
      const task = this.tasks.find((item) => item.id === taskId);
      if (!task || !user || (user.role === "Funcionário" && task.assigneeEmail !== user.email)) return null;
      const nextStatus = {
        todo: "in_progress",
        in_progress: "waiting_equipment",
        waiting_equipment: "in_progress",
        blocked: "todo",
      }[task.status];
      if (!nextStatus) return null;
      task.status = nextStatus;
      return task;
    }
  }

  const taskBoard = new TaskBoard();
  const inventoryUnitLabel = (quantity, unit) => quantity === 1 && unit === "unidades" ? "unidade" : unit;

  class InventoryLedger {
    constructor() {
      this.reset();
    }

    reset() {
      this.items = [
        { id: "inv-filter-m8", code: "HVAC-008", name: "Filtro MERV 8", description: "Filtro de ar para unidades de climatização, usado na manutenção preventiva e na melhoria da qualidade do ar.", category: "Climatização / HVAC", location: "Estante A · Prateleira 02", quantity: 4, minimum: 6, unit: "unidades" },
        { id: "inv-gas-r410", code: "HVAC-021", name: "Gás refrigerante R-410A", description: "Fluido refrigerante destinado a equipamentos de ar-condicionado compatíveis com o padrão R-410A.", category: "Climatização / HVAC", location: "Gaiola técnica · Setor 01", quantity: 12, minimum: 4, unit: "kg" },
        { id: "inv-disj-20", code: "ELE-020", name: "Disjuntor bipolar 20 A", description: "Dispositivo de proteção elétrica bipolar para substituições e intervenções corretivas autorizadas.", category: "Elétrica", location: "Estante B · Prateleira 03", quantity: 3, minimum: 3, unit: "unidades" },
        { id: "inv-seal-tape", code: "INF-012", name: "Fita de vedação", description: "Fita para vedação e acabamento de intervenções em infraestrutura e climatização.", category: "Infraestrutura", location: "Estante C · Prateleira 01", quantity: 18, minimum: 8, unit: "rolos" },
        { id: "inv-hose", code: "HID-006", name: "Mangueira flexível 1/2\"", description: "Mangueira flexível para conexões hidráulicas temporárias e substituições de manutenção.", category: "Hidráulica", location: "Estante D · Prateleira 04", quantity: 1, minimum: 3, unit: "unidades" },
      ];
      this.selectedId = "inv-filter-m8";
      this.history = [
        { id: "mov-01", time: "Hoje · 10:18", action: "Retirada", actor: "João Costa", itemId: "inv-filter-m8", message: "retirou 2 unidades para a manutenção do AC-03.", quantity: -2 },
        { id: "mov-02", time: "Hoje · 09:42", action: "Entrada", actor: "Rafael Mendes", itemId: "inv-gas-r410", message: "registrou entrada de 8 kg para reposição preventiva.", quantity: 8 },
        { id: "mov-03", time: "Ontem · 16:25", action: "Inventário", actor: "Ana Souza", itemId: "inv-hose", message: "confirmou o saldo físico no almoxarifado.", quantity: 0 },
        { id: "mov-04", time: "Ontem · 14:10", action: "Retirada", actor: "Pedro Lima", itemId: "inv-disj-20", message: "retirou 1 unidade para correção em loja técnica.", quantity: -1 },
      ];
    }

    get selected() {
      return this.items.find((item) => item.id === this.selectedId) || this.items[0] || null;
    }

    select(itemId) {
      if (this.items.some((item) => item.id === itemId)) this.selectedId = itemId;
    }

    addHistory(action, actor, itemId, message, quantity = 0) {
      this.history.unshift({
        id: `mov-${Date.now()}`,
        time: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
        action,
        actor,
        itemId,
        message,
        quantity,
      });
    }

    registerEntry(data, user) {
      const existing = this.items.find((item) => item.code.toLowerCase() === data.code.toLowerCase());
      if (existing) {
        existing.quantity += data.quantity;
        existing.minimum = data.minimum;
        existing.location = data.location;
        existing.description = data.note || existing.description;
        this.selectedId = existing.id;
        this.addHistory("Entrada", user.name, existing.id, `registrou entrada de ${data.quantity} ${inventoryUnitLabel(data.quantity, existing.unit)}. ${data.note}`.trim(), data.quantity);
        return { success: true, item: existing, message: "Entrada adicionada ao item já cadastrado." };
      }
      const item = { id: `inv-${Date.now()}`, code: data.code, name: data.name, description: data.note || "Item registrado no estoque local.", category: data.category, location: data.location, quantity: data.quantity, minimum: data.minimum, unit: "unidades" };
      this.items.unshift(item);
      this.selectedId = item.id;
      this.addHistory("Entrada", user.name, item.id, `registrou ${data.quantity} unidades no estoque. ${data.note}`.trim(), data.quantity);
      return { success: true, item, message: "Novo item registrado no estoque." };
    }

    withdraw(itemId, quantity, reason, user) {
      const item = this.items.find((candidate) => candidate.id === itemId);
      if (!item) return { success: false, message: "Selecione um item válido para retirada." };
      if (!Number.isInteger(quantity) || quantity <= 0) return { success: false, message: "Informe uma quantidade inteira maior que zero." };
      if (quantity > item.quantity) return { success: false, message: `Saldo insuficiente: há ${item.quantity} ${inventoryUnitLabel(item.quantity, item.unit)} disponível(is).` };
      item.quantity -= quantity;
      this.selectedId = item.id;
      this.addHistory("Retirada", user.name, item.id, `retirou ${quantity} ${inventoryUnitLabel(quantity, item.unit)} para ${reason}`, -quantity);
      return { success: true, item, message: "Retirada registrada e saldo atualizado." };
    }
  }

  const inventoryLedger = new InventoryLedger();

  class ModalOccurrenceFlow {
    constructor() {
      this.reset();
    }

    reset() {
      this.state = "draft";
      this.record = { description: "", location: "Praça de Alimentação", mediaName: "", mediaType: "" };
      this.analysis = null;
      this.approvedBy = null;
      this.technician = null;
      this.startedAt = null;
      this.materials = "";
      this.executionDescription = "";
      this.cost = 0;
      this.history = [{ time: "Agora", message: "Fluxo de ocorrência preparado para um novo registro." }];
    }

    addHistory(message) {
      this.history.push({
        time: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
        message,
      });
    }

    classify(description, location) {
      const text = `${description} ${location}`.toLocaleLowerCase("pt-BR");
      const has = (expression) => expression.test(text);
      let category = "Infraestrutura geral";
      let priority = "Média";
      let team = "Caio Nunes · Infraestrutura";
      let rules = ["Informações suficientes para iniciar a triagem demonstrativa."];
      let explanation = "Prioridade média por impacto operacional sem sinal de risco imediato no relato.";
      let route = "Rota estimada · 280 m · 5 min";

      if (has(/fumaça|incêndio|evacua|explos|cheiro de queimado|choque|faísca|curto/)) {
        category = "Segurança / risco imediato";
        priority = "Crítica";
        team = "Elisa Rocha · Segurança";
        rules = ["Termo de risco imediato identificado.", "O protocolo de segurança e uma decisão humana são obrigatórios."];
        explanation = "Prioridade crítica: o relato pode indicar risco a pessoas ou à operação.";
        route = "Rota estimada · 190 m · 3 min";
      } else if (has(/ar[ -]?condicionado|climatiza|calor|temperatura|refrigera/)) {
        category = "Infraestrutura / Climatização";
        priority = location === "Praça de Alimentação" ? "Alta" : "Média";
        team = "João Costa · Climatização / HVAC";
        rules = ["Termos de climatização direcionam a análise para a equipe HVAC.", "Área de alimentação eleva o impacto sobre conforto e fluxo de visitantes."];
        explanation = priority === "Alta"
          ? "Prioridade alta pela combinação de falha de climatização e área de alimentação."
          : "Prioridade média por falha de climatização fora da área de maior fluxo.";
        route = "Rota estimada · 350 m · 6 min";
      } else if (has(/vazamento|água|alagamento|torneira|esgoto|infiltra/)) {
        category = "Infraestrutura / Hidráulica";
        priority = location.includes("Banheiro") || has(/alagamento|escorrega/) ? "Alta" : "Média";
        team = "Luana Freitas · Hidráulica";
        rules = ["Termos ligados a vazamento encaminham para a equipe hidráulica.", "Possível piso molhado ou interrupção de uso aumenta a atenção necessária."];
        explanation = priority === "Alta"
          ? "Prioridade alta pelo risco potencial de queda ou alagamento."
          : "Prioridade média: vazamento sem risco ampliado informado.";
        route = "Rota estimada · 210 m · 4 min";
      } else if (has(/lixo|sujeira|limpeza|derramado|higieniza/)) {
        category = "Serviços / Limpeza";
        priority = has(/vidro|químico|escorrega/) ? "Alta" : "Baixa";
        team = "Maria Souza · Limpeza";
        rules = ["Termos relacionados à conservação do ambiente indicam a equipe de limpeza.", "Não foram relatados riscos críticos de segurança."];
        explanation = priority === "Alta"
          ? "Prioridade alta por possível risco de acidente no local."
          : "Prioridade baixa por ausência de risco ou interrupção operacional descritos.";
        route = "Rota estimada · 180 m · 12 min";
      }

      return { category, priority, team, rules, explanation, route };
    }

    register({ description, location, mediaName, mediaType }) {
      this.record = { description, location, mediaName, mediaType };
      this.analysis = this.classify(description, location);
      this.state = "analyzed";
      this.addHistory(`Ocorrência registrada em ${location}.`);
      if (mediaName) this.addHistory(`Mídia anexada ao registro: ${mediaName}.`);
      this.addHistory(`Análise demonstrativa sugeriu ${this.analysis.category} com prioridade ${this.analysis.priority}.`);
      return this.analysis;
    }

    approve(user) {
      if (this.state !== "analyzed" || !SUPERVISORY_ROLES.has(user?.role)) return false;
      this.state = "approved";
      this.approvedBy = user;
      this.addHistory(`${user.name} aprovou o encaminhamento para ${this.analysis.team}.`);
      return true;
    }

    start(user, materials) {
      if (this.state !== "approved" || !user) return false;
      this.state = "in_progress";
      this.technician = user;
      this.startedAt = new Date();
      this.materials = materials.trim();
      this.addHistory(`${user.name} iniciou a atividade técnica.`);
      if (this.materials) this.addHistory(`Materiais informados: ${this.materials}.`);
      return true;
    }

    submitExecution(user, { materials, description, cost }) {
      if (this.state !== "in_progress" || !user || description.trim().length < 8) return false;
      this.materials = materials.trim();
      this.executionDescription = description.trim();
      this.cost = Number.isFinite(cost) && cost >= 0 ? cost : 0;
      this.state = "ready_to_close";
      this.addHistory(`${user.name} registrou a execução: ${this.executionDescription}`);
      this.addHistory(`Gastos informados para a atividade: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(this.cost)}.`);
      return true;
    }

    finalize(user) {
      if (this.state !== "ready_to_close" || !SUPERVISORY_ROLES.has(user?.role)) return false;
      this.state = "closed";
      this.addHistory(`${user.name} finalizou a atividade após revisão do histórico e dos gastos.`);
      return true;
    }

    duration() {
      if (!this.startedAt) return "Ainda não iniciada";
      const minutes = Math.max(1, Math.round((Date.now() - this.startedAt.getTime()) / 60000));
      return `${minutes} min`;
    }
  }

  const modalOccurrence = new ModalOccurrenceFlow();

  const getUser = () => {
    try {
      const email = sessionStorage.getItem(storageKey);
      return USERS.find((user) => user.email === email) || null;
    } catch {
      return null;
    }
  };

  const setSession = (user) => sessionStorage.setItem(storageKey, user.email);
  const clearSession = () => sessionStorage.removeItem(storageKey);
  const canApprove = () => currentUser && SUPERVISORY_ROLES.has(currentUser.role);

  function permissionLabel(permission) {
    return ({
      dashboard: "Dashboard",
      control: "Central de Controle",
      occurrences: "Ocorrências",
      tasks: "Tarefas",
      equipment: "Equipamentos",
      teams: "Equipes",
      users: "Usuários e permissões",
      reports: "Relatórios",
    })[permission];
  }

  function navigateTo(view) {
    if (!currentUser) return;
    const availableViews = new Set(["dashboard", "control", "occurrences", "tasks", "equipment", "teams"]);
    const allowedView = availableViews.has(view) && currentUser.permissions.includes(view)
      ? view
      : "dashboard";

    dashboardContent.hidden = allowedView !== "dashboard";
    controlView.hidden = allowedView !== "control";
    occurrencesView.hidden = allowedView !== "occurrences";
    tasksView.hidden = allowedView !== "tasks";
    equipmentView.hidden = allowedView !== "equipment";
    teamsView.hidden = allowedView !== "teams";
    if (allowedView === "teams") renderTeams();
    document.querySelectorAll(".nav-item[data-view]").forEach((item) => {
      item.classList.toggle("is-active", item.dataset.view === allowedView);
    });
  }

  function setAuthenticatedView(user) {
    currentUser = user;
    authView.hidden = true;
    appView.hidden = false;
    document.querySelector("#user-name").textContent = user.name;
    document.querySelector("#user-role").textContent = user.role;
    document.querySelector("#user-initials").textContent = user.initials;
    document.querySelector("#user-first-name").textContent = user.name.split(" ")[0];
    document.querySelector("#access-badge").textContent = user.role;
    document.querySelector("#role-description").textContent = user.description;
    document.querySelector("#permission-summary").textContent = `Acesso permitido a: ${user.permissions.map(permissionLabel).join(", ")}.`;
    document.querySelectorAll("[data-permission]").forEach((item) => {
      item.hidden = !user.permissions.includes(item.dataset.permission);
    });
    renderOccurrence();
    renderControl();
    renderTasks();
    renderInventory();
    renderTeams();
    renderModalFlow();
    navigateTo("dashboard");
  }

  function setLoggedOutView() {
    currentUser = null;
    appView.hidden = true;
    authView.hidden = false;
    passwordField.value = "";
    loginError.textContent = "";
    occurrence.reset();
    controlCenter.reset();
    taskBoard.reset();
    inventoryLedger.reset();
    clearPhoto();
    renderOccurrence();
    setControlMessage("");
    renderControl();
    renderTasks();
    renderInventory();
    renderModalFlow();
    emailField.focus();
  }

  function clearPhoto() {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    photoUrl = "";
    incidentPhoto.value = "";
    photoPreview.textContent = "▧";
  }

  function setFormMessage(message = "", state = "error") {
    incidentFormMessage.textContent = message;
    incidentFormMessage.classList.toggle("is-success", Boolean(message) && state === "success");
  }

  function setModalMessage(element, message = "", state = "error") {
    element.textContent = message;
    element.classList.toggle("is-success", Boolean(message) && state === "success");
  }

  function configureQrRegistration() {
    const query = new URLSearchParams(window.location.search);
    const locationsByCode = {
      "praca-alimentacao": "Praça de Alimentação",
      "banheiro-l1": "Banheiro — Piso L1",
      "corredor-l2": "Corredor — Piso L2",
      entrada: "Entrada principal",
      estacionamento: "Estacionamento",
    };
    qrRegistrationActive = query.get("qr") === "1";
    const presetLocation = locationsByCode[query.get("local")] || "Praça de Alimentação";
    publicIncidentLocation.disabled = qrRegistrationActive;
    qrLocationPanel.hidden = !qrRegistrationActive;
    if (qrRegistrationActive) {
      publicIncidentLocation.value = presetLocation;
      qrLocationDescription.textContent = presetLocation;
    }
  }

  function currentModalStep() {
    return ({ draft: 0, analyzed: 1, approved: 2, in_progress: 3, ready_to_close: 4, closed: 4 })[modalOccurrence.state];
  }

  function renderModalSteps() {
    const step = currentModalStep();
    modalStepButtons.forEach((button, index) => {
      button.classList.toggle("is-complete", index < step || (modalOccurrence.state === "closed" && index === step));
      button.classList.toggle("is-current", index === step && modalOccurrence.state !== "closed");
    });
    const summaries = {
      draft: "Inicie um registro para encaminhar o chamado à análise.",
      analyzed: "Análise concluída. Aguardando revisão de um supervisor ou administrador.",
      approved: "Encaminhamento aprovado. A equipe técnica já pode iniciar a atividade.",
      in_progress: "Atividade em andamento. Registre materiais e a descrição do serviço executado.",
      ready_to_close: "Execução registrada. A atividade aguarda a finalização de um supervisor ou administrador.",
      closed: "Atividade finalizada. O histórico, os gastos e a equipe responsável permanecem disponíveis no encerramento.",
    };
    modalFlowSummary.textContent = summaries[modalOccurrence.state];
  }

  function renderModalAnalysis() {
    const analysis = modalOccurrence.analysis;
    modalAnalysisCategory.textContent = analysis?.category || "Aguardando registro";
    modalAnalysisPriority.textContent = analysis?.priority || "—";
    modalAnalysisTeam.textContent = analysis?.team || "—";
    modalAnalysisLocation.textContent = modalOccurrence.record.location || "—";
    modalAnalysisRules.replaceChildren(...(analysis?.rules || ["Registre uma ocorrência para iniciar a análise."]).map((rule) => {
      const item = document.createElement("li");
      item.textContent = rule;
      return item;
    }));
    modalAnalysisExplanation.textContent = analysis?.explanation || "A classificação demonstrativa será apresentada depois do registro.";
    modalAnalysisNext.disabled = !analysis;
    modalAnalysisNext.textContent = canApprove() ? "Revisar aprovação →" : "Enviar para supervisão";
  }

  function updateModalApprovalAction() {
    modalApproveButton.disabled = !(modalOccurrence.state === "analyzed" && canApprove() && modalApprovalCheck.checked);
  }

  function renderModalApproval() {
    const analysis = modalOccurrence.analysis;
    const hasReview = Boolean(analysis && modalOccurrence.state === "analyzed" && canApprove());
    modalApprovalReview.hidden = !hasReview;
    modalApprovalAccess.hidden = hasReview;
    modalApprovalCheck.checked = false;
    modalApprovalTitle.textContent = modalOccurrence.record.description || "—";
    modalApprovalPriority.textContent = analysis?.priority || "—";
    modalApprovalTeam.textContent = analysis?.team || "—";
    modalApprovalUser.textContent = canApprove()
      ? `${currentUser.name} · ${currentUser.role}`
      : "Acesso de Administrador ou Supervisora Operacional necessário";
    if (!analysis) {
      modalApprovalAccess.querySelector("b").textContent = "Aguardando análise";
      modalApprovalAccess.querySelector("p").textContent = "Registre a ocorrência e conclua a análise antes de solicitar aprovação.";
    } else if (modalOccurrence.state !== "analyzed") {
      modalApprovalAccess.querySelector("b").textContent = "Encaminhamento já processado";
      modalApprovalAccess.querySelector("p").textContent = "Acompanhe as próximas etapas do fluxo para a execução ou o encerramento.";
    } else if (!canApprove()) {
      modalApprovalAccess.querySelector("b").textContent = "Aguardando acesso autorizado";
      modalApprovalAccess.querySelector("p").textContent = "Entre com um perfil de Administrador ou Supervisora Operacional para revisar e aprovar.";
    }
    setModalMessage(modalApprovalMessage, "");
    updateModalApprovalAction();
  }

  function renderModalExecution() {
    const hasTechnicianAccess = Boolean(currentUser?.permissions.includes("occurrences"));
    const canExecute = hasTechnicianAccess && ["approved", "in_progress"].includes(modalOccurrence.state);
    modalExecutionAccess.hidden = canExecute;
    modalExecutionForm.hidden = !canExecute;
    if (!canExecute) {
      const accessTitle = modalExecutionAccess.querySelector("b");
      const accessText = modalExecutionAccess.querySelector("p");
      if (!modalOccurrence.analysis) {
        accessTitle.textContent = "Aguardando análise";
        accessText.textContent = "O registro precisa passar pela análise antes de ser encaminhado à equipe técnica.";
      } else if (!["approved", "in_progress"].includes(modalOccurrence.state)) {
        accessTitle.textContent = "Aguardando aprovação";
        accessText.textContent = "A equipe técnica só pode executar a atividade após a aprovação de um supervisor ou administrador.";
      } else {
        accessTitle.textContent = "Acesso da equipe técnica necessário";
        accessText.textContent = "Entre com uma conta de Funcionário, Supervisora ou Administrador para executar a atividade.";
      }
      modalSendToClose.hidden = true;
      return;
    }
    modalExecutionTitle.textContent = modalOccurrence.analysis.category;
    modalExecutionTeam.textContent = modalOccurrence.analysis.team;
    modalExecutionLocation.textContent = modalOccurrence.record.location;
    modalExecutionRoute.textContent = modalOccurrence.analysis.route;
    modalExecutionMaterials.value = modalOccurrence.materials;
    modalExecutionDescription.value = modalOccurrence.executionDescription;
    modalExecutionCost.value = modalOccurrence.cost || "";
    const inProgress = modalOccurrence.state === "in_progress";
    modalStartExecution.hidden = inProgress;
    modalExecutionDescriptionLabel.hidden = !inProgress;
    modalExecutionCostLabel.hidden = !inProgress;
    modalSendToClose.hidden = !inProgress;
    setModalMessage(modalExecutionMessage, "");
  }

  function renderModalClosure() {
    const technicianName = modalOccurrence.technician?.name || "Aguardando execução técnica";
    const cost = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(modalOccurrence.cost || 0);
    modalCloseTechnician.textContent = technicianName;
    modalCloseDuration.textContent = modalOccurrence.duration();
    modalCloseCost.textContent = cost;
    modalCloseHistory.replaceChildren(...modalOccurrence.history.map((entry) => {
      const item = document.createElement("li");
      const time = document.createElement("time");
      const message = document.createElement("span");
      time.textContent = entry.time;
      message.textContent = entry.message;
      item.append(time, message);
      return item;
    }));
    const canFinalize = modalOccurrence.state === "ready_to_close" && canApprove();
    modalCloseAccess.hidden = canFinalize || modalOccurrence.state === "closed";
    modalFinalizeButton.disabled = !canFinalize;
    modalFinalizeButton.textContent = modalOccurrence.state === "closed" ? "✓ Atividade finalizada" : "✓ Finalizar atividade";
    modalCloseUser.textContent = canApprove()
      ? `${currentUser.name} · ${currentUser.role}`
      : "Finalização disponível somente para Administrador ou Supervisora Operacional";
    if (modalOccurrence.state !== "ready_to_close" && modalOccurrence.state !== "closed") {
      modalCloseAccess.querySelector("b").textContent = "Aguardando execução registrada";
      modalCloseAccess.querySelector("p").textContent = "A equipe técnica deve descrever a atividade e informar os gastos antes do encerramento.";
    } else if (!canApprove() && modalOccurrence.state === "ready_to_close") {
      modalCloseAccess.querySelector("b").textContent = "Finalização restrita";
      modalCloseAccess.querySelector("p").textContent = "Somente Administrador ou Supervisora Operacional pode concluir a atividade.";
    }
  }

  function renderModalFlow() {
    renderModalSteps();
    renderModalAnalysis();
    renderModalApproval();
    renderModalExecution();
    renderModalClosure();
  }

  function closeFlowModal(name) {
    const dialog = flowDialogs[name];
    if (dialog?.open) dialog.close();
  }

  function openFlowModal(name) {
    const dialog = flowDialogs[name];
    if (!dialog) return;
    if (name === "register") configureQrRegistration();
    renderModalFlow();
    Object.values(flowDialogs).forEach((item) => {
      if (item !== dialog && item.open) item.close();
    });
    if (!dialog.open) dialog.showModal();
  }

  let activeControlTab = "map";
  let controlMessage = { text: "", state: "error" };

  function controlStateLabel(state) {
    return CONTROL_STATE_LABELS[state] || "Sem estado";
  }

  function setControlMessage(text = "", state = "error") {
    controlMessage = { text, state };
    controlActionMessage.textContent = text;
    controlActionMessage.classList.toggle("is-success", Boolean(text) && state === "success");
  }

  function renderControlQueue() {
    const activeIncidents = controlCenter.activeIncidents;
    controlQueueCount.textContent = String(activeIncidents.length);
    controlActiveCount.textContent = String(activeIncidents.length);
    const inProgressCount = activeIncidents.filter((incident) => incident.state === "in_progress").length;
    controlActiveSupport.textContent = `${inProgressCount} em atendimento`;
    controlQueueList.replaceChildren(...activeIncidents.map((incident) => {
      const item = document.createElement("button");
      item.type = "button";
      item.role = "option";
      item.className = "control-queue-item";
      item.classList.toggle("is-selected", incident.id === controlCenter.selectedId);
      item.setAttribute("aria-selected", String(incident.id === controlCenter.selectedId));

      const dot = document.createElement("span");
      dot.className = `queue-dot queue-dot--${incident.priorityClass}`;
      dot.setAttribute("aria-hidden", "true");
      const main = document.createElement("span");
      main.className = "queue-main";
      const title = document.createElement("b");
      title.textContent = `#${incident.id} · ${incident.title}`;
      const location = document.createElement("small");
      location.textContent = incident.location;
      const meta = document.createElement("span");
      meta.className = "queue-meta";
      const priority = document.createElement("span");
      priority.textContent = `${incident.priority} · ${incident.age}`;
      const status = document.createElement("span");
      status.className = `queue-status queue-status--${incident.state === "in_progress" ? "progress" : incident.state}`;
      status.textContent = controlStateLabel(incident.state);
      meta.append(priority, status);
      main.append(title, location, meta);
      item.append(dot, main);
      item.addEventListener("click", () => {
        if (controlCenter.select(incident.id)) {
          setControlMessage("");
          renderControl();
        }
      });
      return item;
    }));
  }

  function teamStatus(team) {
    const matchingIncident = controlCenter.activeIncidents.find((incident) => incident.teamId === team.id);
    if (matchingIncident?.state === "in_progress") return { label: "Em atendimento", className: "is-busy" };
    if (matchingIncident?.state === "assigned") return { label: "Em deslocamento", className: "is-busy" };
    if (!team.available) return { label: "Indisponível", className: "is-offline" };
    return { label: "Disponível", className: "" };
  }

  function createTeamPersonCard(team, status) {
    const item = document.createElement("li");
    item.className = "team-person-card";
    const avatar = document.createElement("span");
    avatar.className = "team-person-avatar";
    avatar.textContent = team.initials;
    const summary = document.createElement("div");
    const name = document.createElement("b");
    name.textContent = team.name;
    const specialty = document.createElement("small");
    specialty.textContent = team.specialty;
    summary.append(name, specialty);
    const activity = document.createElement("span");
    activity.className = "team-person-activity";
    activity.textContent = team.openTasks > 0
      ? `${team.openTasks} atividade${team.openTasks > 1 ? "s" : ""} vinculada${team.openTasks > 1 ? "s" : ""}`
      : "Sem atividade atribuída";
    const statusChip = document.createElement("span");
    statusChip.className = `team-person-status ${status.className}`.trim();
    statusChip.textContent = status.label;
    item.append(avatar, summary, activity, statusChip);
    return item;
  }

  function renderTeams() {
    const roster = CONTROL_ROSTER.map((team) => ({ team, status: teamStatus(team) }));
    const available = roster.filter(({ status }) => status.label === "Disponível");
    const busy = roster.filter(({ status }) => status.className === "is-busy");
    const offline = roster.filter(({ status }) => status.className === "is-offline");

    teamsPresentCount.textContent = String(roster.length);
    teamsAvailableCount.textContent = String(available.length);
    teamsBusyCount.textContent = String(busy.length);
    teamsOfflineCount.textContent = String(offline.length);
    teamsPresentGroupCount.textContent = String(roster.length);
    teamsAvailableGroupCount.textContent = String(available.length);
    teamsBusyGroupCount.textContent = String(busy.length);
    teamsPresentList.replaceChildren(...roster.map(({ team, status }) => createTeamPersonCard(team, status)));
    teamsAvailableList.replaceChildren(...available.map(({ team, status }) => createTeamPersonCard(team, status)));
    teamsBusyList.replaceChildren(...busy.map(({ team, status }) => createTeamPersonCard(team, status)));
  }

  function renderControlTeams() {
    const availableTeams = CONTROL_ROSTER.filter((team) => team.available).length;
    controlTeamCount.textContent = String(CONTROL_ROSTER.length);
    if (!controlTeamList) {
      const teamMetric = controlTeamCount.closest(".control-metric");
      teamMetric.querySelector("small").textContent = `${availableTeams} disponíveis agora`;
      return;
    }
    controlTeamList.replaceChildren(...CONTROL_ROSTER.map((team) => {
      const item = document.createElement("li");
      item.className = "control-team-item";
      const symbol = document.createElement("span");
      symbol.className = "control-team-symbol";
      symbol.textContent = team.initials;
      const summary = document.createElement("span");
      const name = document.createElement("b");
      name.textContent = team.name;
      const details = document.createElement("small");
      details.textContent = `${team.specialty} · ${team.openTasks} tarefa(s)`;
      summary.append(name, details);
      const status = teamStatus(team);
      const statusText = document.createElement("span");
      statusText.className = `team-status-text ${status.className}`.trim();
      statusText.textContent = status.label;
      item.append(symbol, summary, statusText);
      return item;
    }));
    const teamMetric = controlTeamCount.closest(".control-metric");
    teamMetric.querySelector("small").textContent = `${availableTeams} disponíveis agora`;
  }

  function renderControlMap(incident) {
    document.querySelectorAll(".map-zone, .map-corridor").forEach((zone) => {
      zone.classList.remove("is-affected", "is-high", "is-medium", "is-low");
    });
    const affectedZone = document.querySelector(`#${incident.map.zone}`);
    if (affectedZone) {
      affectedZone.classList.add("map-zone", "is-affected", `is-${incident.priorityClass}`);
    }
    controlMapRoute.setAttribute("d", incident.map.route);
    controlTeamMarker.setAttribute("transform", `translate(${incident.map.teamX} ${incident.map.teamY})`);
    controlIncidentMarker.setAttribute("transform", `translate(${incident.map.x} ${incident.map.y})`);
    controlIncidentMarker.setAttribute("class", `incident-map-marker is-${incident.priorityClass}`);
    controlIncidentMarker.setAttribute("aria-label", `Ocorrência #${incident.id}: ${incident.title}, prioridade ${incident.priority}`);
    controlMapMarkerLabel.textContent = `#${incident.id}`;
    controlMapCaption.setAttribute("transform", `translate(${incident.map.captionX} ${incident.map.captionY})`);
    controlMapCaption.querySelector("text").textContent = incident.map.caption;
    controlMapStageNote.textContent = `Área afetada: ${incident.shortLocation}`;

    const tabContent = {
      map: {
        mode: "Mapa operacional simplificado",
        context: "Rota e posições são estimativas demonstrativas.",
        className: "",
      },
      flow: {
        mode: "Camada de fluxo de visitantes",
        context: "Concentração estimada maior na Praça de Alimentação.",
        className: "is-flow-layer",
      },
      assets: {
        mode: "Camada de ativos e equipamentos",
        context: "Ativo relacionado: AC-03 · leitura demonstrativa fora do parâmetro.",
        className: "is-assets-layer",
      },
    }[activeControlTab];
    controlMapMode.textContent = tabContent.mode;
    controlMapContext.textContent = tabContent.context;
    operationalMap.classList.toggle("is-flow-layer", tabContent.className === "is-flow-layer");
    operationalMap.classList.toggle("is-assets-layer", tabContent.className === "is-assets-layer");
  }

  function renderControlDetail(incident) {
    const team = controlCenter.getTeam(incident.teamId);
    controlDetailTitle.textContent = `#${incident.id} · ${incident.title}`;
    controlDetailStatus.textContent = controlStateLabel(incident.state);
    controlDetailStatus.className = `control-status control-status--${incident.state === "in_progress" ? "progress" : incident.state}`;
    controlDetailPriority.textContent = incident.priority;
    controlDetailPriority.className = `detail-priority is-${incident.priorityClass}`;
    controlDetailName.textContent = incident.title;
    controlDetailDescription.textContent = incident.description;
    controlDetailLocation.textContent = incident.location;
    controlDetailResponse.textContent = `${incident.response} · simulado`;
    controlDetailSuggestion.textContent = incident.suggestion;
    controlDetailInitials.textContent = team?.initials || "—";
    controlDetailTeam.textContent = team?.name || "Equipe ainda não definida";
    controlDetailSpecialty.textContent = team
      ? `${team.specialty} · ${teamStatus(team).label}`
      : "Aguardando definição";

    const actionLabel = {
      review: "Aprovar e atribuir tarefa",
      assigned: "Iniciar atendimento",
      in_progress: "Registrar atualização",
      resolved: "Ocorrência concluída",
    }[incident.state];
    const needsProgressNote = incident.state === "in_progress";
    controlPrimaryAction.hidden = incident.state === "resolved";
    controlPrimaryAction.textContent = actionLabel;
    controlProgressLabel.hidden = !needsProgressNote;
    controlResolutionLabel.hidden = !needsProgressNote;
    controlResolveButton.hidden = !needsProgressNote;
    controlReassignButton.hidden = incident.state === "resolved";
    controlEvidenceButton.hidden = incident.state === "resolved";
    controlActionMessage.textContent = controlMessage.text;
    controlActionMessage.classList.toggle("is-success", controlMessage.state === "success");

    controlHistoryList.replaceChildren(...incident.history.map((entry) => {
      const item = document.createElement("li");
      const time = document.createElement("time");
      const text = document.createElement("span");
      time.textContent = entry.time;
      text.textContent = entry.message;
      item.append(time, text);
      return item;
    }));
  }

  function renderControl() {
    const incident = controlCenter.selected;
    if (!incident) return;
    renderControlQueue();
    renderControlTeams();
    renderControlMap(incident);
    renderControlDetail(incident);
  }

  function taskAction(status) {
    return ({
      todo: { label: "Iniciar atividade", next: "Em Andamento" },
      in_progress: { label: "Aguardar equipamento", next: "Aguardando Equipamento" },
      waiting_equipment: { label: "Retomar atividade", next: "Em Andamento" },
      blocked: { label: "Destravar e retomar", next: "A Fazer" },
    })[status] || null;
  }

  function createTaskCard(task) {
    const card = document.createElement("article");
    card.className = "kanban-task";
    card.setAttribute("role", "listitem");

    const top = document.createElement("div");
    top.className = "kanban-task-top";
    const identifier = document.createElement("span");
    identifier.textContent = task.id;
    const priority = document.createElement("b");
    priority.className = `kanban-priority kanban-priority--${task.priorityTone}`;
    priority.textContent = task.priority;
    top.append(identifier, priority);

    const title = document.createElement("h3");
    title.textContent = task.title;
    const occurrence = document.createElement("p");
    occurrence.className = "kanban-occurrence";
    occurrence.textContent = task.occurrence;
    const location = document.createElement("p");
    location.className = "kanban-location";
    location.textContent = `⌖ ${task.location}`;
    const note = document.createElement("p");
    note.className = "kanban-note";
    note.textContent = task.note;

    const footer = document.createElement("footer");
    const assignee = document.createElement("span");
    assignee.className = "kanban-assignee";
    const initials = document.createElement("i");
    initials.textContent = task.assignee.split(" ").map((name) => name[0]).join("").slice(0, 2);
    const person = document.createElement("span");
    const personName = document.createElement("b");
    personName.textContent = task.assignee;
    const specialty = document.createElement("small");
    specialty.textContent = task.specialty;
    person.append(personName, specialty);
    assignee.append(initials, person);
    const due = document.createElement("time");
    due.textContent = task.due;
    footer.append(assignee, due);

    card.append(top, title, occurrence, location, note, footer);
    const action = taskAction(task.status);
    if (action) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "kanban-task-action";
      button.dataset.taskId = task.id;
      button.textContent = action.label;
      card.append(button);
    }
    return card;
  }

  function renderTasks() {
    const tasks = taskBoard.visibleTasks(currentUser);
    const personalBoard = currentUser?.role === "Funcionário";
    const firstName = currentUser?.name.split(" ")[0] || "Equipe";
    tasksTitle.textContent = personalBoard ? "Minhas tarefas" : "Tarefas da operação";
    tasksSubtitle.textContent = personalBoard
      ? "Acompanhe as atividades atribuídas a você e mantenha seu status atualizado."
      : "Acompanhe a distribuição das atividades e os impedimentos da equipe.";
    tasksAssignee.querySelector("i").textContent = currentUser?.initials || "—";
    tasksAssignee.querySelector("b").textContent = personalBoard ? currentUser?.name || "—" : "Visão da equipe";
    tasksAssignee.querySelector("small").textContent = personalBoard ? "Atividades atribuídas" : "Todos os responsáveis";

    const activeTasks = tasks.filter((task) => task.status !== "done").length;
    tasksBoardSummary.textContent = personalBoard
      ? `${tasks.length} atividade(s) atribuída(s) a ${firstName}; ${activeTasks} ainda em acompanhamento.`
      : `${tasks.length} atividade(s) na operação; ${activeTasks} ainda em acompanhamento.`;

    TASK_COLUMNS.forEach((column) => {
      const container = document.querySelector(`#tasks-${column.id}`);
      const items = tasks.filter((task) => task.status === column.id);
      document.querySelector(`#task-count-${column.id}`).textContent = String(items.length);
      container.replaceChildren(...items.map(createTaskCard));
      if (items.length === 0) {
        const empty = document.createElement("p");
        empty.className = "kanban-empty";
        empty.textContent = "Nenhuma atividade nesta etapa.";
        container.append(empty);
      }
    });
  }

  function inventoryStatus(item) {
    if (item.quantity < item.minimum) return { label: "Abaixo do mínimo", className: "is-low" };
    if (item.quantity === item.minimum) return { label: "No limite mínimo", className: "is-limit" };
    return { label: "Estoque adequado", className: "is-healthy" };
  }

  function createInventoryItem(item) {
    const status = inventoryStatus(item);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "inventory-row";
    button.dataset.inventoryId = item.id;
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(item.id === inventoryLedger.selectedId));
    button.classList.toggle("is-selected", item.id === inventoryLedger.selectedId);

    const icon = document.createElement("span");
    icon.className = "inventory-row-icon";
    icon.textContent = item.category === "Climatização / HVAC" ? "♨" : item.category === "Elétrica" ? "ϟ" : item.category === "Hidráulica" ? "≈" : "▦";
    const main = document.createElement("span");
    main.className = "inventory-row-main";
    const name = document.createElement("b");
    name.textContent = item.name;
    const metadata = document.createElement("small");
    metadata.textContent = `${item.code} · ${item.location}`;
    main.append(name, metadata);
    const balance = document.createElement("span");
    balance.className = "inventory-row-balance";
    const quantity = document.createElement("strong");
    quantity.textContent = String(item.quantity);
    const unit = document.createElement("small");
    unit.textContent = inventoryUnitLabel(item.quantity, item.unit);
    balance.append(quantity, unit);
    const state = document.createElement("span");
    state.className = `inventory-row-state ${status.className}`;
    state.textContent = status.label;
    button.append(icon, main, balance, state);
    return button;
  }

  function renderInventoryHistory(item) {
    const entries = inventoryLedger.history.filter((entry) => entry.itemId === item.id).slice(0, 4);
    inventoryItemHistory.replaceChildren(...entries.map((entry) => {
      const line = document.createElement("li");
      const time = document.createElement("time");
      time.textContent = entry.time;
      const text = document.createElement("span");
      text.textContent = `${entry.actor} ${entry.message}`;
      line.append(time, text);
      return line;
    }));
    if (entries.length === 0) {
      const line = document.createElement("li");
      line.className = "inventory-history-empty";
      line.textContent = "Nenhuma movimentação local para este item.";
      inventoryItemHistory.append(line);
    }
  }

  function renderWithdrawalOptions() {
    const current = inventoryWithdrawalItem.value || inventoryLedger.selectedId;
    inventoryWithdrawalItem.replaceChildren(...inventoryLedger.items.map((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = `${item.name} · ${item.quantity} ${item.unit}`;
      option.selected = item.id === current;
      return option;
    }));
    updateWithdrawalStock();
  }

  function updateWithdrawalStock() {
    const item = inventoryLedger.items.find((candidate) => candidate.id === inventoryWithdrawalItem.value);
    inventoryWithdrawalStock.textContent = item
      ? `Saldo disponível: ${item.quantity} ${inventoryUnitLabel(item.quantity, item.unit)}. Estoque mínimo: ${item.minimum} ${inventoryUnitLabel(item.minimum, item.unit)}.`
      : "Selecione um item para consultar o saldo disponível.";
  }

  function renderInventory() {
    const item = inventoryLedger.selected;
    const totalUnits = inventoryLedger.items.reduce((total, current) => total + current.quantity, 0);
    const lowStockItems = inventoryLedger.items.filter((current) => current.quantity <= current.minimum).length;
    inventoryTotalItems.textContent = String(inventoryLedger.items.length);
    inventoryTotalUnits.textContent = String(totalUnits);
    inventoryLowStock.textContent = String(lowStockItems);
    inventoryStockSelect.replaceChildren(...inventoryLedger.items.map((current) => {
      const option = document.createElement("option");
      option.value = current.id;
      option.textContent = `${current.name} · ${current.quantity} ${inventoryUnitLabel(current.quantity, current.unit)}`;
      option.selected = current.id === inventoryLedger.selectedId;
      return option;
    }));
    if (!item) return;
    const status = inventoryStatus(item);
    const icon = item.category === "Climatização / HVAC" ? "♨" : item.category === "Elétrica" ? "ϟ" : item.category === "Hidráulica" ? "≈" : "▦";
    inventorySelectedIcon.textContent = icon;
    inventorySelectedName.textContent = item.name;
    inventorySelectedCode.textContent = `${item.code} · ${item.location}`;
    inventorySelectedQuantity.textContent = String(item.quantity);
    inventorySelectedUnit.textContent = inventoryUnitLabel(item.quantity, item.unit);
    inventoryDetailName.textContent = item.name;
    inventoryDetailStatus.className = `inventory-status ${status.className}`;
    inventoryDetailStatus.textContent = status.label;
    inventoryDetailQuantity.textContent = String(item.quantity);
    inventoryDetailUnit.textContent = inventoryUnitLabel(item.quantity, item.unit);
    inventoryDetailCode.textContent = item.code;
    inventoryDetailMinimum.textContent = `${item.minimum} ${inventoryUnitLabel(item.minimum, item.unit)}`;
    inventoryDetailCategory.textContent = item.category;
    inventoryDetailLocation.textContent = item.location;
    inventoryDetailDescription.textContent = item.description;
    renderInventoryHistory(item);
  }

  function setInventoryFormMessage(element, message = "", state = "error") {
    element.textContent = message;
    element.classList.toggle("is-success", state === "success");
  }

  function openInventoryModal(name) {
    const dialog = name === "entry" ? inventoryEntryModal : inventoryWithdrawalModal;
    const alternate = name === "entry" ? inventoryWithdrawalModal : inventoryEntryModal;
    if (alternate.open) alternate.close();
    if (name === "withdrawal") {
      renderWithdrawalOptions();
      setInventoryFormMessage(inventoryWithdrawalMessage);
    } else {
      setInventoryFormMessage(inventoryEntryMessage);
    }
    if (!dialog.open) dialog.showModal();
  }

  function closeInventoryModal(name) {
    const dialog = name === "entry" ? inventoryEntryModal : inventoryWithdrawalModal;
    if (dialog.open) dialog.close();
  }

  function renderAnalysis() {
    const analysis = occurrence.analysis;
    analysisEmpty.hidden = Boolean(analysis);
    analysisResult.hidden = !analysis;
    if (!analysis) return;

    aiCategory.textContent = analysis.category;
    aiPriority.textContent = analysis.priority;
    priorityExplanation.textContent = analysis.explanation;
    priorityRules.replaceChildren(...analysis.rules.map((rule) => {
      const item = document.createElement("li");
      item.textContent = rule;
      return item;
    }));

    teamCount.textContent = `${analysis.eligibleTeams.length} elegível(is)`;
    teamSuggestions.replaceChildren();
    if (analysis.eligibleTeams.length === 0) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "Nenhuma pessoa elegível está disponível. Escale para a supervisão antes de atribuir.";
      teamSuggestions.append(empty);
      return;
    }

    analysis.eligibleTeams.forEach((team) => {
      const option = document.createElement("label");
      option.className = "team-option";
      option.classList.toggle("is-selected", team.id === occurrence.selectedTeamId);

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "responsible-team";
      input.value = team.id;
      input.checked = team.id === occurrence.selectedTeamId;
      input.addEventListener("change", () => {
        if (occurrence.selectTeam(team.id)) renderOccurrence();
      });

      const avatar = document.createElement("span");
      avatar.className = "team-avatar";
      avatar.textContent = team.initials;

      const summary = document.createElement("span");
      const name = document.createElement("b");
      name.textContent = team.name;
      const details = document.createElement("small");
      details.textContent = `${team.specialty} · disponível · ${team.openTasks} tarefa(s) aberta(s)`;
      summary.append(name, details);

      const rationale = document.createElement("span");
      rationale.className = "team-rationale";
      rationale.textContent = team.openTasks === 0 ? "Menor carga" : "Disponível";
      option.append(input, avatar, summary, rationale);
      teamSuggestions.append(option);
    });
  }

  function renderSteps() {
    const positions = { draft: 0, review: 1, assigned: 2, in_progress: 3, resolved: 4 };
    const currentPosition = positions[occurrence.state];
    steps.forEach((step, position) => {
      step.classList.toggle("is-complete", position < currentPosition);
      step.classList.toggle("is-current", position === currentPosition);
    });
  }

  function renderWorkflowState() {
    const detail = {
      draft: { className: "is-review", title: "Aguardando classificação", text: "Registre os dados para gerar uma sugestão local e auditável." },
      review: { className: "is-review", title: "Aguardando aprovação", text: "A pessoa supervisora deve revisar a recomendação antes da atribuição." },
      assigned: { className: "is-assigned", title: "Tarefa atribuída", text: "A equipe foi definida e pode iniciar o atendimento." },
      in_progress: { className: "is-progress", title: "Em atendimento", text: "Registre atualizações e uma solução antes de encerrar a ocorrência." },
      resolved: { className: "is-resolved", title: "Ocorrência encerrada", text: "A resolução foi registrada no histórico desta demonstração." },
    }[occurrence.state];

    const indicator = workflowState.querySelector(".status-indicator");
    indicator.className = `status-indicator ${detail.className}`;
    workflowState.querySelector("b").textContent = detail.title;
    workflowState.querySelector("small").textContent = detail.text;
  }

  function updateApprovalAction() {
    const eligible = Boolean(occurrence.selectedTeamId);
    approveAssignment.disabled = !canApprove() || !supervisorCheck.checked || !eligible;
  }

  function renderApprovalAndTasks() {
    const isReview = occurrence.state === "review";
    supervisorApproval.hidden = !isReview;

    if (isReview) {
      const approvalText = supervisorApproval.querySelector(".approval-check span");
      supervisorCheck.disabled = !canApprove();
      approvalText.textContent = canApprove()
        ? "Confirmo que revisei a prioridade, a equipe e as informações disponíveis."
        : "A aprovação exige login de Administrador ou Supervisora Operacional.";
      updateApprovalAction();
    }

    const taskIsVisible = occurrence.state === "assigned" || occurrence.state === "in_progress";
    taskControls.hidden = !taskIsVisible;
    if (!taskIsVisible) return;

    const inProgress = occurrence.state === "in_progress";
    taskUpdate.closest("label").hidden = !inProgress;
    startTask.hidden = occurrence.state !== "assigned";
    saveUpdate.hidden = !inProgress;
    completionField.hidden = !inProgress;
    resolveTask.hidden = !inProgress;
  }

  function renderAudit() {
    auditLog.replaceChildren(...occurrence.history.map((entry) => {
      const item = document.createElement("li");
      const time = document.createElement("time");
      const message = document.createElement("span");
      time.textContent = entry.time;
      message.textContent = entry.message;
      item.append(time, message);
      return item;
    }));
  }

  function renderOccurrence() {
    renderAnalysis();
    renderSteps();
    renderWorkflowState();
    renderApprovalAndTasks();
    renderAudit();
  }

  document.querySelector("#login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const user = USERS.find((candidate) => (
      candidate.email === emailField.value.trim().toLowerCase()
      && candidate.password === passwordField.value
    ));
    if (!user) {
      loginError.textContent = "Credenciais inválidas. Escolha um perfil de demonstração ou use a senha demo123.";
      passwordField.focus();
      return;
    }
    setSession(user);
    setAuthenticatedView(user);
  });

  document.querySelectorAll("[data-demo]").forEach((button) => {
    button.addEventListener("click", () => {
      emailField.value = button.dataset.demo;
      passwordField.value = "demo123";
      loginError.textContent = "";
      passwordField.focus();
    });
  });

  document.querySelector("#logout-button").addEventListener("click", () => {
    clearSession();
    setLoggedOutView();
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => navigateTo(button.dataset.view));
  });

  document.querySelector("#open-entry-modal").addEventListener("click", () => openInventoryModal("entry"));
  document.querySelector("#open-withdrawal-modal").addEventListener("click", () => openInventoryModal("withdrawal"));
  document.querySelectorAll("[data-close-inventory-modal]").forEach((button) => {
    button.addEventListener("click", () => closeInventoryModal(button.dataset.closeInventoryModal));
  });

  inventoryStockSelect.addEventListener("change", () => {
    inventoryLedger.select(inventoryStockSelect.value);
    inventoryDetailDropdown.open = true;
    inventoryTraceDropdown.open = true;
    renderInventory();
  });

  inventoryWithdrawalItem.addEventListener("change", updateWithdrawalStock);

  inventoryEntryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.querySelector("#inventory-entry-name").value.trim();
    const code = document.querySelector("#inventory-entry-code").value.trim().toUpperCase();
    const quantity = Number(document.querySelector("#inventory-entry-quantity").value);
    const category = document.querySelector("#inventory-entry-category").value;
    const minimum = Number(document.querySelector("#inventory-entry-minimum").value);
    const location = document.querySelector("#inventory-entry-location").value.trim();
    const note = document.querySelector("#inventory-entry-note").value.trim();
    if (!name || !code || !category || !location || !Number.isInteger(quantity) || quantity <= 0 || !Number.isInteger(minimum) || minimum < 0) {
      setInventoryFormMessage(inventoryEntryMessage, "Preencha os campos obrigatórios com quantidades válidas.");
      return;
    }
    const result = inventoryLedger.registerEntry({ name, code, quantity, category, minimum, location, note }, currentUser);
    setInventoryFormMessage(inventoryEntryMessage, result.message, "success");
    renderInventory();
    inventoryEntryForm.reset();
    closeInventoryModal("entry");
  });

  inventoryWithdrawalForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const quantity = Number(inventoryWithdrawalQuantity.value);
    const reason = inventoryWithdrawalReason.value.trim();
    if (!reason || reason.length < 6) {
      setInventoryFormMessage(inventoryWithdrawalMessage, "Informe uma finalidade com pelo menos 6 caracteres.");
      return;
    }
    const result = inventoryLedger.withdraw(inventoryWithdrawalItem.value, quantity, reason, currentUser);
    if (!result.success) {
      setInventoryFormMessage(inventoryWithdrawalMessage, result.message);
      return;
    }
    setInventoryFormMessage(inventoryWithdrawalMessage, result.message, "success");
    renderInventory();
    inventoryWithdrawalForm.reset();
    closeInventoryModal("withdrawal");
  });

  tasksBoard.addEventListener("click", (event) => {
    const button = event.target.closest("[data-task-id]");
    if (!button) return;
    const task = taskBoard.move(button.dataset.taskId, currentUser);
    if (!task) {
      tasksFeedback.textContent = "Esta atividade não pode ser alterada pelo perfil atual.";
      return;
    }
    const next = taskAction(task.status);
    const statusLabel = TASK_COLUMNS.find((column) => column.id === task.status)?.label || task.status;
    tasksFeedback.textContent = `${task.id} foi movida para “${statusLabel}” nesta demonstração local.`;
    tasksFeedback.classList.add("is-success");
    renderTasks();
    if (next) button.focus();
  });

  incidentPhoto.addEventListener("change", () => {
    const [file] = incidentPhoto.files;
    if (!file) {
      clearPhoto();
      return;
    }
    if (!file.type.startsWith("image/")) {
      clearPhoto();
      setFormMessage("Selecione um arquivo de imagem para anexar à ocorrência.");
      return;
    }
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    photoUrl = URL.createObjectURL(file);
    const image = document.createElement("img");
    image.src = photoUrl;
    image.alt = "Prévia da foto selecionada";
    photoPreview.replaceChildren(image);
    occurrence.addAudit("Foto anexada ao registro local da ocorrência.");
    renderAudit();
    setFormMessage("");
  });

  occurrenceForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const description = incidentDescription.value.trim();
    const location = incidentLocation.value;
    if (description.length < 10) {
      setFormMessage("Inclua uma descrição com pelo menos 10 caracteres para a triagem inicial.");
      incidentDescription.focus();
      return;
    }
    if (!location) {
      setFormMessage("Selecione o local da ocorrência.");
      incidentLocation.focus();
      return;
    }
    if (!["draft", "review"].includes(occurrence.state)) {
      setFormMessage("Após a aprovação, os dados desta ocorrência não podem ser reclassificados neste protótipo.");
      return;
    }

    occurrence.classify(description, location);
    supervisorCheck.checked = false;
    setFormMessage("Sugestão de triagem atualizada. Aguarde a revisão e aprovação humana.", "success");
    renderOccurrence();
  });

  supervisorCheck.addEventListener("change", updateApprovalAction);

  approveAssignment.addEventListener("click", () => {
    if (!canApprove()) {
      setFormMessage("A aprovação requer um perfil de Administrador ou Supervisora Operacional.");
      return;
    }
    if (!supervisorCheck.checked) return;
    if (!occurrence.approve(currentUser)) {
      setFormMessage("Escolha uma pessoa elegível antes de aprovar a atribuição.");
      return;
    }
    setFormMessage("Tarefa aprovada e atribuída. A equipe pode iniciar o atendimento.", "success");
    renderOccurrence();
  });

  startTask.addEventListener("click", () => {
    if (occurrence.start()) {
      setFormMessage("Atendimento iniciado. Registre atualizações antes do encerramento.", "success");
      renderOccurrence();
      taskUpdate.focus();
    }
  });

  saveUpdate.addEventListener("click", () => {
    if (!taskUpdate.value.trim()) {
      taskUpdate.focus();
      setFormMessage("Descreva a atualização antes de registrá-la no histórico.");
      return;
    }
    occurrence.update(taskUpdate.value);
    taskUpdate.value = "";
    setFormMessage("Atualização adicionada ao histórico auditável.", "success");
    renderOccurrence();
  });

  resolveTask.addEventListener("click", () => {
    if (completionNote.value.trim().length < 8) {
      completionNote.focus();
      setFormMessage("Informe um resumo da resolução com pelo menos 8 caracteres antes de encerrar.");
      return;
    }
    occurrence.resolve(completionNote.value);
    setFormMessage("Ocorrência encerrada com sucesso nesta demonstração.", "success");
    renderOccurrence();
  });

  controlTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeControlTab = tab.dataset.controlTab;
      controlTabs.forEach((item) => {
        const isActive = item === tab;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-selected", String(isActive));
      });
      renderControlMap(controlCenter.selected);
    });
  });

  controlFloor.addEventListener("change", () => {
    const floorName = controlFloor.selectedOptions[0].textContent;
    controlMapStageNote.textContent = `Visualização demonstrativa: ${floorName}`;
    setControlMessage(`Mapa ajustado para ${floorName}. Dados continuam sintéticos.`, "success");
  });

  controlPrimaryAction.addEventListener("click", () => {
    const wasInProgress = controlCenter.selected?.state === "in_progress";
    const result = controlCenter.primaryAction(currentUser, controlProgressNote.value);
    if (result.success && wasInProgress) controlProgressNote.value = "";
    setControlMessage(result.message, result.success ? "success" : "error");
    renderControl();
  });

  controlReassignButton.addEventListener("click", () => {
    const result = controlCenter.reassign(currentUser);
    setControlMessage(result.message, result.success ? "success" : "error");
    renderControl();
  });

  controlEvidenceButton.addEventListener("click", () => {
    const result = controlCenter.registerEvidence(currentUser);
    setControlMessage(result.message, result.success ? "success" : "error");
    renderControl();
  });

  controlResolveButton.addEventListener("click", () => {
    const result = controlCenter.resolve(currentUser, controlResolutionNote.value);
    if (result.success) controlResolutionNote.value = "";
    setControlMessage(result.message, result.success ? "success" : "error");
    renderControl();
  });

  const focusSelectedIncident = () => {
    const incident = controlCenter.selected;
    if (!incident) return;
    setControlMessage(`Ocorrência #${incident.id} permanece selecionada no mapa.`, "success");
  };
  controlIncidentMarker.addEventListener("click", focusSelectedIncident);
  controlIncidentMarker.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      focusSelectedIncident();
    }
  });

  document.querySelectorAll("[data-open-modal]").forEach((button) => {
    button.addEventListener("click", () => openFlowModal(button.dataset.openModal));
  });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => closeFlowModal(button.dataset.closeModal));
  });

  modalStepButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const stepName = button.closest("[data-modal-step]").dataset.modalStep;
      openFlowModal(stepName);
    });
  });

  publicReportButton.addEventListener("click", () => openFlowModal("register"));

  publicIncidentMedia.addEventListener("change", () => {
    const [file] = publicIncidentMedia.files;
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setModalMessage(publicRegistrationMessage, "Escolha uma imagem ou um vídeo para anexar ao registro.");
      return;
    }
    if (publicMediaUrl) URL.revokeObjectURL(publicMediaUrl);
    publicMediaUrl = URL.createObjectURL(file);
    const media = document.createElement(file.type.startsWith("video/") ? "video" : "img");
    media.src = publicMediaUrl;
    media.muted = true;
    media.playsInline = true;
    media.alt = file.type.startsWith("image/") ? "Prévia da imagem anexada" : "Prévia do vídeo anexado";
    publicMediaPreview.replaceChildren(media);
    setModalMessage(publicRegistrationMessage, "");
  });

  publicRegistrationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const description = publicIncidentDescription.value.trim();
    const location = publicIncidentLocation.value;
    const [media] = publicIncidentMedia.files;
    if (description.length < 10) {
      setModalMessage(publicRegistrationMessage, "Informe uma descrição com pelo menos 10 caracteres.");
      publicIncidentDescription.focus();
      return;
    }
    if (!location) {
      setModalMessage(publicRegistrationMessage, "Selecione ou confirme o local da ocorrência.");
      publicIncidentLocation.focus();
      return;
    }
    modalOccurrence.reset();
    modalOccurrence.register({ description, location, mediaName: media?.name || "", mediaType: media?.type || "" });
    setModalMessage(publicRegistrationMessage, "");
    renderModalFlow();
    closeFlowModal("register");
    openFlowModal("analyze");
  });

  modalAnalysisNext.addEventListener("click", () => {
    if (!modalOccurrence.analysis) return;
    if (!canApprove()) {
      setModalMessage(modalAnalysisMessage, "Análise concluída. O chamado aguarda a aprovação de uma Supervisora ou Administrador.", "success");
      return;
    }
    closeFlowModal("analyze");
    openFlowModal("approve");
  });

  modalApprovalCheck.addEventListener("change", updateModalApprovalAction);

  modalApproveButton.addEventListener("click", () => {
    if (!modalApprovalCheck.checked || !modalOccurrence.approve(currentUser)) {
      setModalMessage(modalApprovalMessage, "Confirme a revisão com um perfil autorizado antes de aprovar.");
      return;
    }
    renderModalFlow();
    closeFlowModal("approve");
    openFlowModal("execute");
  });

  modalStartExecution.addEventListener("click", () => {
    if (!modalOccurrence.start(currentUser, modalExecutionMaterials.value)) {
      setModalMessage(modalExecutionMessage, "A atividade exige aprovação e acesso da equipe técnica.");
      return;
    }
    renderModalFlow();
    setModalMessage(modalExecutionMessage, "Atividade iniciada. Informe o que foi feito e os gastos antes do encerramento.", "success");
  });

  modalSendToClose.addEventListener("click", () => {
    const cost = Number.parseFloat(modalExecutionCost.value || "0");
    const submitted = modalOccurrence.submitExecution(currentUser, {
      materials: modalExecutionMaterials.value,
      description: modalExecutionDescription.value,
      cost,
    });
    if (!submitted) {
      setModalMessage(modalExecutionMessage, "Descreva a atividade com pelo menos 8 caracteres antes de enviar ao encerramento.");
      modalExecutionDescription.focus();
      return;
    }
    renderModalFlow();
    closeFlowModal("execute");
    openFlowModal("close");
  });

  modalFinalizeButton.addEventListener("click", () => {
    if (!modalOccurrence.finalize(currentUser)) {
      setModalMessage(modalCloseMessage, "A finalização exige uma execução registrada e um perfil autorizado.");
      return;
    }
    renderModalFlow();
    setModalMessage(modalCloseMessage, "Atividade finalizada com sucesso. O histórico permanece disponível.", "success");
  });

  renderOccurrence();
  renderControl();
  configureQrRegistration();
  renderModalFlow();
  const savedUser = getUser();
  if (savedUser) setAuthenticatedView(savedUser);
  if (qrRegistrationActive) openFlowModal("register");
})();
