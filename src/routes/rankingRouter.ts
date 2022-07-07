import { Router, Request, Response } from "express";

import db from "../config/db.js";

const rankingRouter = Router();

rankingRouter.get("/ranking", async (req: Request, res: Response) => {
	try {
		const result = await db.query(
			`SELECT username, wins, losses, draws
      FROM fighters
      ORDER BY wins DESC, draws DESC`
		);
		res.send(result.rows);
	} catch (err) {
		console.error(err);
		res.sendStatus(500);
	}
});

export default rankingRouter;
