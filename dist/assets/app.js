(() => {
  "use strict";

  const USERS = Object.freeze([
    { email: "admin@smartmall.local", password: "demo123", name: "Rafael Mendes", role: "Administrador", initials: "RM", permissions: ["dashboard", "occurrences", "tasks", "equipment", "teams", "users", "reports"], description: "Você possui acesso administrativo aos indicadores, equipes e permissões do ambiente demonstrativo." },
    { email: "supervisor@smartmall.local", password: "demo123", name: "Ana Souza", role: "Supervisora Operacional", initials: "AS", permissions: ["dashboard", "occurrences", "tasks", "equipment", "teams", "reports"], description: "Você pode acompanhar a operação, revisar ocorrências e coordenar equipes." },
    { email: "funcionario@smartmall.local", password: "demo123", name: "João Costa", role: "Funcionário", initials: "JC", permissions: ["dashboard", "tasks", "equipment"], description: "Você pode consultar sua operação, tarefas e o estado dos equipamentos." },
  ]);

  const storageKey = "smartmall-ops-ia-demo-session";
  const authView = document.querySelector("#auth-view");
  const appView = document.querySelector("#app-view");
  const emailField = document.querySelector("#email");
  const passwordField = document.querySelector("#password");
  const loginError = document.querySelector("#login-error");

  const getUser = () => {
    try {
      const email = sessionStorage.getItem(storageKey);
      return USERS.find((user) => user.email === email) || null;
    } catch { return null; }
  };

  const setSession = (user) => sessionStorage.setItem(storageKey, user.email);
  const clearSession = () => sessionStorage.removeItem(storageKey);

  function setAuthenticatedView(user) {
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
      const allowed = user.permissions.includes(item.dataset.permission);
      item.hidden = !allowed;
    });
  }

  function setLoggedOutView() {
    appView.hidden = true;
    authView.hidden = false;
    passwordField.value = "";
    loginError.textContent = "";
    emailField.focus();
  }

  function permissionLabel(permission) {
    return ({ dashboard: "Dashboard", occurrences: "Ocorrências", tasks: "Tarefas", equipment: "Equipamentos", teams: "Equipes", users: "Usuários e permissões", reports: "Relatórios" })[permission];
  }

  document.querySelector("#login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const user = USERS.find((candidate) => candidate.email === emailField.value.trim().toLowerCase() && candidate.password === passwordField.value);
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

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
    });
  });

  const currentUser = getUser();
  if (currentUser) setAuthenticatedView(currentUser);
})();
