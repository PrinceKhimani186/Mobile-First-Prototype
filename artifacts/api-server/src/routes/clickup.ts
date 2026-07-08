import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const CLICKUP_BASE = "https://api.clickup.com/api/v2";

function noCache(res: Response) {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
}

interface ClickUpTask {
  id: string;
  name: string;
  status: {
    status: string;
  };
}

// ── ClickUp API helpers ──────────────────────────────────────────────────────

async function clickUpFetch(url: string, token: string, options: RequestInit = {}): Promise<any> {
  const headers = {
    Authorization: token.trim(),
    "Content-Type": "application/json",
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`ClickUp API HTTP ${res.status}: ${errText}`);
  }
  return res.json();
}

async function fetchTasks(listId: string, token: string): Promise<ClickUpTask[]> {
  const data = await clickUpFetch(`${CLICKUP_BASE}/list/${listId}/task?archived=false`, token);
  const tasks = data.tasks as ClickUpTask[];
  
  // Seed tasks automatically if any of the stages are missing
  return seedTasksIfMissing(listId, token, tasks || []);
}

async function updateTaskStatus(taskId: string, status: string, token: string): Promise<void> {
  await clickUpFetch(`${CLICKUP_BASE}/task/${taskId}`, token, {
    method: "PUT",
    body: JSON.stringify({ status: status.toLowerCase() }),
  });
}

async function addTaskComment(taskId: string, commentText: string, token: string): Promise<void> {
  await clickUpFetch(`${CLICKUP_BASE}/task/${taskId}/comment`, token, {
    method: "POST",
    body: JSON.stringify({ comment_text: commentText }),
  });
}

// ── Stage order ───────────────────────────────────────────────────────────────
const STAGE_ORDER = [
  "Project Received",
  "Brand Review",
  "Customization Review",
  "Development",
  "Testing",
  "Demo Ready For Review",
  "Revision Window",
  "Final Approval",
  "Publishing Requirements",
  "Store Submission",
  "App Launch",
] as const;

type StageName = typeof STAGE_ORDER[number];

// Fuzzy-match a ClickUp task name to a known stage
function resolveStage(name: string): string {
  const lower = name.toLowerCase().trim();
  const exact = STAGE_ORDER.find(s => s.toLowerCase() === lower);
  if (exact) return exact;
  const partial = STAGE_ORDER.find(s => lower.includes(s.toLowerCase()) || s.toLowerCase().includes(lower));
  if (partial) return partial;
  return name;
}

// Map ClickUp task status to dashboard label
function mapStatus(raw: string): "Complete" | "In Progress" | "Client Review Required" | "Pending" {
  const t = (raw ?? "").trim().toLowerCase();
  if (t === "done" || t === "complete" || t === "completed") return "Complete";
  if (t === "in progress" || t === "working on it" || t === "active") return "In Progress";
  if (t === "review" || t === "ready to review" || t === "under review" || t === "client review required") return "Client Review Required";
  return "Pending";
}

// Auto-seed missing stages as ClickUp tasks in the List
async function seedTasksIfMissing(listId: string, token: string, existingTasks: ClickUpTask[]): Promise<ClickUpTask[]> {
  const updatedTasks = [...existingTasks];
  
  for (const stageName of STAGE_ORDER) {
    const exists = existingTasks.some(t => resolveStage(t.name) === stageName);
    if (!exists) {
      try {
        console.log(`ClickUp Seeding: Creating task for stage "${stageName}"...`);
        const newTask = await clickUpFetch(`${CLICKUP_BASE}/list/${listId}/task`, token, {
          method: "POST",
          body: JSON.stringify({
            name: stageName,
            status: "to do", // default initial status
          }),
        });
        if (newTask && newTask.id) {
          updatedTasks.push(newTask as ClickUpTask);
        }
      } catch (err) {
        console.error(`ClickUp Seeding: Failed to create task for "${stageName}":`, err);
      }
    }
  }
  return updatedTasks;
}

function findStageTask(tasks: ClickUpTask[], stageName: string): ClickUpTask | null {
  return tasks.find(t => resolveStage(t.name) === stageName) ?? null;
}

// ── normalizeStageStatuses ────────────────────────────────────────────────────
// Reads ClickUp task statuses, finds the first non-complete stage, and resets
// all subsequent stages to "to do" (Pending) for consistency.
async function normalizeStageStatuses(listId: string, token: string): Promise<void> {
  const tasks = await fetchTasks(listId, token);

  const snapshot = STAGE_ORDER.map(stageName => {
    const foundTask = findStageTask(tasks, stageName);
    const rawStatus = foundTask?.status.status.trim() ?? "to do";
    return { stageName, rawStatus, foundTask };
  });

  const firstNonDoneIdx = snapshot.findIndex(
    s => mapStatus(s.rawStatus) !== "Complete"
  );

  if (firstNonDoneIdx === -1) {
    return;
  }

  const stagesToReset: { task: ClickUpTask; stageName: string }[] = [];
  for (let i = firstNonDoneIdx + 1; i < snapshot.length; i++) {
    const s = snapshot[i];
    if (mapStatus(s.rawStatus) !== "Pending" && s.foundTask) {
      stagesToReset.push({ task: s.foundTask, stageName: s.stageName });
    }
  }

  for (const { task, stageName } of stagesToReset) {
    await updateTaskStatus(task.id, "to do", token);
    console.log(`ClickUp Normalization: Reset ${stageName} to "to do"`);
  }
}

// ── POST /api/update-stage-status ────────────────────────────────────────────
router.post("/update-stage-status", async (req: Request, res: Response) => {
  const token = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LIST_ID || "5029246685";

  noCache(res);

  if (!token) {
    res.status(503).json({ error: "CLICKUP_API_TOKEN is not configured" });
    return;
  }

  const { stageName, status } = req.body as { stageName?: string; status?: string };
  if (!stageName || !status) {
    res.status(400).json({ error: "stageName and status are required" });
    return;
  }

  const clickUpLabel =
    status === "Complete"    ? "done" :
    status === "In Progress" ? "in progress" :
    "to do";

  const stageIdx = STAGE_ORDER.findIndex(s => resolveStage(stageName) === s || s === stageName);
  if (stageIdx === -1) {
    res.status(400).json({ error: `Unknown stage: "${stageName}"` });
    return;
  }

  const canonicalName = STAGE_ORDER[stageIdx];

  // Block Demo Ready For Review from admin Mark Complete — must use /api/approve-demo
  if (canonicalName === "Demo Ready For Review" && clickUpLabel === "done") {
    res.status(400).json({
      error: "Demo Ready For Review must be approved by the client via POST /api/approve-demo",
    });
    return;
  }

  try {
    const tasks = await fetchTasks(listId, token);
    const foundTask = findStageTask(tasks, canonicalName);
    if (!foundTask) {
      res.status(404).json({ error: `Stage task "${canonicalName}" not found in ClickUp List` });
      return;
    }

    const oldStatus = foundTask.status.status;

    // Sequential validation: if marking Done, previous stage must be complete
    if (clickUpLabel === "done" && stageIdx > 0) {
      const prevName = STAGE_ORDER[stageIdx - 1];
      const prevTask = findStageTask(tasks, prevName);
      const prevStatus = prevTask?.status.status ?? "to do";

      if (mapStatus(prevStatus) !== "Complete") {
        res.status(400).json({
          error: `Previous stage "${prevName}" must be completed first.`,
          previousStage: prevName,
          previousStatus: prevStatus,
        });
        return;
      }
    }

    // Apply the update to the current stage task
    await updateTaskStatus(foundTask.id, clickUpLabel, token);

    let nextStageActivated: string | null = null;

    if (clickUpLabel === "done" && stageIdx < STAGE_ORDER.length - 1) {
      const nextName = STAGE_ORDER[stageIdx + 1];
      const nextClickUpLabel =
        nextName === "Demo Ready For Review" ? "review" : "in progress";

      const nextTask = findStageTask(tasks, nextName);
      if (nextTask) {
        await updateTaskStatus(nextTask.id, nextClickUpLabel, token);
        nextStageActivated = nextName;
      }
    }

    await normalizeStageStatuses(listId, token);

    res.json({
      ok: true,
      stageName: canonicalName,
      oldStatus,
      newStatus: clickUpLabel,
      nextStageActivated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`ClickUp: update-stage-status FAILED for "${stageName}":`, message);
    res.status(502).json({ error: message });
  }
});

// ── POST /api/approve-demo ────────────────────────────────────────────────────
router.post("/approve-demo", async (req: Request, res: Response) => {
  const token = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LIST_ID || "5029246685";

  noCache(res);

  if (!token) {
    res.status(503).json({ error: "CLICKUP_API_TOKEN is not configured" });
    return;
  }

  try {
    const tasks = await fetchTasks(listId, token);
    const demoTask = findStageTask(tasks, "Demo Ready For Review");
    if (!demoTask) {
      res.status(404).json({ error: "Demo Ready For Review stage task not found in ClickUp List" });
      return;
    }

    const oldStatus = demoTask.status.status;

    // Set Demo Ready For Review task to complete
    await updateTaskStatus(demoTask.id, "done", token);

    // Post approval comment
    await addTaskComment(
      demoTask.id,
      "Client approved demo. Ready to move to revision window.",
      token
    );

    // Set Revision Window task to in progress
    let nextStageActivated: string | null = null;
    const revTask = findStageTask(tasks, "Revision Window");
    if (revTask) {
      await updateTaskStatus(revTask.id, "in progress", token);
      nextStageActivated = "Revision Window";
    }

    await normalizeStageStatuses(listId, token);

    res.json({
      ok: true,
      demoApproved: true,
      demoItemId: demoTask.id,
      oldStatus,
      nextStageActivated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("ClickUp: approve-demo FAILED:", message);
    res.status(502).json({ error: message });
  }
});

// ── POST /api/submit-revision ────────────────────────────────────────────────
router.post("/submit-revision", async (req: Request, res: Response) => {
  const token = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LIST_ID || "5029246685";

  noCache(res);

  if (!token) {
    res.status(503).json({ error: "CLICKUP_API_TOKEN is not configured" });
    return;
  }

  const {
    revisionTypes,
    revisionDetails,
    specificScreens,
    priorityLevel,
    clientName,
    submittedAt,
  } = req.body as {
    revisionTypes?: string[];
    revisionDetails?: string;
    specificScreens?: string;
    priorityLevel?: string;
    clientName?: string;
    submittedAt?: string;
  };

  if (!revisionDetails?.trim()) {
    res.status(400).json({ error: "revisionDetails is required" });
    return;
  }

  try {
    const tasks = await fetchTasks(listId, token);
    const demoTask = findStageTask(tasks, "Demo Ready For Review");
    if (!demoTask) {
      res.status(404).json({ error: "Demo Ready For Review stage task not found in ClickUp List" });
      return;
    }

    const typesBlock =
      Array.isArray(revisionTypes) && revisionTypes.length > 0
        ? revisionTypes.map(t => `• ${t}`).join("\n")
        : "(not specified)";

    const submittedDate = submittedAt
      ? new Date(submittedAt).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" }) + " UTC"
      : new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" }) + " UTC";

    const comment = [
      "---------------------------------------",
      "Client Revision Request",
      "",
      "Revision Types:",
      typesBlock,
      "",
      "Revision Details:",
      (revisionDetails ?? "").trim(),
      "",
      "Specific Screens / Areas:",
      (specificScreens ?? "(not specified)").trim(),
      "",
      `Priority: ${priorityLevel ?? "Normal"}`,
      `Submitted by${clientName ? " " + clientName : " client"} on: ${submittedDate}`,
      "---------------------------------------",
    ].join("\n");

    await addTaskComment(demoTask.id, comment, token);

    res.json({ ok: true, itemId: demoTask.id, commentPosted: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("ClickUp: submit-revision FAILED:", message);
    res.status(502).json({ error: message });
  }
});

// ── POST /api/approve-final ──────────────────────────────────────────────────
router.post("/approve-final", async (req: Request, res: Response) => {
  const token = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LIST_ID || "5029246685";

  noCache(res);

  if (!token) {
    res.status(503).json({ error: "CLICKUP_API_TOKEN is not configured" });
    return;
  }

  try {
    const tasks = await fetchTasks(listId, token);
    const finalTask = findStageTask(tasks, "Final Approval");
    if (!finalTask) {
      res.status(404).json({ error: "Final Approval stage task not found in ClickUp List" });
      return;
    }

    const oldStatus = finalTask.status.status;

    // Set Final Approval task to complete
    await updateTaskStatus(finalTask.id, "done", token);

    // Post approval comment
    await addTaskComment(
      finalTask.id,
      "Client approved final version. Ready for publishing preparation.",
      token
    );

    // Set Publishing Requirements task to in progress
    let nextStageActivated: string | null = null;
    const pubTask = findStageTask(tasks, "Publishing Requirements");
    if (pubTask) {
      await updateTaskStatus(pubTask.id, "in progress", token);
      nextStageActivated = "Publishing Requirements";
    }

    await normalizeStageStatuses(listId, token);

    res.json({
      ok: true,
      finalApproved: true,
      finalItemId: finalTask.id,
      oldStatus,
      nextStageActivated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("ClickUp: approve-final FAILED:", message);
    res.status(502).json({ error: message });
  }
});

// ── GET /api/project-progress ────────────────────────────────────────────────
router.get("/project-progress", async (req: Request, res: Response) => {
  const token = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LIST_ID || "5029246685";

  noCache(res);

  if (!token) {
    res.status(503).json({ error: "CLICKUP_API_TOKEN is not configured" });
    return;
  }

  try {
    await normalizeStageStatuses(listId, token);
    const tasks = await fetchTasks(listId, token);

    const stages = STAGE_ORDER.map(stageName => {
      const foundTask = findStageTask(tasks, stageName);
      const rawStatus = foundTask?.status.status ?? "to do";
      const status = mapStatus(rawStatus);
      return { name: stageName, status, rawStatus };
    });

    const completedStages = stages.filter(s => s.status === "Complete").length;
    const totalStages     = stages.length;
    const percentage      = Math.round((completedStages / totalStages) * 100);

    res.json({
      completedStages,
      totalStages,
      percentage,
      stages: stages.map(({ name, status }) => ({ name, status })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("ClickUp: project-progress fetch FAILED:", message);
    res.status(502).json({ error: "ClickUp API unavailable", detail: message });
  }
});

// ── GET /api/debug-clickup ────────────────────────────────────────────────────
router.get("/debug-clickup", async (req: Request, res: Response) => {
  const token = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LIST_ID || "5029246685";

  noCache(res);

  if (!token) {
    res.status(503).json({ error: "CLICKUP_API_TOKEN is not configured" });
    return;
  }

  try {
    const tasks = await fetchTasks(listId, token);
    res.json({
      success: true,
      service: "ClickUp",
      listId,
      tasksCount: tasks.length,
      tasks: tasks.map(t => ({
        id: t.id,
        name: t.name,
        resolvedStage: resolveStage(t.name),
        status: t.status.status,
        mappedStatus: mapStatus(t.status.status),
      })),
    });
  } catch (err) {
    res.status(502).json({ error: (err as Error).message });
  }
});

// ── GET /api/clickup/project ─────────────────────────────────────────────────
// Returns the list metadata.
router.get("/clickup/project", async (req: Request, res: Response) => {
  const token = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LIST_ID || "5029246685";

  noCache(res);

  if (!token) {
    res.status(503).json({ error: "CLICKUP_API_TOKEN is not configured" });
    return;
  }

  try {
    const listInfo = await clickUpFetch(`${CLICKUP_BASE}/list/${listId}`, token);
    res.json({
      boardName: listInfo.name || "ClickUp Project List",
    });
  } catch (err) {
    res.status(502).json({ error: (err as Error).message });
  }
});

export default router;
