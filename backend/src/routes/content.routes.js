import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import {
  createContentValidator,
  updateContentValidator,
  listContentValidator,
} from "../validators/content.validator.js";
import {
  createContent,
  ingestFromExtension,
  importPdfContent,
  importImageContent,
  enrichExistingPost,
  getContentById,
  listContent,
  updateContent,
  deleteContent,
  searchContent,
  ragContent,
  relatedContent,
  graphContent,
  resurfacingContent,
  importYoutubeContent,
  importTweetContent,
} from "../controllers/content.controller.js";

const contentRouter = Router();

// Core content CRUD endpoints
contentRouter.post("/", authUser, createContentValidator, createContent); // create new content
contentRouter.post(
  "/ingest",
  authUser,
  createContentValidator,
  ingestFromExtension,
); // extension ingestion alias

// File + media ingest endpoints
contentRouter.post(
  "/import",
  authUser,
  upload.single("file"),
  importPdfContent,
); // PDF import
contentRouter.post(
  "/import-image",
  authUser,
  upload.single("file"),
  importImageContent,
); // image import + OCR
contentRouter.post("/import-youtube", authUser, importYoutubeContent); // yt ingestion
contentRouter.post("/import-tweet", authUser, importTweetContent); // tweet ingestion
contentRouter.post("/:id/enrich", authUser, enrichExistingPost); // manual re-enrich request
contentRouter.post("/rag", authUser, ragContent); // RAG answer endpoint
contentRouter.post("/query", authUser, ragContent); // alias for RAG query
contentRouter.get("/related", authUser, relatedContent); // related items
contentRouter.get("/", authUser, listContentValidator, listContent); // list content (pagination+filters)
contentRouter.get("/search", authUser, searchContent); // text/semantic search
contentRouter.get("/graph", authUser, graphContent);
contentRouter.get("/resurface", authUser, resurfacingContent);
contentRouter.get("/:id", authUser, getContentById);
contentRouter.patch("/:id", authUser, updateContentValidator, updateContent);
contentRouter.delete("/:id", authUser, deleteContent);

export default contentRouter;
