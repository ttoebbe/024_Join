function initAddTaskForm({ onClose }) {
  const form = document.getElementById("addTaskForm");
  if (!form) return;

  // Priority default: Medium (ist-active ist im Template gesetzt)
  let selectedPrio = "medium";
  let selectedCategory = "";
  let selectedAssigned = [];
  const createBtn = document.getElementById("createBtn");
  const titleInput = document.getElementById("taskTitle");
  const dueDateInput = document.getElementById("taskDueDate");
  const categoryInput = document.getElementById("taskCategoryValue");
  form.querySelectorAll(".prio-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      form.querySelectorAll(".prio-btn").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      selectedPrio = btn.dataset.prio;
    });
  });

  const resetCategoryUi = initCategoryDropdown();
  const resetAssignedUi = initAssignedDropdown();
  wireCreateButtonState();
  updateCreateButtonState();

  // Clear
  document.getElementById("clearBtn")?.addEventListener("click", () => {
    form.reset();
    // status preset nach reset wieder setzen
    const statusField = document.getElementById("taskStatusPreset");
    if (statusField) statusField.value = statusField.value || "todo";
    selectedCategory = "";
    selectedAssigned = [];
    if (categoryInput) categoryInput.value = "";
    resetCategoryUi?.();
    resetAssignedUi?.();
    updateCreateButtonState();
  });

  // Submit (eigene Validation, kein HTML5)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("taskTitle")?.value.trim();
    const dueDate = document.getElementById("taskDueDate")?.value.trim();
    const category = getSelectedCategoryValue();
    const status = document.getElementById("taskStatusPreset")?.value || "todo";
    const description = document.getElementById("taskDescription")?.value.trim() || "";

    if (!title || !dueDate || !category) {
      alert("Bitte Title, Due date und Category ausfüllen.");
      return;
    }

    const newTask = {
      id: "t" + Date.now(),
      title,
      description,
      status,
      category,
      prio: selectedPrio,
      assigned: selectedAssigned,
      subtasks: [],
      dueDate
    };

    // Speichern (Array-Variante wie bei dir)
    const existing = await getData("tasks");
    const arr = existing ? Object.values(existing) : [];
    arr.push(newTask);
    await uploadData("tasks", arr);

    if (typeof loadTasks === "function") {
      await loadTasks();
      if (typeof renderBoard === "function") renderBoard();
    }

    onClose?.();
  });

  function initCategoryDropdown() {
    const dropdown = document.getElementById("categoryDropdown");
    if (!dropdown) return null;

    const toggle = dropdown.querySelector("[data-category-toggle]");
    const menu = dropdown.querySelector("[data-category-menu]");
    const valueEl = dropdown.querySelector("[data-category-value]");
    const items = dropdown.querySelectorAll("[data-category-item]");

    const setOpen = (open) => {
      if (!menu || !toggle) return;
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      dropdown.classList.toggle("is-open", open);
    };

    toggle?.addEventListener("click", () => {
      setOpen(menu?.hidden);
    });

    items.forEach((item) => {
      item.addEventListener("click", () => {
        selectedCategory = item.dataset.value || "";
        if (categoryInput) categoryInput.value = selectedCategory;
        if (valueEl) {
          valueEl.textContent = item.dataset.label || item.textContent || "";
        }
        dropdown.classList.toggle("has-value", Boolean(selectedCategory));
        setOpen(false);
        updateCreateButtonState();
      });
    });

    return () => {
      if (valueEl) valueEl.textContent = "Select task category";
      dropdown.classList.remove("has-value", "is-open");
      if (menu) menu.hidden = true;
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    };
  }

  function getSelectedCategoryValue() {
    if (categoryInput?.value) return categoryInput.value;
    return selectedCategory;
  }

  function initAssignedDropdown() {
    const dropdown = document.getElementById("assignedDropdown");
    if (!dropdown) return null;

    const toggle = dropdown.querySelector("[data-assigned-toggle]");
    const menu = dropdown.querySelector("[data-assigned-menu]");
    const valueEl = dropdown.querySelector("[data-assigned-value]");

    const setOpen = (open) => {
      if (!menu || !toggle) return;
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      dropdown.classList.toggle("is-open", open);
    };

    toggle?.addEventListener("click", () => {
      setOpen(menu?.hidden);
    });

    const closeOnOutside = (e) => {
      if (!dropdown.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", closeOnOutside);

    loadAssignedContacts(menu, valueEl, dropdown);

    return () => {
      if (valueEl) valueEl.textContent = "Select contacts to assign";
      dropdown.classList.remove("has-value", "is-open");
      if (menu) menu.hidden = true;
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    };
  }

  async function loadAssignedContacts(menu, valueEl, dropdown) {
    if (!menu) return;
    menu.innerHTML = "";

    const contacts = await loadContacts();
    contacts.forEach((contact) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "dropdown-item dropdown-item--assigned";
      item.dataset.contactId = contact.id || "";

      const label = document.createElement("span");
      label.textContent = contact.name || "";

      const check = document.createElement("span");
      check.className = "assigned-check";

      item.appendChild(label);
      item.appendChild(check);

      item.addEventListener("click", () => {
        toggleAssignedContact(contact, item, check, valueEl, dropdown);
      });

      menu.appendChild(item);
    });
  }

  function toggleAssignedContact(contact, item, check, valueEl, dropdown) {
    const exists = selectedAssigned.find((a) => a.id === contact.id);

    if (exists) {
      selectedAssigned = selectedAssigned.filter((a) => a.id !== contact.id);
      item.classList.remove("is-selected");
      check.textContent = "";
    } else {
      selectedAssigned.push({
        id: contact.id,
        name: contact.name || "",
        color: contact.color || null
      });
      item.classList.add("is-selected");
      check.textContent = "x";
    }

    updateAssignedLabel(valueEl, dropdown);
  }

  function updateAssignedLabel(valueEl, dropdown) {
    if (!valueEl) return;
    if (selectedAssigned.length === 0) {
      valueEl.textContent = "Select contacts to assign";
      dropdown?.classList.remove("has-value");
      return;
    }

    const names = selectedAssigned.map((a) => a.name).filter(Boolean);
    const shown = names.slice(0, 2).join(", ");
    const more = names.length > 2 ? ` +${names.length - 2}` : "";
    valueEl.textContent = `${shown}${more}`;
    dropdown?.classList.add("has-value");
  }

  async function loadContacts() {
    try {
      const data = await getData("contacts");
      const arr = normalizeToArray(data);
      if (arr.length > 0) return arr;
    } catch (err) {
      console.warn("[addTask] loadContacts failed:", err);
    }

    if (Array.isArray(window.contacts)) return window.contacts;
    return [];
  }

  function normalizeToArray(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data.filter(Boolean);
    if (typeof data === "object") return Object.values(data).filter(Boolean);
    return [];
  }

  function wireCreateButtonState() {
    titleInput?.addEventListener("input", updateCreateButtonState);
    dueDateInput?.addEventListener("input", updateCreateButtonState);
    dueDateInput?.addEventListener("change", updateCreateButtonState);
    form.addEventListener("input", updateCreateButtonState);
    form.addEventListener("change", updateCreateButtonState);
  }

  function updateCreateButtonState() {
    if (!createBtn) return;
    const isReady = Boolean(
      titleInput?.value.trim() &&
      dueDateInput?.value.trim() &&
      getSelectedCategoryValue()
    );
    createBtn.disabled = !isReady;
    createBtn.classList.toggle("is-active", isReady);
  }
}
