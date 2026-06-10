import { Router, type IRouter, type Request, type Response } from "express";
import { db, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// Public endpoint: customer dashboard fetches their current stage by email.
router.get("/projects/stage", async (req: Request, res: Response) => {
  const email = (req.query.email as string)?.trim().toLowerCase();

  if (!email) {
    res.status(400).json({ error: "email query param required" });
    return;
  }

  try {
    const [project] = await db
      .select({
        projectId: projectsTable.projectId,
        currentStage: projectsTable.currentStage,
        customerName: projectsTable.customerName,
        appName: projectsTable.appName,
        updatedAt: projectsTable.updatedAt,
      })
      .from(projectsTable)
      .where(eq(projectsTable.email, email));

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.json(project);
  } catch (err) {
    req.log.error({ err }, "Failed to get project stage");
    res.status(500).json({ error: "Failed to get stage" });
  }
});

export default router;
