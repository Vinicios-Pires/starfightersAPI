import express, { Request, Response, json } from "express";
import axios from "axios";
import db from "./config/db.js";

const app = express();
app.use(json());

app.get("/", async (req: Request, res: Response) => {
	res.send("OK!");
});

app.post("/battle", async (req: Request, res: Response) => {
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
         VALUES ($1,$2,$3,$5)`,
				[firstUser, 0, 0, 0]
			);
		}

		const secondUserExists = await db.query(
			`SELECT * FROM fighters WHERE username=$1`,
			[secondUser]
		);
		if (secondUserExists.rowCount === 0) {
			await db.query(
				`INSERT INTO fighters (username, wins, losses, draws)
         VALUES ($1,$2,$3,$5)`,
				[secondUser, 0, 0, 0]
			);
		}

		// batalha
		if (countStarsFirstUser > countStarsSecondUser) {
			await db.query(
				`UPDATE fighters
         SET wins=wins+1 losses=losses draws=draws
         WHERE username=$1`,
				[firstUser]
			);

			await db.query(
				`UPDATE fighters
         SET wins=wins losses=losses+1 draws=draws
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
         SET wins=wins+1 losses=losses draws=draws
         WHERE username=$1`,
				[secondUser]
			);

			await db.query(
				`UPDATE fighters
         SET wins=wins losses=losses+1 draws=draws
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
         SET wins=wins losses=losses draws=draws+1
         WHERE username=$1`,
				[firstUser]
			);
			await db.query(
				`UPDATE fighters
         SET wins=wins losses=losses draws=draws+1
         WHERE username=$1`,
				[secondUser]
			);

			return res.send({
				winner: null,
				loser: null,
				draw: true,
			});
		}

		res.send("ok");
	} catch (err) {
		console.log(err);
		res.sendStatus(err.code);
	}
});

app.get("/ranking", async (req: Request, res: Response) => {
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

const port: number = +process.env.PORT || 4000;
app.listen(port, () => {
	console.log(`Server is running in: localhost:${port}/`);
});
