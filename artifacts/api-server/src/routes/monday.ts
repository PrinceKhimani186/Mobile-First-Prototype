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
async function fetchBoardItems(boardId: string, token: string) {
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
      items_page: {
        items: { id: string; name: string; column_values: ColumnValue[] }[];
      };
    }[];
  };
  const board = data.boards?.[0];
  return { board, items: board?.items_page?.items ?? [] };
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
  items: { id: string; name: string; column_values: ColumnValue[] }[],
  stageName: string
): { item: typeof items[0]; statusCol: ColumnValue } | null {
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

    // Apply the update
    await updateItemColumn(boardId, item.id, statusCol.id, mondayLabel, token);

    let nextStageActivated: string | null = null;

    if (mondayLabel === "Done") {
      // Advance next stage to Working on it
      if (stageIdx < STAGE_ORDER.length - 1) {
        const nextName = STAGE_ORDER[stageIdx + 1] as StageName;
        const nextFound = findStageItem(items, nextName);
        if (nextFound) {
          await updateItemColumn(boardId, nextFound.item.id, nextFound.statusCol.id, "Working on it", token);
          nextStageActivated = nextName;
          console.log(`Next stage activated: ${nextName} → Working on it`);
        }
      }
    } else {
      // Downgrade — cascade reset all later stages to Not Started
      for (let i = stageIdx + 1; i < STAGE_ORDER.length; i++) {
        const laterName = STAGE_ORDER[i] as StageName;
        const laterFound = findStageItem(items, laterName);
        if (laterFound && laterFound.statusCol.text?.toLowerCase() !== "not started") {
          await updateItemColumn(boardId, laterFound.item.id, laterFound.statusCol.id, "Not Started", token);
          console.log(`Cascade reset: ${laterName} → Not Started`);
        }
      }
    }

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

    // Find Demo Ready For Review
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

    // Set Revision Window → Working on it
    let nextStageActivated: string | null = null;
    const revFound = findStageItem(items, "Revision Window");
    if (revFound) {
      await updateItemColumn(boardId, revFound.item.id, revFound.statusCol.id, "Working on it", token);
      nextStageActivated = "Revision Window";
      console.log(`Next stage activated: Revision Window → Working on it`);
    }

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

    // 2. Find the first item with status "Working on it" (active stage)
    const activeItem = items.find(item => {
      const statusCol = item.column_values.find(c =>
        c.column.title.toLowerCase().includes("status")
      );
      return statusCol?.text?.toLowerCase() === "working on it";
    });

    // 3. If nothing is "Working on it", find the LAST "Done" item and treat
    //    the next stage as active.
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
