import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, projectsTable, PROJECT_STAGES } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router: IRouter = Router();

// ─── Auth middleware ──────────────────────────────────────────────────────────
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if ((req.session as { adminAuth?: boolean }).adminAuth) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────
router.post("/admin/login", (req: Request, res: Response) => {
  const { password } = req.body as { password?: string };
  const adminPassword = process.env.ADMIN_PASSWORD || "appsquad2024";

  if (!password || password !== adminPassword) {
    req.log.warn("Admin login failed");
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  (req.session as { adminAuth?: boolean }).adminAuth = true;
  req.log.info("Admin logged in");
  res.json({ ok: true });
});

// ─── Logout ───────────────────────────────────────────────────────────────────
router.post("/admin/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// ─── Auth check ───────────────────────────────────────────────────────────────
router.get("/admin/auth", (req: Request, res: Response) => {
  const authenticated = !!(req.session as { adminAuth?: boolean }).adminAuth;
  res.json({ authenticated });
});

// ─── List projects ────────────────────────────────────────────────────────────
router.get("/admin/projects", requireAdmin, async (req: Request, res: Response) => {
  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .orderBy(desc(projectsTable.createdAt));
    res.json({ projects });
  } catch (err) {
    req.log.error({ err }, "Failed to list projects");
    res.status(500).json({ error: "Failed to list projects" });
  }
});

// ─── Get project ──────────────────────────────────────────────────────────────
router.get("/admin/projects/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id));

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json({ project });
  } catch (err) {
    req.log.error({ err }, "Failed to get project");
    res.status(500).json({ error: "Failed to get project" });
  }
});

// ─── Update project stage ──────────────────────────────────────────────────────
router.put("/admin/projects/:id/stage", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { stage } = req.body as { stage?: string };

    if (!stage || !(PROJECT_STAGES as readonly string[]).includes(stage)) {
      res.status(400).json({ error: "Invalid stage" });
      return;
    }

    const [updated] = await db
      .update(projectsTable)
      .set({ currentStage: stage, updatedAt: new Date() })
      .where(eq(projectsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    req.log.info({ id, stage }, "Admin updated project stage");
    res.json({ ok: true, project: updated });
  } catch (err) {
    req.log.error({ err }, "Failed to update project stage");
    res.status(500).json({ error: "Failed to update stage" });
  }
});

// ─── Update project details ────────────────────────────────────────────────────
router.put("/admin/projects/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { customerName, phone, package: pkg, gameTemplate, appName, notes } =
      req.body as Record<string, string>;

    const [updated] = await db
      .update(projectsTable)
      .set({
        ...(customerName !== undefined ? { customerName } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(pkg !== undefined ? { package: pkg } : {}),
        ...(gameTemplate !== undefined ? { gameTemplate } : {}),
        ...(appName !== undefined ? { appName } : {}),
        ...(notes !== undefined ? { notes } : {}),
        updatedAt: new Date(),
      })
      .where(eq(projectsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.json({ ok: true, project: updated });
  } catch (err) {
    req.log.error({ err }, "Failed to update project");
    res.status(500).json({ error: "Failed to update project" });
  }
});

// ─── Create project manually ────────────────────────────────────────────────────
router.post("/admin/projects", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { customerName, email, phone, package: pkg, gameTemplate, appName, source, currentStage } =
      req.body as Record<string, string>;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const projectId = await generateProjectId();

    const [project] = await db
      .insert(projectsTable)
      .values({
        projectId,
        customerName: customerName || "",
        email,
        phone: phone || "",
        package: pkg || "",
        gameTemplate: gameTemplate || "",
        appName: appName || "",
        source: source || "Direct",
        currentStage: currentStage || "Project Received",
        notes: "",
      })
      .onConflictDoUpdate({
        target: projectsTable.email,
        set: {
          customerName: customerName || "",
          phone: phone || "",
          package: pkg || "",
          gameTemplate: gameTemplate || "",
          appName: appName || "",
          source: source || "Direct",
          updatedAt: new Date(),
        },
      })
      .returning();

    res.json({ ok: true, project });
  } catch (err) {
    req.log.error({ err }, "Failed to create project");
    res.status(500).json({ error: "Failed to create project" });
  }
});

export async function generateProjectId(): Promise<string> {
  const result = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(projectsTable);
  const total = result[0]?.count ?? 0;
  return `AS-${String(total + 1).padStart(3, "0")}`;
}

export default router;
