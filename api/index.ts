import express from "express";
import dotenv from "dotenv";
import { apiRouter } from "../server/apiRouter";

dotenv.config();

const app = express();
app.use(express.json({ limit: "15mb" }));
app.use("/api", apiRouter);

export default app;
