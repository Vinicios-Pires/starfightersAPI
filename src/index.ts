import express, { Request, Response, json } from "express";
import axios from "axios";
import db from "./config/db.js";
import router from "./routes/index.js";

const app = express();
app.use(json());
app.use(router);

app.get("/", async (req: Request, res: Response) => {
	res.send("OK!");
});

const port: number = +process.env.PORT || 4000;
app.listen(port, () => {
	console.log(`Server is running in: localhost:${port}/`);
});
