import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const MONDAY_API = "https://api.monday.com/v2";

// Never let browsers or proxies cache Monday data
function noCache(res: Response) {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
}

// ── Monday GraphQL fetch ─────────────────────────────────────────────────────
async function mondayQuery(query: string, token: string): Promise<unknown> {
  const res = await fetch(MONDAY_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      "API-Version": "2024-01",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`Monday API HTTP ${res.status}`);
  const json = (await res.json()) as { data?: unknown; errors?: unknown[] };
  if (json.errors?.length) throw new Error(`Monday API error: ${JSON.stringify(json.errors)}`);
  return json.data;
}

// ── Column value helpers ─────────────────────────────────────────────────────
interface ColumnValue {
  id: string;
  text: string | null;
  value: string | null;
  column: { title: string };
}

function colText(columns: ColumnValue[], ...titles: string[]): string {
  for (const title of titles) {
    const found = columns.find(c =>
      c.column.title.toLowerCase().includes(title.toLowerCase())
    );
    if (found?.text) return found.text.trim();
  }
  return "";
}

function colNumber(columns: ColumnValue[], ...titles: string[]): number | null {
  for (const title of titles) {
    const found = columns.find(c =>
      c.column.title.toLowerCase().includes(title.toLowerCase())
    );
    if (found?.text) {
      const n = parseFloat(found.text);
      if (!isNaN(n)) return n;
    }
  }
  return null;
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

const STAGE_PCT: Record<string, number> = {
  "Project Received": 10,
  "Brand Review": 20,
  "Customization Review": 30,
  "Development": 50,
  "Testing": 65,
  "Demo Ready For Review": 75,
  "Revision Window": 85,
  "Final Approval": 90,
  "Publishing Requirements": 95,
  "Store Submission": 98,
  "App Launch": 100,
};

// Fuzzy-match a Monday item name to a known stage
function resolveStage(name: string): string {
  const lower = name.toLowerCase().trim();
  const exact = STAGE_ORDER.find(s => s.toLowerCase() === lower);
  if (exact) return exact;
  const partial = STAGE_ORDER.find(s => lower.includes(s.toLowerCase()) || s.toLowerCase().includes(lower));
  if (partial) return partial;
  return name;
}

// ── Status text → dashboard label ───────────────────────────────────────────
function mapStatus(raw: string): "Complete" | "In Progress" | "Client Review Required" | "Pending" {
  const t = (raw ?? "").trim().toLowerCase();
  if (t === "done") return "Complete";
  if (t === "working on it") return "In Progress";
  if (t === "ready to review") return "Client Review Required";
  return "Pending";
}

// ── Shared board item fetch ──────────────────────────────────────────────────
type BoardItem = { id: string; name: string; column_values: ColumnValue[] };

async function fetchBoardItems(boardId: string, token: string): Promise<{ board: { name: string } | undefined; items: BoardItem[] }> {
  const query = `
    {
      boards(ids: [${boardId}]) {
        name
        items_page(limit: 500) {
          items {
            id
            name
            column_values {
              id text value
              column { title }
            }
          }
        }
      }
    }
  `;
  const data = (await mondayQuery(query, token)) as {
    boards: {
      name: string;
      items_page: { items: BoardItem[] };
    }[];
  };
  const board = data.boards?.[0];
  return { board, items: board?.items_page?.items ?? [] };
}

// ── Monday item comment (create_update) ─────────────────────────────────────
async function createUpdate(itemId: string, body: string, token: string): Promise<void> {
  // Escape the body for embedding in a GraphQL string literal
  const escaped = body
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, "\\n");
  const mutation = `
    mutation {
      create_update(
        item_id: ${itemId},
        body: "${escaped}"
      ) { id }
    }
  `;
  await mondayQuery(mutation, token);
}

// ── Single column mutation ───────────────────────────────────────────────────
async function updateItemColumn(
  boardId: string,
  itemId: string,
  columnId: string,
  label: string,
  token: string
): Promise<void> {
  const mutation = `
    mutation {
      change_column_value(
        board_id: ${boardId},
        item_id: ${itemId},
        column_id: "${columnId}",
        value: "{\\"label\\": \\"${label}\\"}"
      ) { id }
    }
  `;
  await mondayQuery(mutation, token);
}

// ── Find a stage item + its status column ────────────────────────────────────
function findStageItem(
  items: BoardItem[],
  stageName: string
): { item: BoardItem; statusCol: ColumnValue } | null {
  const item = items.find(i => {
    const lower = i.name.toLowerCase().trim();
    const stage = stageName.toLowerCase().trim();
    return lower === stage || lower.includes(stage) || stage.includes(lower);
  });
  if (!item) return null;
  const statusCol = item.column_values.find(c =>
    c.column.title.toLowerCase().includes("status")
  );
  if (!statusCol) return null;
  return { item, statusCol };
}

// ── normalizeStageStatuses ────────────────────────────────────────────────────
// Reads fresh item statuses, finds the first non-Done stage, and resets all
// later stages to Not Started so the board can never be in an inconsistent state.
async function normalizeStageStatuses(boardId: string, token: string): Promise<void> {
  const { items } = await fetchBoardItems(boardId, token);

  // Build an ordered status snapshot
  const snapshot = STAGE_ORDER.map(stageName => {
    const found = findStageItem(items, stageName);
    const rawStatus = found?.statusCol.text?.trim() ?? "Not Started";
    return { stageName, rawStatus, found };
  });

  console.log(
    "Current statuses before normalization:",
    snapshot.map(s => `${s.stageName}: ${s.rawStatus}`).join(" | ")
  );

  // Find the first stage that is NOT Done
  const firstNonDoneIdx = snapshot.findIndex(
    s => s.rawStatus.toLowerCase() !== "done"
  );

  if (firstNonDoneIdx === -1) {
    console.log("All stages are Done — no normalization needed.");
    return;
  }

  const firstNonDone = snapshot[firstNonDoneIdx];
  console.log(`First non-complete stage: ${firstNonDone.stageName} (${firstNonDone.rawStatus})`);

  // Collect stages after the first non-Done that need resetting
  const stagesToReset: string[] = [];
  for (let i = firstNonDoneIdx + 1; i < snapshot.length; i++) {
    const s = snapshot[i];
    const lower = s.rawStatus.toLowerCase();
    if (lower !== "not started" && lower !== "") {
      stagesToReset.push(s.stageName);
    }
  }

  if (stagesToReset.length === 0) {
    console.log("Board is already normalized — no resets needed.");
    return;
  }

  console.log("Statuses reset:", stagesToReset.join(", "));

  for (const stageName of stagesToReset) {
    const found = findStageItem(items, stageName);
    if (found) {
      await updateItemColumn(boardId, found.item.id, found.statusCol.id, "Not Started", token);
      console.log(`  → Reset ${stageName} to Not Started`);
    }
  }

  console.log("Monday update response: normalization complete.");
}

// ── POST /api/update-stage-status ────────────────────────────────────────────
router.post("/update-stage-status", async (req: Request, res: Response) => {
  const token   = process.env.MONDAY_API_TOKEN;
  const boardId = process.env.MONDAY_BOARD_ID || "5029246685";

  noCache(res);

  if (!token) {
    res.status(503).json({ error: "MONDAY_API_TOKEN not configured" });
    return;
  }

  const { stageName, status } = req.body as { stageName?: string; status?: string };
  if (!stageName || !status) {
    res.status(400).json({ error: "stageName and status are required" });
    return;
  }

  // Map dashboard status → Monday label
  const mondayLabel =
    status === "Complete"    ? "Done" :
    status === "In Progress" ? "Working on it" :
    "Not Started";

  // Resolve to known stage index
  const stageIdx = STAGE_ORDER.findIndex(s => resolveStage(stageName) === s || s === stageName);
  if (stageIdx === -1) {
    res.status(400).json({ error: `Unknown stage: "${stageName}"` });
    return;
  }

  const canonicalName = STAGE_ORDER[stageIdx];

  // Block Demo Ready For Review from admin Mark Complete — must use /api/approve-demo
  if (canonicalName === "Demo Ready For Review" && mondayLabel === "Done") {
    res.status(400).json({
      error: "Demo Ready For Review must be approved by the client via POST /api/approve-demo",
    });
    return;
  }

  console.log(`Stage clicked: ${canonicalName}`);
  console.log(`Requested update: ${status} → "${mondayLabel}"`);

  try {
    const { items } = await fetchBoardItems(boardId, token);

    const found = findStageItem(items, canonicalName);
    if (!found) {
      res.status(404).json({ error: `Stage "${canonicalName}" not found in Monday board` });
      return;
    }
    const { item, statusCol } = found;
    const oldStatus = statusCol.text ?? "Not Started";

    console.log(`Monday item ID: ${item.id}`);
    console.log(`Previous stage status: ${oldStatus}`);

    // Sequential validation: if marking Done, previous stage must be Done
    if (mondayLabel === "Done" && stageIdx > 0) {
      const prevName = STAGE_ORDER[stageIdx - 1] as StageName;
      const prevFound = findStageItem(items, prevName);
      const prevStatus = prevFound?.statusCol.text ?? "Not Started";

      console.log(`Previous stage (${prevName}): ${prevStatus}`);

      if (prevStatus.toLowerCase() !== "done") {
        res.status(400).json({
          error: `Previous stage "${prevName}" must be completed first.`,
          previousStage: prevName,
          previousStatus: prevStatus,
        });
        return;
      }
    }

    // Apply the update to the current stage
    await updateItemColumn(boardId, item.id, statusCol.id, mondayLabel, token);

    let nextStageActivated: string | null = null;

    if (mondayLabel === "Done" && stageIdx < STAGE_ORDER.length - 1) {
      const nextName = STAGE_ORDER[stageIdx + 1] as StageName;

      // Special rule: Testing Done → Demo Ready For Review becomes "Ready to Review"
      const nextMondayLabel =
        nextName === "Demo Ready For Review" ? "Ready to Review" : "Working on it";

      const nextFound = findStageItem(items, nextName);
      if (nextFound) {
        await updateItemColumn(boardId, nextFound.item.id, nextFound.statusCol.id, nextMondayLabel, token);
        nextStageActivated = nextName;
        console.log(`Next stage activated: ${nextName} → ${nextMondayLabel}`);
      }
    }

    // Normalize the board to fix any inconsistencies
    await normalizeStageStatuses(boardId, token);

    const result = { ok: true, stageName: canonicalName, oldStatus, newStatus: mondayLabel, nextStageActivated };
    console.log(`Monday update response: ${JSON.stringify(result)}`);

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`update-stage-status FAILED for "${stageName}":`, message);
    req.log.error({ err }, "update-stage-status failed");
    res.status(502).json({ error: message });
  }
});

// ── POST /api/approve-demo ────────────────────────────────────────────────────
router.post("/approve-demo", async (req: Request, res: Response) => {
  const token   = process.env.MONDAY_API_TOKEN;
  const boardId = process.env.MONDAY_BOARD_ID || "5029246685";

  noCache(res);

  if (!token) {
    res.status(503).json({ error: "MONDAY_API_TOKEN not configured" });
    return;
  }

  console.log("Current stage: Demo Ready For Review");

  try {
    const { items } = await fetchBoardItems(boardId, token);

    const demoFound = findStageItem(items, "Demo Ready For Review");
    if (!demoFound) {
      res.status(404).json({ error: "Demo Ready For Review stage not found in Monday board" });
      return;
    }

    const { item: demoItem, statusCol: demoStatusCol } = demoFound;
    const currentDemoStatus = demoStatusCol.text ?? "Not Started";

    console.log(`Previous stage status: ${currentDemoStatus}`);
    console.log(`Monday item ID: ${demoItem.id}`);
    console.log(`Requested update: Demo Ready For Review → Done`);

    // Set Demo Ready For Review → Done
    await updateItemColumn(boardId, demoItem.id, demoStatusCol.id, "Done", token);
    console.log("Client approved demo");

    // Post approval comment on the Monday item
    await createUpdate(
      demoItem.id,
      "Client approved demo. Ready to move to revision window.",
      token
    );
    console.log(`Comment posted to Monday item ${demoItem.id} (Demo Ready For Review)`);

    // Set Revision Window → Working on it
    let nextStageActivated: string | null = null;
    const revFound = findStageItem(items, "Revision Window");
    if (revFound) {
      await updateItemColumn(boardId, revFound.item.id, revFound.statusCol.id, "Working on it", token);
      nextStageActivated = "Revision Window";
      console.log(`Revision Window activated`);
    }

    // Normalize the board to fix any inconsistencies
    await normalizeStageStatuses(boardId, token);

    const result = {
      ok: true,
      demoApproved: true,
      demoItemId: demoItem.id,
      oldStatus: currentDemoStatus,
      nextStageActivated,
    };
    console.log(`Monday update response: ${JSON.stringify(result)}`);

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("approve-demo FAILED:", message);
    req.log.error({ err }, "approve-demo failed");
    res.status(502).json({ error: message });
  }
});

// ── POST /api/submit-revision ────────────────────────────────────────────────
// Posts a client revision request as a comment on the Demo Ready For Review
// Monday item. Does NOT change the stage status — Demo stays "Ready to Review".
router.post("/submit-revision", async (req: Request, res: Response) => {
  const token   = process.env.MONDAY_API_TOKEN;
  const boardId = process.env.MONDAY_BOARD_ID || "5029246685";

  noCache(res);

  if (!token) {
    res.status(503).json({ error: "MONDAY_API_TOKEN not configured" });
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

  console.log("Revision request submitted");

  try {
    const { items } = await fetchBoardItems(boardId, token);

    const demoFound = findStageItem(items, "Demo Ready For Review");
    if (!demoFound) {
      res.status(404).json({ error: "Demo Ready For Review stage not found in Monday board" });
      return;
    }

    const demoItem = demoFound.item;
    const currentStatus = demoFound.statusCol.text ?? "Not Started";
    console.log(`Current stage status: Demo Ready For Review = ${currentStatus}`);

    // Build the formatted comment
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

    await createUpdate(demoItem.id, comment, token);
    console.log(`Comment posted to Monday item ${demoItem.id} (Demo Ready For Review)`);
    console.log("Stage status unchanged: Demo Ready For Review = Ready to Review");

    res.json({ ok: true, itemId: demoItem.id, commentPosted: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("submit-revision FAILED:", message);
    req.log.error({ err }, "submit-revision failed");
    res.status(502).json({ error: message });
  }
});

// ── POST /api/approve-final ──────────────────────────────────────────────────
// Client clicks "Approve For Publishing" → Final Approval = Done + comment +
// Publishing Requirements = Working on it + board normalization.
router.post("/approve-final", async (req: Request, res: Response) => {
  const token   = process.env.MONDAY_API_TOKEN;
  const boardId = process.env.MONDAY_BOARD_ID || "5029246685";

  noCache(res);

  if (!token) {
    res.status(503).json({ error: "MONDAY_API_TOKEN not configured" });
    return;
  }

  console.log("Approve For Publishing clicked");
  console.log("Updating Monday Final Approval");

  try {
    const { items } = await fetchBoardItems(boardId, token);

    // Validate Final Approval exists
    const finalFound = findStageItem(items, "Final Approval");
    if (!finalFound) {
      res.status(404).json({ error: "Final Approval stage not found in Monday board" });
      return;
    }

    const { item: finalItem, statusCol: finalStatusCol } = finalFound;
    const oldStatus = finalStatusCol.text ?? "Not Started";
    console.log(`Current stage status: Final Approval = ${oldStatus}`);

    // Set Final Approval → Done
    await updateItemColumn(boardId, finalItem.id, finalStatusCol.id, "Done", token);

    // Post approval comment
    await createUpdate(
      finalItem.id,
      "Client approved final version. Ready for publishing preparation.",
      token
    );

    console.log("Monday update success");

    // Set Publishing Requirements → Working on it
    let nextStageActivated: string | null = null;
    const pubFound = findStageItem(items, "Publishing Requirements");
    if (pubFound) {
      await updateItemColumn(boardId, pubFound.item.id, pubFound.statusCol.id, "Working on it", token);
      nextStageActivated = "Publishing Requirements";
      console.log("Publishing Requirements activated");
    }

    // Normalize to ensure board consistency
    await normalizeStageStatuses(boardId, token);

    res.json({
      ok: true,
      finalApproved: true,
      finalItemId: finalItem.id,
      oldStatus,
      nextStageActivated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("approve-final FAILED:", message);
    req.log.error({ err }, "approve-final failed");
    res.status(502).json({ error: "Unable to update Monday.com." });
  }
});

// ── GET /api/project-progress ────────────────────────────────────────────────
router.get("/project-progress", async (req: Request, res: Response) => {
  const token   = process.env.MONDAY_API_TOKEN;
  const boardId = process.env.MONDAY_BOARD_ID || "5029246685";

  noCache(res);

  if (!token) {
    res.status(503).json({ error: "MONDAY_API_TOKEN not configured" });
    return;
  }

  try {
    console.log(`MONDAY BOARD ID: ${boardId}`);
    console.log("FETCHING MONDAY DATA...");

    // Normalize first to fix any inconsistencies from manual Monday edits
    await normalizeStageStatuses(boardId, token);

    // Re-fetch after normalization so the response reflects the corrected state
    const { items } = await fetchBoardItems(boardId, token);

    console.log(`ITEMS FOUND: ${items.length}`);

    const stages = STAGE_ORDER.map(stageName => {
      const found = findStageItem(items, stageName);
      const rawStatus = found?.statusCol.text ?? "Not Started";
      const status = mapStatus(rawStatus);
      return { name: stageName, status, rawStatus };
    });

    const statusValues = stages.map(s => `${s.name}: ${s.rawStatus} → ${s.status}`);
    console.log("STATUS VALUES:", statusValues);

    const completedStages = stages.filter(s => s.status === "Complete").length;
    const totalStages     = stages.length;
    const percentage      = Math.round((completedStages / totalStages) * 100);

    console.log(`COMPLETED STAGES: ${completedStages}/${totalStages}`);
    console.log(`PROGRESS PERCENTAGE: ${percentage}%`);

    res.json({
      completedStages,
      totalStages,
      percentage,
      stages: stages.map(({ name, status }) => ({ name, status })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("project-progress fetch FAILED:", message);
    req.log.error({ err }, "project-progress fetch failed");
    res.status(502).json({ error: "Monday API unavailable", detail: message });
  }
});

// ── GET /api/debug-monday ────────────────────────────────────────────────────
router.get("/debug-monday", async (req: Request, res: Response) => {
  const token   = process.env.MONDAY_API_TOKEN;
  const boardId = process.env.MONDAY_BOARD_ID || "5029246685";

  noCache(res);

  if (!token) {
    res.status(503).json({ error: "MONDAY_API_TOKEN not set", boardId, tokenSet: false });
    return;
  }

  try {
    const { board, items } = await fetchBoardItems(boardId, token);

    const itemSummary = items.map(i => ({
      id: i.id,
      name: i.name,
      statusText: i.column_values.find(c => c.column.title.toLowerCase().includes("status"))?.text ?? "(no status column)",
      allColumnTitles: i.column_values.map(c => c.column.title),
    }));

    res.json({
      boardId,
      boardName: board?.name ?? "(board not found)",
      tokenSet: true,
      tokenPrefix: token.slice(0, 12) + "…",
      itemCount: items.length,
      items: itemSummary,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("debug-monday FAILED:", message);
    res.status(502).json({ error: message, boardId, tokenSet: true });
  }
});

// ── GET /api/monday/project?email=xxx ────────────────────────────────────────
router.get("/monday/project", async (req: Request, res: Response) => {
  const token   = process.env.MONDAY_API_TOKEN;
  const boardId = process.env.MONDAY_BOARD_ID || "5029246685";

  noCache(res);

  if (!token) {
    res.status(503).json({ error: "MONDAY_API_TOKEN not configured", fallback: true });
    return;
  }

  const email = ((req.query.email as string) ?? "").trim().toLowerCase();

  try {
    const { board, items } = await fetchBoardItems(boardId, token);

    if (!board) {
      res.status(404).json({ error: "Board not found", fallback: true });
      return;
    }

    // 1. Try to find a specific client item by email
    const clientItem = email
      ? items.find(item => {
          const emailCol = item.column_values.find(c =>
            c.column.title.toLowerCase().includes("email")
          );
          return emailCol?.text?.toLowerCase().includes(email);
        })
      : null;

    // 2. Find the first item with status "Working on it" or "Ready to Review" (active stage)
    const activeItem = items.find(item => {
      const statusCol = item.column_values.find(c =>
        c.column.title.toLowerCase().includes("status")
      );
      const st = statusCol?.text?.toLowerCase() ?? "";
      return st === "working on it" || st === "ready to review";
    });

    // 3. If nothing is active, find the LAST "Done" item and treat next stage as active.
    let currentStage: string;
    if (activeItem) {
      currentStage = resolveStage(activeItem.name);
    } else {
      let lastDoneIdx = -1;
      items.forEach(item => {
        const statusCol = item.column_values.find(c =>
          c.column.title.toLowerCase().includes("status")
        );
        if (statusCol?.text?.toLowerCase() === "done") {
          const idx = STAGE_ORDER.findIndex(s => resolveStage(item.name) === s);
          if (idx > lastDoneIdx) lastDoneIdx = idx;
        }
      });

      if (lastDoneIdx >= 0 && lastDoneIdx < STAGE_ORDER.length - 1) {
        currentStage = STAGE_ORDER[lastDoneIdx + 1];
      } else if (lastDoneIdx === STAGE_ORDER.length - 1) {
        currentStage = STAGE_ORDER[STAGE_ORDER.length - 1];
      } else {
        currentStage = STAGE_ORDER[0];
      }
    }

    // 4. Client metadata
    const metaItem = clientItem ?? items[0];
    const cols = metaItem?.column_values ?? [];
    const clientName   = colText(cols, "client name", "client", "name");
    const appName      = colText(cols, "app name", "app");
    const gameType     = colText(cols, "game type", "game");
    const tagline      = colText(cols, "tagline", "slogan");
    const monetization = colText(cols, "monetization", "revenue", "monetize");

    // 5. Progress pct
    const activeCols  = (activeItem ?? metaItem)?.column_values ?? [];
    const progressCol = colNumber(activeCols, "progress", "%", "percent")
      ?? colNumber(cols, "progress", "%", "percent");
    const progressPct = progressCol !== null
      ? progressCol
      : (STAGE_PCT[currentStage] ?? 10);

    // 6. Completed count = Done items
    const completedCount = items.filter(item => {
      const statusCol = item.column_values.find(c =>
        c.column.title.toLowerCase().includes("status")
      );
      return statusCol?.text?.toLowerCase() === "done";
    }).length;

    res.json({
      ok: true,
      boardName: board.name,
      currentStage,
      progressPct,
      completedCount,
      totalStages: STAGE_ORDER.length,
      clientName,
      appName,
      gameType,
      tagline,
      monetization,
      _items: items.map(i => ({
        id: i.id,
        name: i.name,
        status: i.column_values.find(c =>
          c.column.title.toLowerCase().includes("status")
        )?.text ?? "",
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("monday/project fetch FAILED:", message);
    req.log.error({ err }, "Monday.com API fetch failed");
    res.status(502).json({ error: "Monday API unavailable", fallback: true });
  }
});

export default router;
