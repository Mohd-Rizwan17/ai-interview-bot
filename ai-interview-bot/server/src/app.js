import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.use(notFound);
app.use(errorHandler);

export default app;
