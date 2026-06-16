import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ghlRouter from "./ghl";
import adminRouter from "./admin";
import projectsRouter from "./projects";
import mondayRouter from "./monday";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ghlRouter);
router.use(adminRouter);
router.use(projectsRouter);
router.use(mondayRouter);
router.use(authRouter);

export default router;
