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
  enrichExistingPost,
  getContentById,
  listContent,
  updateContent,
  deleteContent,
  searchContent,
  graphContent,
  resurfacingContent,
} from "../controllers/content.controller.js";

const contentRouter = Router();

contentRouter.post("/", authUser, createContentValidator, createContent);
contentRouter.post(
  "/ingest",
  authUser,
  createContentValidator,
  ingestFromExtension,
);
contentRouter.post(
  "/import",
  authUser,
  upload.single("file"),
  importPdfContent,
);
contentRouter.post("/:id/enrich", authUser, enrichExistingPost);
contentRouter.get("/", authUser, listContentValidator, listContent);
contentRouter.get("/search", authUser, searchContent);
contentRouter.get("/graph", authUser, graphContent);
contentRouter.get("/resurface", authUser, resurfacingContent);
contentRouter.get("/:id", authUser, getContentById);
contentRouter.patch("/:id", authUser, updateContentValidator, updateContent);
contentRouter.delete("/:id", authUser, deleteContent);

export default contentRouter;
