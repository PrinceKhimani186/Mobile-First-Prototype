import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ghlRouter from "./ghl";
import adminRouter from "./admin";
import projectsRouter from "./projects";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ghlRouter);
router.use(adminRouter);
router.use(projectsRouter);

export default router;
