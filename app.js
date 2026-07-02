const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const furnitureStatuses = ["Falta comprar", "Ja tenho", "Comprado"];
const furnitureCategories = ["Cozinha", "Eletrodomesticos", "Lavanderia", "Quarto", "Banheiro", "Sala e areas externas", "Decoracao", "Outros"];
const debtTypes = [
  { name: "Pessoal", group: "Essencial" },
  { name: "Lazer", group: "Nao essencial" },
  { name: "Faculdade", group: "Essencial" },
  { name: "Mercado", group: "Essencial" },
  { name: "Casa", group: "Essencial" },
  { name: "Cartao", group: "Essencial" },
  { name: "Outro", group: "Nao essencial" }
];

const starterFurniture = [
  ["Jogo de panelas", "Cozinha", 450, "Essencial"],
  ["Frigideiras antiaderentes", "Cozinha", 180, "Essencial"],
  ["Facas e utensilios", "Cozinha", 160, "Essencial"],
  ["Potes hermeticos", "Cozinha", 120, "Importante"],
  ["Escorredor de louca", "Cozinha", 90, "Essencial"],
  ["Conjunto de copos, pratos e talheres", "Cozinha", 380, "Essencial"],
  ["Liquidificador", "Eletrodomesticos", 220, "Essencial"],
  ["Air fryer", "Eletrodomesticos", 430, "Importante"],
  ["Micro-ondas", "Eletrodomesticos", 650, "Essencial"],
  ["Cafeteira eletrica", "Eletrodomesticos", 180, "Depois"],
  ["Cestos para roupa", "Lavanderia", 90, "Essencial"],
  ["Varal dobravel", "Lavanderia", 140, "Essencial"],
  ["Rodo, pa de lixo e vassoura", "Lavanderia", 110, "Essencial"],
  ["Jogos de lencois", "Quarto", 260, "Essencial"],
  ["Edredom e cobertores", "Quarto", 320, "Essencial"],
  ["Travesseiros", "Quarto", 180, "Essencial"],
  ["Cabides resistentes", "Quarto", 90, "Importante"],
  ["Jogo de toalhas", "Banheiro", 240, "Essencial"],
  ["Tapete antiderrapante", "Banheiro", 70, "Essencial"],
  ["Kit lixeira e porta-papel", "Banheiro", 120, "Importante"],
  ["Mantas para sofa", "Sala e areas externas", 120, "Depois"],
  ["Almofadas decorativas", "Sala e areas externas", 160, "Depois"],
  ["Tapete para sala", "Sala e areas externas", 350, "Depois"]
];

const defaultState = {
  settings: {
    homeTitle: "Inicio",
    primary: "#1b8a7a",
    accent: "#e88f5b",
    theme: "light",
    cardOrder: ["saved", "missing", "monthly", "furniture"]
  },
  goal: {
    extraGoal: 3000,
    moveDate: "2026-12-30",
    plannedMonthly: 5200
  },
  people: [
    { id: crypto.randomUUID(), name: "Mi", fixedCosts: 1800 },
    { id: crypto.randomUUID(), name: "Gu", fixedCosts: 2300 }
  ],
  incomes: [
    { id: crypto.randomUUID(), person: "Mi", type: "Salario", amount: 1500 },
    { id: crypto.randomUUID(), person: "Gu", type: "Salario", amount: 3500 },
    { id: crypto.randomUUID(), person: "Mi", type: "Vale alimentacao", amount: 600 }
  ],
  homeCosts: { rent: 1600, water: 120, power: 220, internet: 120, groceries: 900, other: 200 },
  texts: {
    brandSubtitle: "Plano para morar juntos",
    dashboardTitle: "Inicio",
    furnitureTitle: "Moveis",
    budgetTitle: "Orcamentos",
    financeTitle: "Financeiro",
    debtsTitle: "Dividas",
    homeCostsTitle: "Moradia",
    simulatorTitle: "Simulador",
    settingsTitle: "Editar app",
    heroGreen: "O plano fecha para a data de voces.",
    heroYellow: "Esta quase fechando, falta ajustar um pouco.",
    heroRed: "A meta precisa de um novo combinado.",
    cofrinhoTitle: "Cofrinho"
  },
  savings: [
    { id: crypto.randomUUID(), person: "Mi", amount: 6500, note: "Guardado inicial", date: "2026-06-25" },
    { id: crypto.randomUUID(), person: "Gu", amount: 6000, note: "Guardado inicial", date: "2026-06-25" }
  ],
  furniture: [
    { id: crypto.randomUUID(), name: "Geladeira", category: "Cozinha", value: 3100, link: "", image: "", priority: "Essencial", status: "Falta comprar" },
    { id: crypto.randomUUID(), name: "Sofa", category: "Sala e areas externas", value: 2400, link: "", image: "", priority: "Importante", status: "Falta comprar" },
    { id: crypto.randomUUID(), name: "Cama casal", category: "Quarto", value: 1900, link: "", image: "", priority: "Essencial", status: "Ja tenho" },
    ...starterFurniture.map(([name, category, value, priority]) => ({ id: crypto.randomUUID(), name, category, value, link: "", image: "", priority, status: "Falta comprar" }))
  ],
  budgets: [],
  debts: [
    { id: crypto.randomUUID(), name: "Cartao", owner: "Mi", type: "Cartao", group: "Essencial", total: 4200, paid: 900, minimum: 450, dueDate: "2026-10-30" }
  ]
};

let state = loadState();
let activeView = "dashboard";
let editing = false;

function loadState() {
  const saved = localStorage.getItem("migu-state");
  if (!saved) return structuredClone(defaultState);

  try {
    return migrateState(JSON.parse(saved));
  } catch {
    return structuredClone(defaultState);
  }
}

function migrateState(oldState) {
  const next = structuredClone(defaultState);
  next.settings = { ...next.settings, ...(oldState.settings || {}) };
  next.goal = {
    extraGoal: Number(oldState.goal?.extraGoal ?? Math.max(0, Number(oldState.goal?.total || 0) - Number(oldState.furniture?.reduce?.((sum, item) => sum + Number(item.value || 0), 0) || 0))),
    moveDate: oldState.goal?.moveDate || next.goal.moveDate,
    plannedMonthly: Number(oldState.goal?.plannedMonthly ?? oldState.goal?.monthlySaving ?? next.goal.plannedMonthly)
  };

  if (Array.isArray(oldState.people)) {
    next.people = oldState.people.map(person => ({ id: person.id || crypto.randomUUID(), name: person.name || "Pessoa", fixedCosts: Number(person.fixedCosts || 0) }));
    next.incomes = Array.isArray(oldState.incomes) ? oldState.incomes : oldState.people.map(person => ({ id: crypto.randomUUID(), person: person.name || "Pessoa", type: "Salario", amount: Number(person.income || 0) }));
  } else if (oldState.finance) {
    next.people = [
      { id: crypto.randomUUID(), name: "Pessoa 1", fixedCosts: Math.round(Number(oldState.finance.fixedCosts || 0) / 2) },
      { id: crypto.randomUUID(), name: "Pessoa 2", fixedCosts: Math.round(Number(oldState.finance.fixedCosts || 0) / 2) }
    ];
    next.incomes = [
      { id: crypto.randomUUID(), person: "Pessoa 1", type: "Salario", amount: Number(oldState.finance.incomeA || 0) },
      { id: crypto.randomUUID(), person: "Pessoa 2", type: "Salario", amount: Number(oldState.finance.incomeB || 0) }
    ];
  }
  if (Array.isArray(oldState.incomes)) next.incomes = oldState.incomes.map(income => ({ id: income.id || crypto.randomUUID(), person: income.person || next.people[0]?.name || "Pessoa", type: income.type || "Salario", amount: Number(income.amount || 0) }));
  next.homeCosts = { ...next.homeCosts, ...(oldState.homeCosts || {}) };
  next.texts = { ...next.texts, ...(oldState.texts || {}) };

  next.savings = Array.isArray(oldState.savings) ? oldState.savings : [
    { id: crypto.randomUUID(), person: next.people[0]?.name || "Casal", amount: Number(oldState.goal?.saved || 0), note: "Valor guardado", date: "2026-06-25" }
  ];

  if (Array.isArray(oldState.furniture)) {
    next.furniture = oldState.furniture.map(item => ({
      id: item.id || crypto.randomUUID(),
      name: item.name || "Item",
      category: normalizeCategory(item.category),
      value: Number(item.value || 0),
      link: item.link || "",
      image: item.image || "",
      priority: item.priority || "Importante",
      status: item.status === "Pesquisando" || item.status === "Escolhido" ? "Falta comprar" : item.status || "Falta comprar"
    }));
  }

  next.budgets = Array.isArray(oldState.budgets) ? oldState.budgets.map(budget => ({ ...budget, id: budget.id || crypto.randomUUID() })) : [];
  next.debts = Array.isArray(oldState.debts) ? oldState.debts.map(debt => ({
    id: debt.id || crypto.randomUUID(),
    name: debt.name || "Divida",
    owner: debt.owner || next.people[0]?.name || "Casal",
    type: debt.type || "Cartao",
    group: debt.group || groupForDebtType(debt.type || "Cartao"),
    total: Number(debt.total || 0),
    paid: Number(debt.paid || 0),
    minimum: Number(debt.minimum || 0),
    dueDate: debt.dueDate || "2026-12-30"
  })) : next.debts;

  return next;
}

function saveState() {
  localStorage.setItem("migu-state", JSON.stringify(state));
}

function normalizeCategory(category) {
  if (!category) return "Outros";
  if (category === "Sala") return "Sala e areas externas";
  return furnitureCategories.includes(category) ? category : category;
}

function groupForDebtType(type) {
  return debtTypes.find(item => item.name === type)?.group || "Nao essencial";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function monthsUntil(dateString) {
  const now = new Date("2026-07-02T00:00:00");
  const target = new Date(`${dateString || today()}T00:00:00`);
  const months = (target.getFullYear() - now.getFullYear()) * 12 + target.getMonth() - now.getMonth();
  return Math.max(1, months);
}

function furnitureMissingTotal() {
  return state.furniture
    .filter(item => item.status !== "Ja tenho")
    .reduce((sum, item) => sum + Number(item.value || 0), 0);
}

function savedTotal() {
  return state.savings.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

function debtMonthlyTotal() {
  return state.debts.reduce((sum, debt) => sum + Number(debt.minimum || 0), 0);
}

function calc() {
  const furnitureTotal = furnitureMissingTotal();
  const goalTotal = furnitureTotal + Number(state.goal.extraGoal || 0);
  const saved = savedTotal();
  const missing = Math.max(0, goalTotal - saved);
  const months = monthsUntil(state.goal.moveDate);
  const neededMonthly = missing / months;
  const income = state.incomes.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const fixedCosts = state.people.reduce((sum, person) => sum + Number(person.fixedCosts || 0), 0);
  const commitments = fixedCosts + debtMonthlyTotal();
  const surplus = income - commitments;
  const percent = goalTotal ? Math.min(100, (saved / goalTotal) * 100) : 0;
  const ratio = neededMonthly ? Number(state.goal.plannedMonthly || 0) / neededMonthly : 1;
  const signal = ratio >= 1 ? "Verde" : ratio >= 0.7 ? "Amarelo" : "Vermelho";
  return { goalTotal, saved, missing, months, neededMonthly, income, fixedCosts, commitments, surplus, furnitureTotal, percent, signal };
}

function applyTheme() {
  document.documentElement.style.setProperty("--primary", state.settings.primary);
  document.documentElement.style.setProperty("--accent", state.settings.accent);
  document.body.classList.toggle("dark", state.settings.theme === "dark");
}

function render() {
  applyTheme();
  document.body.classList.toggle("editing", editing);
  renderEditableTexts();
  document.getElementById("screenTitle").textContent = activeView === "dashboard" ? state.texts.dashboardTitle : titleFor(activeView);
  populateSelects();
  renderForms();
  renderDashboard();
  renderFurniture();
  renderBudgets();
  renderFinance();
  renderDebts();
  renderHomeCosts();
  renderSettings();
}

function renderEditableTexts() {
  document.querySelector(".brand span").textContent = state.texts.brandSubtitle;
  const labels = {
    dashboard: state.texts.dashboardTitle,
    furniture: state.texts.furnitureTitle,
    budget: state.texts.budgetTitle,
    finance: state.texts.financeTitle,
    debts: state.texts.debtsTitle,
    homeCosts: state.texts.homeCostsTitle,
    simulator: state.texts.simulatorTitle,
    settings: state.texts.settingsTitle
  };
  Object.entries(labels).forEach(([view, label]) => {
    const button = document.querySelector(`.nav-item[data-view="${view}"]`);
    if (button) button.textContent = label;
  });
}

function titleFor(view) {
  const t = state.texts || defaultState.texts;
  return {
    furniture: t.furnitureTitle,
    budget: t.budgetTitle,
    finance: t.financeTitle,
    debts: t.debtsTitle,
    homeCosts: t.homeCostsTitle,
    simulator: t.simulatorTitle,
    settings: t.settingsTitle
  }[view] || "Inicio";
}

function populateSelects() {
  document.getElementById("furnitureCategorySelect").innerHTML = furnitureCategories.map(category => `<option>${category}</option>`).join("");
  document.getElementById("debtTypeSelect").innerHTML = debtTypes.map(type => `<option>${type.name}</option>`).join("");
  const personOptions = state.people.map(person => `<option>${person.name}</option>`).join("");
  document.getElementById("savingPersonSelect").innerHTML = personOptions;
  document.getElementById("debtOwnerSelect").innerHTML = personOptions || "<option>Casal</option>";
  document.getElementById("incomePersonSelect").innerHTML = personOptions;
}

function renderForms() {
  const goalForm = document.getElementById("goalForm");
  goalForm.extraGoal.value = state.goal.extraGoal;
  goalForm.moveDate.value = state.goal.moveDate;
  goalForm.plannedMonthly.value = state.goal.plannedMonthly;

  const savingForm = document.getElementById("savingForm");
  if (!savingForm.date.value) savingForm.date.value = today();

  const settingsForm = document.getElementById("settingsForm");
  settingsForm.homeTitle.value = state.settings.homeTitle;
  settingsForm.primary.value = state.settings.primary;
  settingsForm.accent.value = state.settings.accent;
  settingsForm.theme.value = state.settings.theme;

  const homeCostForm = document.getElementById("homeCostForm");
  Object.entries(state.homeCosts).forEach(([key, value]) => {
    if (homeCostForm.elements[key]) homeCostForm.elements[key].value = value;
  });
}

function renderDashboard() {
  const data = calc();
  const signal = document.getElementById("goalSignal");
  signal.querySelector("strong").textContent = data.signal;
  signal.style.background = data.signal === "Verde" ? "var(--green)" : data.signal === "Amarelo" ? "var(--yellow)" : "var(--red)";
  document.getElementById("heroMessage").textContent = data.signal === "Verde" ? state.texts.heroGreen : data.signal === "Amarelo" ? state.texts.heroYellow : state.texts.heroRed;
  document.getElementById("heroSub").textContent = `Meta atual ${money.format(data.goalTotal)}: ${money.format(data.furnitureTotal)} em itens que faltam + ${money.format(state.goal.extraGoal)} de custos extras.`;
  document.getElementById("goalPercent").textContent = `${Math.round(data.percent)}%`;
  document.getElementById("goalProgress").style.width = `${data.percent}%`;

  const cards = {
    saved: ["Cofrinho", money.format(data.saved)],
    missing: ["Falta", money.format(data.missing)],
    monthly: ["Necessario por mes", money.format(data.neededMonthly)],
    furniture: ["Itens que faltam", money.format(data.furnitureTotal)]
  };
  document.getElementById("dashboardCards").innerHTML = state.settings.cardOrder.map(key => `<article class="metric-card"><span>${cards[key][0]}</span><strong>${cards[key][1]}</strong></article>`).join("");

  const pending = state.furniture.filter(item => item.status === "Falta comprar");
  document.getElementById("pendingCount").textContent = `${pending.length} itens`;
  document.getElementById("quickFurniture").innerHTML = pending.slice(0, 8).map(item => compactRow(item.name, money.format(item.value))).join("") || "<p>Nenhum item pendente.</p>";
  document.getElementById("savingsTotal").textContent = money.format(data.saved);
  document.getElementById("savingsList").innerHTML = state.savings.slice().reverse().map(saving => `
    <div class="compact-row">
      <div><strong>${saving.person}</strong><span>${saving.note || "Cofrinho"} - ${saving.date || ""}</span></div>
      <div class="row-actions"><span>${money.format(saving.amount)}</span><button data-edit-saving="${saving.id}">Editar</button><button data-delete-saving="${saving.id}">Excluir</button></div>
    </div>
  `).join("") || "<p>Nenhum valor guardado ainda.</p>";
}

function renderFurniture() {
  document.getElementById("furnitureBoard").innerHTML = furnitureStatuses.map(status => {
    const cards = state.furniture.filter(item => item.status === status).map(item => furnitureCard(item)).join("");
    return `<section class="kanban-column" data-status="${status}"><h3>${status}</h3>${cards || "<p>Nenhum item aqui.</p>"}</section>`;
  }).join("");

  const categoryRows = furnitureCategories.map(category => {
    const missing = state.furniture.filter(item => item.category === category && item.status === "Falta comprar");
    const have = state.furniture.filter(item => item.category === category && item.status !== "Falta comprar");
    return `<article class="metric-card"><span>${category}</span><strong>${missing.length} faltam</strong><small>${have.length} ja tem/comprado</small></article>`;
  }).join("");
  document.getElementById("categorySummary").innerHTML = categoryRows;
  const missingItems = state.furniture.filter(item => item.status === "Falta comprar");
  const ownedItems = state.furniture.filter(item => item.status === "Ja tenho" || item.status === "Comprado");
  document.getElementById("missingChecklist").innerHTML = missingItems.map(item => checklistRow(item, false)).join("") || "<p>Nenhum item faltando.</p>";
  document.getElementById("ownedChecklist").innerHTML = ownedItems.map(item => checklistRow(item, true)).join("") || "<p>Nada marcado como ja tenho.</p>";

  document.querySelectorAll(".item-card[data-id]").forEach(card => {
    card.draggable = editing;
    card.addEventListener("dragstart", event => event.dataTransfer.setData("text/plain", card.dataset.id));
  });

  document.querySelectorAll(".kanban-column").forEach(column => {
    column.addEventListener("dragover", event => event.preventDefault());
    column.addEventListener("drop", event => {
      if (!editing) return;
      const item = state.furniture.find(entry => entry.id === event.dataTransfer.getData("text/plain"));
      if (item) {
        item.status = column.dataset.status;
        saveState();
        render();
      }
    });
  });

  const select = document.getElementById("budgetItemSelect");
  select.innerHTML = state.furniture.map(item => `<option value="${item.id}">${item.name}</option>`).join("");
}

function checklistRow(item, checked) {
  return `<label class="check-row">
    <input type="checkbox" data-toggle-owned="${item.id}" ${checked ? "checked" : ""}>
    <span>${item.name}</span>
    <small>${item.category} - ${money.format(item.value || 0)}</small>
  </label>`;
}

function furnitureCard(item) {
  const image = item.image ? `<img src="${item.image}" alt="">` : "";
  const link = item.link ? `<a href="${item.link}" target="_blank" rel="noreferrer">Abrir link</a>` : "";
  return `<article class="item-card" data-id="${item.id}">
    ${image}
    <strong>${item.name}</strong>
    <span>${money.format(item.value || 0)}</span>
    <div class="pill-row"><span class="pill">${item.category || "Sem categoria"}</span><span class="pill">${item.priority}</span></div>
    ${link}
    <div class="row-actions"><button data-edit-furniture="${item.id}">Editar</button><button data-delete-furniture="${item.id}">Excluir</button></div>
  </article>`;
}

function renderBudgets() {
  document.getElementById("budgetList").innerHTML = state.budgets.map(budget => {
    const item = state.furniture.find(entry => entry.id === budget.itemId);
    const total = Number(budget.product || 0) + Number(budget.shipping || 0);
    return `<article class="item-card">
      <strong>${item?.name || "Item"}</strong>
      <span>${budget.store}</span>
      <span>${money.format(total)}</span>
      ${budget.link ? `<a href="${budget.link}" target="_blank" rel="noreferrer">Abrir loja</a>` : ""}
      <div class="row-actions"><button data-edit-budget="${budget.id}">Editar</button><button data-delete-budget="${budget.id}">Excluir</button></div>
    </article>`;
  }).join("") || `<div class="result-card">Adicione orcamentos para comparar lojas e valores.</div>`;
}

function renderFinance() {
  document.getElementById("personList").innerHTML = state.people.map(person => `
    <article class="item-card">
      <strong>${person.name}</strong>
      <span>Receitas: ${money.format(incomeForPerson(person.name))}</span>
      <span>Gastos fixos: ${money.format(person.fixedCosts || 0)}</span>
      <span>Sobra individual: ${money.format(incomeForPerson(person.name) - Number(person.fixedCosts || 0))}</span>
      <div class="row-actions"><button data-edit-person="${person.id}">Editar</button><button data-delete-person="${person.id}">Excluir</button></div>
    </article>
  `).join("");

  document.getElementById("incomeList").innerHTML = state.incomes.map(entry => `
    <article class="item-card">
      <strong>${entry.person}</strong>
      <span>${entry.type}</span>
      <span>${money.format(entry.amount || 0)}</span>
      <div class="row-actions"><button data-edit-income="${entry.id}">Editar</button><button data-delete-income="${entry.id}">Excluir</button></div>
    </article>
  `).join("") || `<div class="result-card">Cadastre salario, vale alimentacao, extras e beneficios.</div>`;

  const data = calc();
  document.getElementById("financeCards").innerHTML = [
    ["Receita total", money.format(data.income)],
    ["Gastos fixos", money.format(data.fixedCosts)],
    ["Dividas minimas", money.format(debtMonthlyTotal())],
    ["Sobra mensal", money.format(data.surplus)]
  ].map(([label, value]) => `<article class="metric-card"><span>${label}</span><strong>${value}</strong></article>`).join("");
}

function incomeForPerson(name) {
  return state.incomes.filter(entry => entry.person === name).reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
}

function renderHomeCosts() {
  const data = calc();
  const costs = state.homeCosts;
  const homeTotal = Object.values(costs).reduce((sum, value) => sum + Number(value || 0), 0);
  const availableAfterGoal = data.surplus - Number(state.goal.plannedMonthly || 0);
  const recommendedRent = Math.max(0, Math.min(data.income * 0.3, availableAfterGoal - (homeTotal - Number(costs.rent || 0))));
  const balance = availableAfterGoal - homeTotal;
  document.getElementById("homeCostCards").innerHTML = [
    ["Sobra antes da moradia", money.format(data.surplus)],
    ["Depois de guardar para meta", money.format(availableAfterGoal)],
    ["Custo previsto da casa", money.format(homeTotal)],
    ["Aluguel ideal maximo", money.format(recommendedRent)]
  ].map(([label, value]) => `<article class="metric-card"><span>${label}</span><strong>${value}</strong></article>`).join("");

  const totalIncome = Math.max(1, data.income);
  document.getElementById("homeCostSplit").innerHTML = state.people.map(person => {
    const ratio = incomeForPerson(person.name) / totalIncome;
    return `<article class="item-card">
      <strong>${person.name}</strong>
      <span>Participacao sugerida: ${Math.round(ratio * 100)}%</span>
      <span>Parte da moradia: ${money.format(homeTotal * ratio)}</span>
      <span>Saldo do casal depois: ${money.format(balance)}</span>
    </article>`;
  }).join("");
}

function renderDebts() {
  const grouped = debtTypes.map(type => {
    const list = state.debts.filter(debt => debt.type === type.name);
    const total = list.reduce((sum, debt) => sum + Math.max(0, Number(debt.total || 0) - Number(debt.paid || 0)), 0);
    return `<article class="metric-card"><span>${type.name} - ${type.group}</span><strong>${money.format(total)}</strong><small>${list.length} dividas</small></article>`;
  }).join("");
  document.getElementById("debtGroups").innerHTML = grouped;

  document.getElementById("debtList").innerHTML = state.debts.map(debt => {
    const remaining = Math.max(0, Number(debt.total || 0) - Number(debt.paid || 0));
    const monthly = remaining / monthsUntil(debt.dueDate);
    return `<article class="item-card">
      <strong>${debt.name}</strong>
      <span>${debt.owner || "Casal"}</span>
      <span>${debt.type} - ${debt.group}</span>
      <span>Saldo: ${money.format(remaining)}</span>
      <span>Para quitar: ${money.format(monthly)} por mes</span>
      <div class="pill-row"><span class="pill">Minimo ${money.format(debt.minimum || 0)}</span></div>
      <div class="row-actions"><button data-edit-debt="${debt.id}">Editar</button><button data-delete-debt="${debt.id}">Excluir</button></div>
    </article>`;
  }).join("") || `<div class="result-card">Nenhuma divida cadastrada.</div>`;
}

function renderSettings() {
  document.getElementById("cardOrder").innerHTML = state.settings.cardOrder.map((key, index) => {
    const names = { saved: "Cofrinho", missing: "Falta", monthly: "Necessario por mes", furniture: "Itens que faltam" };
    return `<div class="compact-row"><strong>${names[key]}</strong><div class="row-actions"><button data-move="${index}" data-dir="-1">Subir</button><button data-move="${index}" data-dir="1">Descer</button></div></div>`;
  }).join("");

  const labels = {
    brandSubtitle: "Subtitulo da marca",
    dashboardTitle: "Titulo Inicio",
    furnitureTitle: "Titulo Moveis",
    budgetTitle: "Titulo Orcamentos",
    financeTitle: "Titulo Financeiro",
    debtsTitle: "Titulo Dividas",
    homeCostsTitle: "Titulo Moradia",
    simulatorTitle: "Titulo Simulador",
    settingsTitle: "Titulo Editar app",
    heroGreen: "Frase farol verde",
    heroYellow: "Frase farol amarelo",
    heroRed: "Frase farol vermelho",
    cofrinhoTitle: "Titulo Cofrinho"
  };
  document.getElementById("textForm").innerHTML = Object.entries(labels).map(([key, label]) => `
    <label>${label}<input name="${key}" value="${state.texts[key] || ""}"></label>
  `).join("") + `<button type="submit">Salvar textos</button>`;
}

function compactRow(left, right) {
  return `<div class="compact-row"><strong>${left}</strong><span>${right}</span></div>`;
}

function clearForm(form, cancelButtonId) {
  form.reset();
  if (form.elements.id) form.elements.id.value = "";
  const cancel = document.getElementById(cancelButtonId);
  if (cancel) cancel.classList.add("hidden-field");
}

function setFormValues(form, values) {
  Object.entries(values).forEach(([key, value]) => {
    if (form.elements[key]) form.elements[key].value = value ?? "";
  });
}

function removeById(list, id) {
  const index = list.findIndex(item => item.id === id);
  if (index >= 0) list.splice(index, 1);
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    activeView = button.dataset.view;
    document.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item === button));
    document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view.id === activeView));
    render();
  });
});

document.getElementById("toggleEdit").addEventListener("click", () => {
  editing = !editing;
  document.getElementById("toggleEdit").textContent = editing ? "Usando" : "Editar";
  render();
});

document.getElementById("toggleTheme").addEventListener("click", () => {
  state.settings.theme = state.settings.theme === "light" ? "dark" : "light";
  saveState();
  render();
});

document.getElementById("goalForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  state.goal = {
    extraGoal: Number(form.extraGoal.value),
    moveDate: form.moveDate.value,
    plannedMonthly: Number(form.plannedMonthly.value)
  };
  saveState();
  render();
});

document.getElementById("savingForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  const entry = { id: form.elements.id.value || crypto.randomUUID(), person: form.person.value, amount: Number(form.amount.value), note: form.note.value, date: form.date.value };
  const existing = state.savings.find(item => item.id === entry.id);
  if (existing) Object.assign(existing, entry); else state.savings.push(entry);
  clearForm(form, "cancelSavingEdit");
  form.date.value = today();
  saveState();
  render();
});

document.getElementById("furnitureForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  const entry = { id: form.elements.id.value || crypto.randomUUID(), name: form.name.value, category: form.category.value, value: Number(form.value.value), status: form.status.value, link: form.link.value, image: form.image.value, priority: form.priority.value };
  const existing = state.furniture.find(item => item.id === entry.id);
  if (existing) Object.assign(existing, entry); else state.furniture.push(entry);
  clearForm(form, "cancelFurnitureEdit");
  saveState();
  render();
});

document.getElementById("budgetForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  const entry = { id: form.elements.id.value || crypto.randomUUID(), itemId: form.itemId.value, store: form.store.value, product: Number(form.product.value), shipping: Number(form.shipping.value), link: form.link.value, image: form.image.value };
  const existing = state.budgets.find(item => item.id === entry.id);
  if (existing) Object.assign(existing, entry); else state.budgets.push(entry);
  clearForm(form, "cancelBudgetEdit");
  saveState();
  render();
});

document.getElementById("personForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  const entry = { id: form.elements.id.value || crypto.randomUUID(), name: form.name.value, fixedCosts: Number(form.fixedCosts.value) };
  const existing = state.people.find(item => item.id === entry.id);
  if (existing) Object.assign(existing, entry); else state.people.push(entry);
  clearForm(form, "cancelPersonEdit");
  saveState();
  render();
});

document.getElementById("incomeForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  const entry = { id: form.elements.id.value || crypto.randomUUID(), person: form.person.value, type: form.type.value, amount: Number(form.amount.value) };
  const existing = state.incomes.find(item => item.id === entry.id);
  if (existing) Object.assign(existing, entry); else state.incomes.push(entry);
  clearForm(form, "cancelIncomeEdit");
  saveState();
  render();
});

document.getElementById("debtForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  const entry = { id: form.elements.id.value || crypto.randomUUID(), name: form.name.value, owner: form.owner.value, type: form.type.value, group: form.group.value, total: Number(form.total.value), paid: Number(form.paid.value), minimum: Number(form.minimum.value), dueDate: form.dueDate.value };
  const existing = state.debts.find(item => item.id === entry.id);
  if (existing) Object.assign(existing, entry); else state.debts.push(entry);
  clearForm(form, "cancelDebtEdit");
  saveState();
  render();
});

document.getElementById("debtTypeSelect").addEventListener("change", event => {
  document.getElementById("debtForm").group.value = groupForDebtType(event.target.value);
});

document.getElementById("homeCostForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  state.homeCosts = {
    rent: Number(form.rent.value),
    water: Number(form.water.value),
    power: Number(form.power.value),
    internet: Number(form.internet.value),
    groceries: Number(form.groceries.value),
    other: Number(form.other.value)
  };
  saveState();
  render();
});

document.getElementById("simForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  const missing = Math.max(0, Number(form.target.value) - Number(form.saved.value));
  const months = monthsUntil(form.date.value);
  const needed = missing / months;
  const current = Number(form.monthly.value);
  const closes = current >= needed;
  document.getElementById("simResult").textContent = closes
    ? `Fecha sim: voces precisam de ${money.format(needed)} por mes e informaram ${money.format(current)}.`
    : `Ainda nao fecha: faltam ${money.format(needed - current)} por mes para bater a data.`;
});

document.getElementById("settingsForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  state.settings.homeTitle = form.homeTitle.value;
  state.settings.primary = form.primary.value;
  state.settings.accent = form.accent.value;
  state.settings.theme = form.theme.value;
  saveState();
  render();
});

document.getElementById("textForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  Object.keys(state.texts).forEach(key => {
    if (form.elements[key]) state.texts[key] = form.elements[key].value;
  });
  state.settings.homeTitle = state.texts.dashboardTitle;
  saveState();
  render();
});

document.getElementById("resetApp").addEventListener("click", () => {
  state = structuredClone(defaultState);
  saveState();
  render();
});

document.addEventListener("click", event => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const actions = [
    ["editSaving", state.savings, "savingForm", "cancelSavingEdit"],
    ["editFurniture", state.furniture, "furnitureForm", "cancelFurnitureEdit"],
    ["editBudget", state.budgets, "budgetForm", "cancelBudgetEdit"],
    ["editPerson", state.people, "personForm", "cancelPersonEdit"],
    ["editIncome", state.incomes, "incomeForm", "cancelIncomeEdit"],
    ["editDebt", state.debts, "debtForm", "cancelDebtEdit"]
  ];

  for (const [attr, list, formId, cancelId] of actions) {
    const id = target.dataset[attr];
    if (id) {
      const item = list.find(entry => entry.id === id);
      if (item) {
        const form = document.getElementById(formId);
        setFormValues(form, item);
        document.getElementById(cancelId).classList.remove("hidden-field");
        form.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
  }

  const deletes = [
    ["deleteSaving", state.savings],
    ["deleteFurniture", state.furniture],
    ["deleteBudget", state.budgets],
    ["deletePerson", state.people],
    ["deleteIncome", state.incomes],
    ["deleteDebt", state.debts]
  ];

  for (const [attr, list] of deletes) {
    const id = target.dataset[attr];
    if (id) {
      removeById(list, id);
      saveState();
      render();
      return;
    }
  }

  const ownedId = target.dataset.toggleOwned;
  if (ownedId) {
    const item = state.furniture.find(entry => entry.id === ownedId);
    if (item) {
      item.status = target.checked ? "Ja tenho" : "Falta comprar";
      saveState();
      render();
    }
  }
});

[
  ["cancelSavingEdit", "savingForm"],
  ["cancelFurnitureEdit", "furnitureForm"],
  ["cancelBudgetEdit", "budgetForm"],
  ["cancelPersonEdit", "personForm"],
  ["cancelIncomeEdit", "incomeForm"],
  ["cancelDebtEdit", "debtForm"]
].forEach(([buttonId, formId]) => {
  document.getElementById(buttonId).addEventListener("click", () => {
    clearForm(document.getElementById(formId), buttonId);
    render();
  });
});

document.getElementById("cardOrder").addEventListener("click", event => {
  const button = event.target.closest("button[data-move]");
  if (!button) return;
  const from = Number(button.dataset.move);
  const to = from + Number(button.dataset.dir);
  if (to < 0 || to >= state.settings.cardOrder.length) return;
  const [item] = state.settings.cardOrder.splice(from, 1);
  state.settings.cardOrder.splice(to, 0, item);
  saveState();
  render();
});

render();
