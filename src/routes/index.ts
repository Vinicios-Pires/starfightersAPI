import { Router } from "express";

import rankingRouter from "./rankingRouter.js"

const router = Router();

router.use(rankingRouter);

export default router;
