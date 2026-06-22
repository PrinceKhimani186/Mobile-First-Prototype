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

// ── Stage map — Monday task names → dashboard stage names ────────────────────
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

// Fuzzy-match a Monday item name to a known dashboard stage
function resolveStage(name: string): string {
  const lower = name.toLowerCase().trim();
  const exact = STAGE_ORDER.find(s => s.toLowerCase() === lower);
  if (exact) return exact;
  const partial = STAGE_ORDER.find(s => lower.includes(s.toLowerCase()) || s.toLowerCase().includes(lower));
  if (partial) return partial;
  return name;
}

// ── Status text → dashboard label ───────────────────────────────────────────
function mapStatus(raw: string): "Complete" | "In Progress" | "Pending" {
  const t = (raw ?? "").trim().toLowerCase();
  if (t === "done") return "Complete";
  if (t === "working on it") return "In Progress";
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

  console.log(`Stage clicked: ${stageName}`);
  console.log(`New status: ${status} → Monday label: "${mondayLabel}"`);

  try {
    const { items } = await fetchBoardItems(boardId, token);

    // Find the Monday item whose name matches the stage
    const item = items.find(i => {
      const lower = i.name.toLowerCase().trim();
      const stage = stageName.toLowerCase().trim();
      return lower === stage || lower.includes(stage) || stage.includes(lower);
    });

    if (!item) {
      console.error(`Stage not found in Monday board: "${stageName}"`);
      res.status(404).json({ error: `Stage "${stageName}" not found in Monday board` });
      return;
    }

    const statusCol = item.column_values.find(
      c => c.column.title.toLowerCase().includes("status")
    );
    if (!statusCol) {
      res.status(404).json({ error: `No status column found on item "${item.name}"` });
      return;
    }

    console.log(`Monday item ID: ${item.id}`);
    console.log(`Old status: ${statusCol.text ?? "(empty)"}`);

    // Update the status column using Monday's mutation
    const mutation = `
      mutation {
        change_column_value(
          board_id: ${boardId},
          item_id: ${item.id},
          column_id: "${statusCol.id}",
          value: "{\\"label\\": \\"${mondayLabel}\\"}"
        ) {
          id
          name
        }
      }
    `;

    const updateData = (await mondayQuery(mutation, token)) as {
      change_column_value?: { id: string; name: string };
    };

    console.log(`Monday update response: ${JSON.stringify(updateData)}`);

    res.json({
      ok: true,
      itemId: item.id,
      stageName,
      oldStatus: statusCol.text ?? "",
      newStatus: mondayLabel,
      monday: updateData,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`update-stage-status FAILED for "${stageName}":`, message);
    req.log.error({ err }, "update-stage-status failed");
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

    // Map each known stage to its Monday board item status
    const stages = STAGE_ORDER.map(stageName => {
      const item = items.find(i => {
        const lower = i.name.toLowerCase().trim();
        const stage = stageName.toLowerCase();
        return lower === stage || lower.includes(stage) || stage.includes(lower);
      });

      const rawStatus = item?.column_values.find(
        c => c.column.title.toLowerCase().includes("status")
      )?.text ?? "Not Started";

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
    res.status(503).json({
      error: "MONDAY_API_TOKEN not set",
      boardId,
      tokenSet: false,
    });
    return;
  }

  try {
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

    const rawData = (await mondayQuery(query, token)) as {
      boards: {
        name: string;
        items_page: {
          items: { id: string; name: string; column_values: ColumnValue[] }[];
        };
      }[];
    };

    const board = rawData.boards?.[0];
    const items = board?.items_page?.items ?? [];

    const itemSummary = items.map(i => ({
      id: i.id,
      name: i.name,
      statusText: i.column_values.find(
        c => c.column.title.toLowerCase().includes("status")
      )?.text ?? "(no status column)",
      allColumnTitles: i.column_values.map(c => c.column.title),
    }));

    res.json({
      boardId,
      boardName: board?.name ?? "(board not found)",
      tokenSet: true,
      tokenPrefix: token.slice(0, 12) + "…",
      itemCount: items.length,
      items: itemSummary,
      rawResponse: rawData,
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

    // 3. If nothing is "Working on it", find the LAST "Done" item and treat the
    //    next stage as active. This handles boards where stages are all Done or Not Started.
    let currentStage: string;
    if (activeItem) {
      currentStage = resolveStage(activeItem.name);
    } else {
      // Find the last completed stage index
      let lastDoneIdx = -1;
      items.forEach((item, i) => {
        const statusCol = item.column_values.find(c =>
          c.column.title.toLowerCase().includes("status")
        );
        if (statusCol?.text?.toLowerCase() === "done") {
          // Map to STAGE_ORDER index
          const stageIdx = STAGE_ORDER.findIndex(s => resolveStage(item.name) === s);
          if (stageIdx > lastDoneIdx) lastDoneIdx = stageIdx;
        }
      });

      if (lastDoneIdx >= 0 && lastDoneIdx < STAGE_ORDER.length - 1) {
        // Next stage after the last completed one is "active"
        currentStage = STAGE_ORDER[lastDoneIdx + 1];
      } else if (lastDoneIdx === STAGE_ORDER.length - 1) {
        // All done
        currentStage = STAGE_ORDER[STAGE_ORDER.length - 1];
      } else {
        // Nothing done yet
        currentStage = STAGE_ORDER[0];
      }
    }

    // 4. Client metadata from matched item or items[0]
    const metaItem = clientItem ?? items[0];
    const cols = metaItem?.column_values ?? [];
    const clientName   = colText(cols, "client name", "client", "name");
    const appName      = colText(cols, "app name", "app");
    const gameType     = colText(cols, "game type", "game");
    const tagline      = colText(cols, "tagline", "slogan");
    const monetization = colText(cols, "monetization", "revenue", "monetize");

    // 5. Progress pct derived from the active item's column, else from stage name
    const activeCols  = (activeItem ?? metaItem)?.column_values ?? [];
    const progressCol = colNumber(activeCols, "progress", "%", "percent")
      ?? colNumber(cols, "progress", "%", "percent");
    const progressPct = progressCol !== null
      ? progressCol
      : (STAGE_PCT[currentStage] ?? 10);

    // 6. Completed stage count = how many stages are Done
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
