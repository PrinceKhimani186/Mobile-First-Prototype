import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const MONDAY_API = "https://api.monday.com/v2";

// ── Monday GraphQL fetch ─────────────────────────────────────────────────────
async function mondayQuery(query: string, token: string): Promise<unknown> {
  const res = await fetch(MONDAY_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      "API-Version": "2024-01",
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
  // Exact match first
  const exact = STAGE_ORDER.find(s => s.toLowerCase() === lower);
  if (exact) return exact;
  // Partial match
  const partial = STAGE_ORDER.find(s => lower.includes(s.toLowerCase()) || s.toLowerCase().includes(lower));
  if (partial) return partial;
  // Return raw name as fallback
  return name;
}

// ── GET /api/monday/project?email=xxx ────────────────────────────────────────
router.get("/monday/project", async (req: Request, res: Response) => {
  const token = process.env.MONDAY_API_TOKEN;
  const boardId = process.env.MONDAY_BOARD_ID || "5029246685";

  if (!token) {
    res.status(503).json({ error: "MONDAY_API_TOKEN not configured", fallback: true });
    return;
  }

  const email = ((req.query.email as string) ?? "").trim().toLowerCase();

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
                id
                text
                value
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
          items: {
            id: string;
            name: string;
            column_values: ColumnValue[];
          }[];
        };
      }[];
    };

    const board = data.boards?.[0];
    if (!board) {
      res.status(404).json({ error: "Board not found", fallback: true });
      return;
    }

    const items = board.items_page.items;

    // 1. Try to find a specific client item by email
    let clientItem = email
      ? items.find(item => {
          const emailCol = item.column_values.find(c =>
            c.column.title.toLowerCase().includes("email")
          );
          return emailCol?.text?.toLowerCase().includes(email);
        })
      : null;

    // 2. Find the first item whose status is "Working on it" (the active stage)
    const activeItem = items.find(item => {
      const statusCol = item.column_values.find(c =>
        c.column.title.toLowerCase().includes("status")
      );
      return statusCol?.text?.toLowerCase().includes("working on it");
    });

    // 3. Client metadata lives on items[0] ("Project Received") where all client columns are stored.
    //    If we matched a specific client item by email, prefer that. Otherwise always use items[0].
    const metaItem = clientItem ?? items[0];

    // 4. Current stage = the name of the first "Working on it" task,
    //    resolved to a known stage label
    const rawStageName = activeItem?.name ?? metaItem?.name ?? "Project Received";
    const currentStage = resolveStage(rawStageName);

    // 5. Extract client/app metadata from the matched item
    const cols = metaItem?.column_values ?? [];
    const clientName = colText(cols, "client name", "client", "name");
    const appName    = colText(cols, "app name", "app");
    const gameType   = colText(cols, "game type", "game");
    const tagline    = colText(cols, "tagline", "slogan");
    const monetization = colText(cols, "monetization", "revenue", "monetize");

    // 6. Progress — read from the active stage item's column first, then derive from stage name
    const activeCols = activeItem?.column_values ?? [];
    const progressCol = colNumber(activeCols, "progress", "%", "percent")
      ?? colNumber(cols, "progress", "%", "percent");
    const progressPct = progressCol !== null
      ? progressCol
      : (STAGE_PCT[currentStage] ?? 10);

    // 7. Completed stages count
    const currentIdx   = STAGE_ORDER.indexOf(currentStage as typeof STAGE_ORDER[number]);
    const completedCount = currentIdx > 0 ? currentIdx : 0;

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
      // All raw item names + statuses for debugging
      _items: items.map(i => ({
        id: i.id,
        name: i.name,
        status: i.column_values.find(c =>
          c.column.title.toLowerCase().includes("status")
        )?.text ?? "",
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Monday.com API fetch failed");
    res.status(502).json({ error: "Monday API unavailable", fallback: true });
  }
});

export default router;
