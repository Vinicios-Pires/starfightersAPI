import { Router, Request, Response } from "express";
import axios from "axios";

import db from "../config/db.js";

const battleRouter = Router();

battleRouter.post("/battle", async (req: Request, res: Response) => {
	const { firstUser, secondUser }: { firstUser: string; secondUser: string } =
		req.body;

	try {
		let countStarsFirstUser = 0;
		let countStarsSecondUser = 0;

		// primeiro usuario
		const reposFirstUser = await axios
			.get(`http://api.github.com/users/${firstUser}/repos`)
			.catch((err: any) => {
				throw { code: 404, message: err.response.data };
			});

		reposFirstUser.data.forEach(
			(repo: any) => (countStarsFirstUser += repo.stargazers_count)
		);

		// segundo usuario
		const reposSecondUser = await axios
			.get(`http://api.github.com/users/${secondUser}/repos`)
			.catch((err) => {
				throw { code: 404, message: err.response.data };
			});

		reposSecondUser.data.forEach(
			(repo: any) => (countStarsSecondUser += repo.stargazers_count)
		);

		const firstUserExists = await db.query(
			`SELECT * FROM fighters WHERE username=$1`,
			[firstUser]
		);
		if (firstUserExists.rowCount === 0) {
			await db.query(
				`INSERT INTO fighters (username, wins, losses, draws)
        VALUES ($1, $2, $3, $4)`,
				[firstUser, 0, 0, 0]
			);
			return res.status(201).send("New fighter created!");
		}

		const secondUserExists = await db.query(
			`SELECT * FROM fighters WHERE username=$1`,
			[secondUser]
		);
		if (secondUserExists.rowCount === 0) {
			await db.query(
				`INSERT INTO fighters (username, wins, losses, draws)
        VALUES ($1, $2, $3, $4)`,
				[secondUser, 0, 0, 0]
			);
			return res.status(201).send("New fighter created!");
		}

		// batalha
		if (countStarsFirstUser > countStarsSecondUser) {
			await db.query(
				`UPDATE fighters
         SET wins=wins+1
         WHERE username=$1`,
				[firstUser]
			);

			await db.query(
				`UPDATE fighters
         SET losses=losses+1
         WHERE username=$1`,
				[secondUser]
			);

			return res.send({
				winner: firstUser,
				loser: secondUser,
				draw: false,
			});
		}

		if (countStarsSecondUser > countStarsFirstUser) {
			await db.query(
				`UPDATE fighters
         SET wins=wins+1 
         WHERE username=$1`,
				[secondUser]
			);

			await db.query(
				`UPDATE fighters
         SET losses=losses+1 
         WHERE username=$1`,
				[firstUser]
			);

			return res.send({
				winner: secondUser,
				loser: firstUser,
				draw: false,
			});
		}

		if (countStarsSecondUser === countStarsFirstUser) {
			await db.query(
				`UPDATE fighters
         SET draws=draws+1
         WHERE username=$1`,
				[firstUser]
			);
			await db.query(
				`UPDATE fighters
         SET draws=draws+1
         WHERE username=$1`,
				[secondUser]
			);

			return res.send({
				winner: null,
				loser: null,
				draw: true,
			});
		}

		res.sendStatus(200);
	} catch (err) {
		console.log(err);
		res.sendStatus(err.code || 500);
	}
});

export default battleRouter;
