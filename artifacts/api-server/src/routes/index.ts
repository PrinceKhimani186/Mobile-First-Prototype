import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ghlRouter from "./ghl";
import adminRouter from "./admin";
import projectsRouter from "./projects";
import clickupRouter from "./clickup";
import authRouter from "./auth";
import enrollmentRouter from "./enrollment";
import enrollmentSupabaseRouter from "./enrollment-supabase";
import publishingRequirementsRouter from "./publishing-requirements";
import debugRouter from "./debug";
import esignaturesRouter from "./esignatures";
import approvalsRouter from "./approvals";
import zohoRouter from "./zoho";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ghlRouter);
router.use(adminRouter);
router.use(projectsRouter);
router.use(clickupRouter);
router.use(authRouter);
router.use(enrollmentRouter);
router.use(enrollmentSupabaseRouter);
router.use(publishingRequirementsRouter);
router.use(debugRouter);
router.use(esignaturesRouter);
router.use(approvalsRouter);
router.use(zohoRouter);

export default router;
