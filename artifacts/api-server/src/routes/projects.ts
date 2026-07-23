import { Router, type IRouter, type Request, type Response } from "express";
import { getOrProvisionProject } from "../lib/project-service";

const router: IRouter = Router();

// Public endpoint: customer dashboard fetches their current stage by email.
router.get("/projects/stage", async (req: Request, res: Response) => {
  const email = (req.query.email as string)?.trim().toLowerCase();

  if (!email) {
    res.status(400).json({ error: "email query param required" });
    return;
  }

  try {
    const { project, details } = await getOrProvisionProject(email, req.log);

    if (!project) {
      req.log.warn({ details }, `Project not found and auto-provisioning failed for email: ${email}`);
      res.status(404).json({
        error: `No project record found for account ${email} and auto-provisioning failed: ${details.reason ?? "Unknown error"}`,
        details,
      });
      return;
    }

    res.json({
      projectId: project.projectId,
      currentStage: project.currentStage,
      customerName: project.customerName,
      appName: project.appName,
      updatedAt: project.updatedAt,
    });
  } catch (err) {
    req.log.error({ err, email }, "Failed to resolve or provision project stage");
    res.status(500).json({
      error: `Failed to resolve project stage for ${email}: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
});

export default router;
