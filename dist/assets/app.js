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
      permissions: ["dashboard", "tasks", "equipment"],
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

  let currentUser = null;
  let photoUrl = "";

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
    const availableViews = new Set(["dashboard", "control", "occurrences"]);
    const allowedView = availableViews.has(view) && currentUser.permissions.includes(view)
      ? view
      : "dashboard";

    dashboardContent.hidden = allowedView !== "dashboard";
    controlView.hidden = allowedView !== "control";
    occurrencesView.hidden = allowedView !== "occurrences";
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
    clearPhoto();
    renderOccurrence();
    setControlMessage("");
    renderControl();
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

  function renderControlTeams() {
    const availableTeams = CONTROL_ROSTER.filter((team) => team.available).length;
    controlTeamCount.textContent = String(CONTROL_ROSTER.length);
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

  renderOccurrence();
  renderControl();
  const savedUser = getUser();
  if (savedUser) setAuthenticatedView(savedUser);
})();
