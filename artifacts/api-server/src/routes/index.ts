import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ghlRouter from "./ghl";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ghlRouter);

export default router;
