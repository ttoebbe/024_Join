/**
 * Dummy data Tasks
 * id description: t0 --> t = task, 0 = ID
 */
const tasks = [
  {
    id: "t0",
    title: "User Onboarding planen",
    description: "Texte und Screens für das Join Onboarding erstellen.",
    category: "Design",
    priority: "high",
    dueDate: "2026-01-10",
    status: "todo",
    assignedContactIds: ["c0", "c1"],
    createdBy: "u0",
    createdAt: "2026-01-02T08:00:00.000Z",
  },
  {
    id: "t1",
    title: "Drag & Drop für Board",
    description:
      "Drag & Drop Funktionalität für Kanban-Spalten implementieren.",
    category: "Technical Task",
    priority: "medium",
    dueDate: "2026-01-12",
    status: "in-progress",
    assignedContactIds: ["c1"],
    createdBy: "u0",
    createdAt: "2026-01-02T08:10:00.000Z",
  },
  {
    id: "t2",
    title: "Contacts CRUD fertigstellen",
    description: "Kontakte anlegen, bearbeiten und löschen inkl. Validierung.",
    category: "Technical Task",
    priority: "low",
    dueDate: "2026-01-15",
    status: "await-feedback",
    assignedContactIds: ["c2"],
    createdBy: "u1",
    createdAt: "2026-01-02T08:20:00.000Z",
  },
  {
    id: "t3",
    title: "Summary KPIs anzeigen",
    description:
      "Anzahl Tasks pro Status und nächste Deadlines auf Summary-Seite.",
    category: "Task",
    priority: "high",
    dueDate: "2026-01-18",
    status: "done",
    assignedContactIds: ["c0"],
    createdBy: "u1",
    createdAt: "2026-01-01T12:00:00.000Z",
  },
];
