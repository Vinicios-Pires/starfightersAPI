import { Router } from "express";

import rankingRouter from "./rankingRouter.js"
import battleRouter from "./battleRouter.js"

const router = Router();

router.use(rankingRouter);
router.use(battleRouter);

export default router;
