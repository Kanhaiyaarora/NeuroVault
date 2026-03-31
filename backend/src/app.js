import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import morgan from "morgan";
import contentRouter from "./routes/content.routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// logger
app.use(morgan("dev"));

// routes
app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);

export default app;

// pinecone index name -> neuro-vault