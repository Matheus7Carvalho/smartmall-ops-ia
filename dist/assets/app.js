(() => {
  "use strict";

  const USERS = Object.freeze([
    {
      email: "admin@smartmall.local",
      password: "demo123",
      name: "Rafael Mendes",
      role: "Administrador",
      initials: "RM",
      permissions: ["dashboard", "occurrences", "tasks", "equipment", "teams", "users", "reports"],
      description: "Você possui acesso administrativo aos indicadores, equipes e permissões do ambiente demonstrativo.",
    },
    {
      email: "supervisor@smartmall.local",
      password: "demo123",
      name: "Ana Souza",
      role: "Supervisora Operacional",
      initials: "AS",
      permissions: ["dashboard", "occurrences", "tasks", "equipment", "teams", "reports"],
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
    const allowedView = view === "occurrences" && currentUser.permissions.includes("occurrences")
      ? "occurrences"
      : "dashboard";

    dashboardContent.hidden = allowedView !== "dashboard";
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
    navigateTo("dashboard");
  }

  function setLoggedOutView() {
    currentUser = null;
    appView.hidden = true;
    authView.hidden = false;
    passwordField.value = "";
    loginError.textContent = "";
    occurrence.reset();
    clearPhoto();
    renderOccurrence();
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

  renderOccurrence();
  const savedUser = getUser();
  if (savedUser) setAuthenticatedView(savedUser);
})();
