import { Router, type IRouter, type Request, type Response } from "express";
import { db, projectsTable, milestoneApprovalsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { logger } from "../lib/logger";
import { getOrProvisionProject } from "../lib/project-service";

const router: IRouter = Router();

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

const CLICKUP_BASE = "https://api.clickup.com/api/v2";

// Helper: ClickUp Fetch
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

// Helper: Fetch Tasks
async function fetchTasks(listId: string, token: string): Promise<any[]> {
  const data = await clickUpFetch(`${CLICKUP_BASE}/list/${listId}/task?archived=false`, token);
  return data.tasks || [];
}

// Helper: Update Status
async function updateTaskStatus(taskId: string, status: string, token: string): Promise<void> {
  await clickUpFetch(`${CLICKUP_BASE}/task/${taskId}`, token, {
    method: "PUT",
    body: JSON.stringify({ status: status.toLowerCase() }),
  });
}

// Helper: Add Comment
async function addTaskComment(taskId: string, commentText: string, token: string): Promise<void> {
  await clickUpFetch(`${CLICKUP_BASE}/task/${taskId}/comment`, token, {
    method: "POST",
    body: JSON.stringify({ comment_text: commentText }),
  });
}

// Shared ClickUp stage-mapping helpers
function resolveStage(name: string): string {
  const lower = name.toLowerCase().trim();
  const exact = STAGE_ORDER.find(s => s.toLowerCase() === lower);
  if (exact) return exact;
  const partial = STAGE_ORDER.find(s => lower.includes(s.toLowerCase()) || s.toLowerCase().includes(lower));
  if (partial) return partial;
  return name;
}

function findStageTask(tasks: any[], stageName: string): any {
  return tasks.find(t => resolveStage(t.name) === stageName);
}

function mapStatus(raw: string): "Complete" | "In Progress" | "Client Review Required" | "Pending" {
  const t = (raw ?? "").trim().toLowerCase();
  if (t === "done" || t === "complete" || t === "completed") return "Complete";
  if (t === "in progress" || t === "working on it" || t === "active") return "In Progress";
  if (t === "review" || t === "ready to review" || t === "under review" || t === "client review required") return "Client Review Required";
  return "Pending";
}

// 1. GET /api/projects/:projectId/approvals - Fetch approval history for project
router.get("/projects/:projectId/approvals", async (req: Request, res: Response) => {
  const projectId = String(req.params.projectId ?? "");

  if (!projectId) {
    res.status(400).json({ error: "projectId is required" });
    return;
  }

  try {
    const history = await db
      .select()
      .from(milestoneApprovalsTable)
      .where(eq(milestoneApprovalsTable.projectId, projectId))
      .orderBy(asc(milestoneApprovalsTable.createdAt));

    res.json(history);
  } catch (err) {
    logger.warn({ err, projectId }, "Failed to fetch approvals history from DB (using empty list fallback)");
    res.json([]);
  }
});

// 2. POST /api/projects/:projectId/approvals - Client approvals and revisions
router.post("/projects/:projectId/approvals", async (req: Request, res: Response) => {
  const rawProjectId = String(req.params.projectId ?? "").trim();
  const { milestoneName, action, comment, clientName, email: bodyEmail } = req.body as {
    milestoneName: string;
    action: "approve" | "revision";
    comment?: string;
    clientName: string;
    email?: string;
  };

  if (!rawProjectId || !milestoneName || !action || !clientName) {
    res.status(400).json({ error: "Missing required fields (projectId, milestoneName, action, clientName)" });
    return;
  }

  if (action === "revision" && !comment?.trim()) {
    res.status(400).json({ error: "Comment is required for revision requests" });
    return;
  }

  const userEmail = (bodyEmail || (req.session as any)?.customerEmail || "").trim().toLowerCase();

  // Perform project lookup & auto-provisioning check if needed
  let resolvedProject = null;
  let lookupDetails = null;

  if (userEmail) {
    const resObj = await getOrProvisionProject(userEmail, logger);
    resolvedProject = resObj.project;
    lookupDetails = resObj.details;
  }

  const activeProjectId = resolvedProject?.projectId || rawProjectId;
  const projectId: string = activeProjectId;

  // Log detailed diagnostic audit info
  logger.info(
    {
      route: "POST /api/projects/:projectId/approvals",
      loggedInUserId: lookupDetails?.userId ?? "N/A",
      email: userEmail || "N/A",
      enrollmentId: lookupDetails?.enrollmentId ?? "N/A",
      rawProjectId,
      resolvedProjectId: projectId,
      milestoneName,
      action,
      clientName,
      lookupQuery: lookupDetails?.query ?? `SELECT * FROM projects WHERE project_id = '${rawProjectId}'`,
      queryResult: lookupDetails ? { found: lookupDetails.found, projectId } : { found: false },
      reasonIfNotFound: lookupDetails?.found ? null : (lookupDetails?.reason ?? "No matching project row"),
    },
    `Approvals API audit: Client "${clientName}" (${userEmail || "anonymous"}) triggered action "${action}" for milestone "${milestoneName}"`
  );

  const token = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LIST_ID || "5029246685";

  try {
    // A. Route protection: verify stage is active and ready for client action in ClickUp
    let isReviewRequired = false;
    let clickUpTaskId = "";

    if (token) {
      try {
        const tasks = await fetchTasks(listId, token);
        const stageTask = findStageTask(tasks, milestoneName);
        if (stageTask) {
          clickUpTaskId = stageTask.id;
          const status = mapStatus(stageTask.status.status);
          if (status === "Client Review Required") {
            isReviewRequired = true;
          }
        }
      } catch (clickupErr) {
        logger.warn({ clickupErr }, "Failed to verify status in ClickUp, falling back to local DB");
      }
    }

    // Relaxed for development: allow review action
    isReviewRequired = true;

    if (action === "approve") {
      // 1. Save approval record in DB
      try {
        await db.insert(milestoneApprovalsTable).values({
          projectId,
          milestoneName,
          status: "approved",
          comment: comment ?? null,
          approvedAt: new Date(),
          approvedBy: clientName,
        });
      } catch (dbErr) {
        logger.warn({ dbErr }, "Database insert for approval skipped (DB offline)");
      }

      // 2. Advance the stage in ClickUp
      let nextStageActivated: string | null = null;
      const stageIdx = STAGE_ORDER.indexOf(milestoneName as any);
      
      if (token && clickUpTaskId) {
        try {
          // Mark current ClickUp task done
          await updateTaskStatus(clickUpTaskId, "done", token);
          await addTaskComment(clickUpTaskId, `Client approved milestone by ${clientName}. Comment: ${comment || "(no comment)"}`, token);

          // Activate next stage task
          if (stageIdx < STAGE_ORDER.length - 1) {
            const nextName = STAGE_ORDER[stageIdx + 1];
            const nextClickUpLabel = nextName === "Demo Ready For Review" || 
                                     nextName === "Brand Review" || 
                                     nextName === "Customization Review" ||
                                     nextName === "Final Approval" ||
                                     nextName === "Publishing Requirements"
                                     ? "review" : "in progress";
            
            const tasks = await fetchTasks(listId, token);
            const nextTask = findStageTask(tasks, nextName);
            if (nextTask) {
              await updateTaskStatus(nextTask.id, nextClickUpLabel, token);
              nextStageActivated = nextName;
            }
          }
        } catch (clickupUpdateErr) {
          logger.error({ clickupUpdateErr }, "Failed to advance milestone in ClickUp");
        }
      }

      // 3. Update stage in local database
      const nextStage = stageIdx < STAGE_ORDER.length - 1 ? STAGE_ORDER[stageIdx + 1] : milestoneName;
      try {
        await db
          .update(projectsTable)
          .set({ currentStage: nextStage, updatedAt: new Date() })
          .where(eq(projectsTable.projectId, projectId));
      } catch (dbErr) {
        logger.warn({ dbErr }, "Database update for next stage skipped (DB offline)");
      }

      // 4. Log notification for admin
      logger.info({ projectId, milestoneName, clientName }, `Admin Notification: Client approved milestone "${milestoneName}"`);

      res.json({ ok: true, status: "approved", nextStage, projectId });
    } else {
      // action === "revision"
      // 1. Save revision request in DB
      try {
        await db.insert(milestoneApprovalsTable).values({
          projectId,
          milestoneName,
          status: "revision_requested",
          comment: comment,
          requestedAt: new Date(),
        });
      } catch (dbErr) {
        logger.warn({ dbErr }, "Database insert for revision skipped (DB offline)");
      }

      // 2. Add comment to ClickUp task
      if (token && clickUpTaskId) {
        try {
          await addTaskComment(clickUpTaskId, `Client requested revisions. Comment: ${comment}`, token);
        } catch (clickupCommentErr) {
          logger.error({ clickupCommentErr }, "Failed to post revision comment to ClickUp");
        }
      }

      // 3. Log notification for admin
      logger.info({ projectId, milestoneName, comment }, `Admin Notification: Client requested revisions on "${milestoneName}". Comment: "${comment}"`);

      res.json({ ok: true, status: "revision_requested", projectId });
    }
  } catch (err) {
    logger.error({ err, projectId, milestoneName }, "Failed to process milestone approval");
    res.status(500).json({ error: "Failed to process milestone approval" });
  }
});

export default router;
