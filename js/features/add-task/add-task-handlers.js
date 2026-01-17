/**
 * Registriert Prioritäts-Button Event-Handler
 * @param {*} state
 * @returns {*}
 */
function wirePrioButtons(state) {
  state.form.querySelectorAll(".prio-btn").forEach((btn) => {
    btn.addEventListener("click", () => handlePrioButton(state, btn));
  });
}

/**
 * Behandelt Prioritäts-Button Klicks
 * @param {*} state
 * @param {*} btn
 * @returns {*}
 */
function handlePrioButton(state, btn) {
  clearPrioActive(state);
  btn.classList.add("is-active");
  state.selectedPrio = btn.dataset.prio;
}

/**
 * Entfernt aktive Klasse von allen Prioritäts-Buttons
 * @param {*} state
 * @returns {*}
 */
function clearPrioActive(state) {
  state.form.querySelectorAll(".prio-btn").forEach((b) => b.classList.remove("is-active"));
}

/**
 * Registriert Clear-Button Event-Handler
 * @param {*} state
 * @param {*} resets
 * @returns {*}
 */
function wireClearButton(state, resets) {
  document.getElementById("clearBtn")?.addEventListener("click", () => {
    clearAddTaskForm(state, resets);
  });
}

/**
 * Setzt das gesamte Formular zurück
 * @param {*} state
 * @param {*} resets
 * @returns {*}
 */
function clearAddTaskForm(state, resets) {
  resetForm(state);
  resetStatusPreset();
  resetSelectionState(state);
  clearCategoryInput(state);
  resets.resetCategoryUi?.();
  resets.resetAssignedUi?.();
  renderSubtasks(state);
  clearAddTaskErrors(state);
  updateCreateButtonState(state);
}

/**
 * Setzt das DOM-Formular zurück
 * @param {*} state
 * @returns {*}
 */
function resetForm(state) {
  state.form.reset();
}

/**
 * Setzt Status-Dropdown auf Standard-Wert
 * @returns {*}
 */
function resetStatusPreset() {
  const statusField = document.getElementById("taskStatusPreset");
  if (statusField) statusField.value = statusField.value || "todo";
}

/**
 * Setzt State-Selektionen zurück
 * @param {*} state
 * @returns {*}
 */
function resetSelectionState(state) {
  state.selectedCategory = "";
  state.selectedAssigned = [];
  state.selectedSubtasks = [];
}

/**
 * Löscht Kategorie-Input Wert
 * @param {*} state
 * @returns {*}
 */
function clearCategoryInput(state) {
  if (state.categoryInput) state.categoryInput.value = "";
}

/**
 * Registriert Submit-Handler für das Formular
 * @param {*} state
 * @param {*} onClose
 * @returns {*}
 */
function wireSubmitHandler(state, onClose) {
  disableForGuests(state.createBtn, async (e) => {
    e?.preventDefault();
    await handleSubmit(state, onClose);
  });
  state.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isGuest()) return;
    await handleSubmit(state, onClose);
  });
}

/**
 * Behandelt Form-Submit mit Validierung
 * @param {*} state
 * @param {*} onClose
 * @returns {*}
 */
async function handleSubmit(state, onClose) {
  const values = validateTaskForm(state);
  if (!values) return;
  await submitTaskForm(state, values, onClose);
}

/**
 * Speichert Task nach erfolgreicher Validierung
 * @param {*} state
 * @param {*} values
 * @param {*} onClose
 * @returns {*}
 */
async function submitTaskForm(state, values, onClose) {
  setCreateButtonBusy(state, true);
  try {
    await persistTask(state, values);
    await refreshBoardIfNeeded();
    onClose?.();
  } finally {
    setCreateButtonBusy(state, false);
  }
}

/**
 * Persistiert Task in DB (neu oder Update)
 * @param {*} state
 * @param {*} values
 * @returns {*}
 */
async function persistTask(state, values) {
  if (state.mode === "edit" && state.task?.id) return updateExistingTask(state, values);
  return createNewTask(state, values);
}

/**
 * Aktualisiert existierende Task
 * @param {*} state
 * @param {*} values
 * @returns {*}
 */
async function updateExistingTask(state, values) {
  const updatedTask = buildTaskPayload(state, values, state.task);
  await TaskService.update(state.task.id, updatedTask);
}

/**
 * Erstellt neue Task
 * @param {*} state
 * @param {*} values
 * @returns {*}
 */
async function createNewTask(state, values) {
  const newTask = buildTaskPayload(state, values, { id: generateTaskId() });
  await TaskService.create(newTask);
}

/**
 * Erstellt Task-Payload für DB
 * @param {*} state
 * @param {*} values
 * @param {*} base
 * @returns {*}
 */
function buildTaskPayload(state, values, base) {
  return {
    ...base,
    title: values.title,
    description: values.description,
    status: values.status,
    category: values.category,
    prio: state.selectedPrio,
    assigned: state.selectedAssigned,
    dueDate: values.dueDate,
    subtasks: state.selectedSubtasks,
  };
}

/**
 * Aktualisiert Board nach Task-Speicherung
 * @returns {*}
 */
async function refreshBoardIfNeeded() {
  if (typeof loadTasks !== "function") return;
  await loadTasks();
  if (typeof renderBoard !== "function") renderBoard();
}

/**
 * Registriert Create-Button State Change Handler
 * @param {*} state
 * @returns {*}
 */
function wireCreateButtonState(state) {
  state.titleInput?.addEventListener("input", () => updateCreateButtonState(state));
  state.dueDateInput?.addEventListener("input", () => updateCreateButtonState(state));
  state.dueDateInput?.addEventListener("change", () => updateCreateButtonState(state));
  state.form.addEventListener("input", () => updateCreateButtonState(state));
  state.form.addEventListener("change", () => updateCreateButtonState(state));
}

/**
 * Aktualisiert Create-Button Enabled-Status basierend auf Validierung
 * @param {*} state
 * @returns {*}
 */
function updateCreateButtonState(state) {
  if (!state.createBtn) return;
  const isReady = Boolean(
    state.titleInput?.value.trim() &&
      state.dueDateInput?.value.trim() &&
      getSelectedCategoryValue(state)
  );
  state.createBtn.disabled = !isReady;
  state.createBtn.classList.toggle("is-active", isReady);
}

/**
 * Setzt Create-Button Busy-Status (deaktiviert während Submit)
 * @param {*} state
 * @param {*} busy
 * @returns {*}
 */
function setCreateButtonBusy(state, busy) {
  if (!state.createBtn) return;
  if (busy) return void (state.createBtn.disabled = true);
  updateCreateButtonState(state);
}
