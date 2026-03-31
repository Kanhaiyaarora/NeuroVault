import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import morgan from "morgan";
import contentRouter from "./routes/content.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// logger
app.use(morgan("dev"));

// routes
app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);

// health
app.get("/api/health", (req, res) =>
  res.status(200).json({ success: true, status: "ok" }),
);

// global error handler
app.use(errorHandler);

export default app;

// pinecone index name -> neuro-vault
