import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import miniProjectRoutes from "./miniProject/projectRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import customQuestionRoutes from "./routes/customQuestionRoutes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use((req, res, next) => {
  req.body ??= {};
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/custom-questions", customQuestionRoutes);
app.use("/api/mini-projects", miniProjectRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
