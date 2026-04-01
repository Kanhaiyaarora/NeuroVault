import crypto from "crypto";
import pdf from "pdf-parse";
import Tesseract from "tesseract.js";
import ogs from "open-graph-scraper";
import { YoutubeTranscript } from "youtube-transcript/dist/youtube-transcript.esm.js";
import contentModel from "../models/content.model.js";
import { enrichContentAsync } from "../services/content.service.js";
import { enqueueContentEnrichment } from "../services/queue.service.js";
import { getEmbeddings, generateRagAnswer } from "../services/ai.service.js";
import { querySimilarVectors } from "../services/vector.service.js";
import { imageKit } from "../config/imagekit.js";

// Normalize URL for dedupe (strip query/hash, lower case)
const buildNormalizedUrl = (url = "") => {
  try {
    const u = new URL(url.trim());
    u.hash = "";
    u.search = "";
    return u.toString().toLowerCase();
  } catch (error) {
    return url.trim().toLowerCase();
  }
};

const buildFileHash = (text) => {
  return crypto
    .createHash("sha256")
    .update(text || "")
    .digest("hex");
};

const ensureOwnership = (doc, userId) => {
  if (!doc || !doc.userId || doc.userId.toString() !== userId.toString()) {
    const err = new Error("Not authorized to access this item");
    err.statusCode = 403;
    throw err;
  }
};

const extractTextFromImage = async (buffer) => {
  const worker = Tesseract.createWorker({
    logger: () => {},
  });

  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");

  const { data } = await worker.recognize(buffer);
  await worker.terminate();

  return (data?.text || "").trim();
};

// Main create route for user content.
// Handles dedupe, content create, and async enrichment queue trigger.
export const createContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      url,
      description = "",
      tags = [],
      category = "",
      subCategory = "",
      type = "article",
      image = "",
      summary = "",
      textChunks = [],
    } = req.body;

    const normalizedUrl = buildNormalizedUrl(url);
    const fileHash = buildFileHash(url + title + description);

    const exists = await contentModel.findOne({
      userId,
      $or: [{ normalizedUrl }, { fileHash }],
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Similar content already exists",
        data: {
          existingContentId: exists._id,
        },
      });
    }

    const data = await contentModel.create({
      userId,
      title,
      url,
      normalizedUrl,
      fileHash,
      description,
      tags,
      category,
      subCategory,
      type,
      image,
      summary,
      textChunks,
      vectorReady: false,
      contentId: crypto.randomUUID(),
    });

    enqueueContentEnrichment(data._id).catch((err) =>
      console.error("enqueueContentEnrichment createContent", err),
    );

    return res.status(201).json({
      success: true,
      message: "Content created successfully",
      data,
    });
  } catch (error) {
    console.error("createContent error", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create content",
      error: error.message || "Internal server error",
    });
  }
};

export const listContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "20", 10), 1),
      100,
    );
    const skip = (page - 1) * limit;
    const { q, tags, type, category, subCategory } = req.query;

    const filter = { userId };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;

    if (tags) {
      const parsedTags = Array.isArray(tags)
        ? tags
        : tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
      if (parsedTags.length > 0) {
        filter.tags = { $all: parsedTags };
      }
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { summary: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ];
    }

    const [items, total] = await Promise.all([
      contentModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-embedding -vectorIds")
        .lean(),
      contentModel.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("listContent error", error);
    return res.status(500).json({
      success: false,
      message: "Unable to list content",
      error: error.message || "Internal server error",
    });
  }
};

export const getContentById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const item = await contentModel.findById(id).select("-embedding").lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Content item not found",
      });
    }

    ensureOwnership(item, userId);

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("getContentById error", error);
    if (error.statusCode === 403) {
      return res.status(403).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: "Unable to fetch content item",
      error: error.message || "Internal server error",
    });
  }
};

export const graphContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const contents = await contentModel
      .find({ userId })
      .select("_id title type tags category subCategory createdAt")
      .lean();

    const nodes = contents.map((item) => ({
      id: item._id.toString(),
      title: item.title,
      type: item.type,
      tags: item.tags || [],
      category: item.category || "",
      subCategory: item.subCategory || "",
      createdAt: item.createdAt,
    }));

    const edges = [];

    const getEdgeKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

    const edgeMap = new Map();

    for (let i = 0; i < contents.length; i++) {
      for (let j = i + 1; j < contents.length; j++) {
        const a = contents[i];
        const b = contents[j];

        const sharedTags = (a.tags || []).filter((tag) =>
          (b.tags || []).includes(tag),
        );

        const sharedCategory =
          a.category && b.category && a.category === b.category;
        const sharedSubCategory =
          a.subCategory && b.subCategory && a.subCategory === b.subCategory;

        if (sharedTags.length === 0 && !sharedCategory && !sharedSubCategory) {
          continue;
        }

        const score =
          (sharedTags.length || 0) +
          (sharedCategory ? 1 : 0) +
          (sharedSubCategory ? 1 : 0);

        const key = getEdgeKey(a._id.toString(), b._id.toString());
        edgeMap.set(key, {
          source: a._id.toString(),
          target: b._id.toString(),
          sharedTags,
          sharedCategory,
          sharedSubCategory,
          score,
        });
      }
    }

    for (const value of edgeMap.values()) {
      edges.push(value);
    }

    return res.status(200).json({
      success: true,
      data: {
        nodes,
        edges,
      },
    });
  } catch (error) {
    console.error("graphContent error", error);
    return res.status(500).json({
      success: false,
      message: "Unable to generate graph data",
      error: error.message || "Internal server error",
    });
  }
};

// Update route: allow user to update fields and re-queue enrichment.
export const updateContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    const item = await contentModel.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Content item not found",
      });
    }

    ensureOwnership(item, userId);

    if (updates.url) {
      updates.normalizedUrl = buildNormalizedUrl(updates.url);
      updates.fileHash = buildFileHash(
        updates.url + (updates.title || item.title),
      );
    }

    Object.assign(item, updates);
    await item.save();

    enqueueContentEnrichment(item._id).catch((err) =>
      console.error("enqueueContentEnrichment updateContent", err),
    );

    return res.status(200).json({
      success: true,
      message: "Content updated",
      data: item,
    });
  } catch (error) {
    console.error("updateContent error", error);
    if (error.statusCode === 403) {
      return res.status(403).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: "Unable to update content",
      error: error.message || "Internal server error",
    });
  }
};

export const deleteContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const item = await contentModel.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Content item not found",
      });
    }

    ensureOwnership(item, userId);

    // remove image assets from ImageKit when fileStorageId exists.
    if (item.fileStorageId) {
      try {
        await imageKit.deleteFile(item.fileStorageId);
      } catch (imgErr) {
        console.warn(
          `Unable to delete ImageKit file ${item.fileStorageId}`,
          imgErr,
        );
      }
    }

    await contentModel.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: "Content deleted",
    });
  } catch (error) {
    console.error("deleteContent error", error);
    if (error.statusCode === 403) {
      return res.status(403).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: "Unable to delete content",
      error: error.message || "Internal server error",
    });
  }
};

export const searchContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { q, semantic } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Query parameter q is required",
      });
    }

    if (semantic === "true") {
      // Semantic search path using embeddings + Pinecone.
      const embeddings = await getEmbeddings([q]);
      if (!embeddings || embeddings.length === 0) {
        return res.status(200).json({
          success: true,
          data: { query: q, total: 0, items: [] },
        });
      }

      const queryVector = embeddings[0];
      const matches = await querySimilarVectors({
        userId,
        vector: queryVector,
        topK: parseInt(req.query.topK || "10", 10),
      });

      const contentIds = [...new Set(matches.map((m) => m.metadata.contentId))];
      const contents = await contentModel
        .find({ userId, contentId: { $in: contentIds } })
        .select("-embedding -vectorIds")
        .lean();

      const contentMap = new Map(
        contents.map((item) => [item.contentId, item]),
      );
      const items = matches
        .map((match) => {
          const content = contentMap.get(match.metadata.contentId);
          if (!content) return null;
          return {
            score: match.score,
            content,
          };
        })
        .filter(Boolean);

      return res.status(200).json({
        success: true,
        data: {
          query: q,
          total: items.length,
          items,
        },
      });
    }

    // Text search fallback.
    const filter = {
      userId,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { summary: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ],
    };

    const items = await contentModel
      .find(filter)
      .sort({ createdAt: -1 })
      .select("-embedding -vectorIds")
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        query: q,
        total: items.length,
        items,
      },
    });
  } catch (error) {
    console.error("searchContent error", error);
    return res.status(500).json({
      success: false,
      message: "Unable to search content",
      error: error.message || "Internal server error",
    });
  }
};

export const ragContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query, topK = 5 } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Query body parameter q is required",
      });
    }

    const embeddings = await getEmbeddings([query]);
    if (!embeddings || embeddings.length === 0) {
      return res.status(200).json({
        success: true,
        data: { query, answer: "", references: [] },
      });
    }

    const queryVector = embeddings[0];
    const matches = await querySimilarVectors({
      userId,
      vector: queryVector,
      topK: parseInt(topK, 10),
    });

    const contentIds = [...new Set(matches.map((m) => m.metadata.contentId))];
    const contents = await contentModel
      .find({ userId, contentId: { $in: contentIds } })
      .select("-embedding -vectorIds")
      .lean();

    // Build context from the top matching chunks
    const sortedMatches = matches
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, topK);

    const snippets = sortedMatches.map((m) => m.metadata?.text || "");

    const answer = await generateRagAnswer(query, snippets);

    return res.status(200).json({
      success: true,
      data: {
        query,
        answer,
        references: sortedMatches.map((m) => ({
          contentId: m.metadata?.contentId,
          score: m.score,
          chunkIndex: m.metadata?.chunkIndex,
        })),
        contents,
      },
    });
  } catch (error) {
    console.error("ragContent error", error);
    return res.status(500).json({
      success: false,
      message: "Unable to generate RAG response",
      error: error.message || "Internal server error",
    });
  }
};

export const resurfacingContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const days = Math.max(parseInt(req.query.days || "30", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "25", 10), 1),
      100,
    );

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const items = await contentModel
      .find({
        userId,
        updatedAt: { $lte: cutoff },
      })
      .sort({ updatedAt: 1, createdAt: 1 })
      .limit(limit)
      .select("-embedding -vectorIds")
      .lean();

    // Optional tag-level boosting: sort by tag count, then age
    const sorted = [...items].sort((a, b) => {
      const aTags = (a.tags || []).length;
      const bTags = (b.tags || []).length;
      if (bTags !== aTags) return bTags - aTags;
      return new Date(a.updatedAt) - new Date(b.updatedAt);
    });

    return res.status(200).json({
      success: true,
      data: {
        query: {
          days,
          limit,
        },
        items: sorted,
      },
    });
  } catch (error) {
    console.error("resurfacingContent error", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch resurfacing content",
      error: error.message || "Internal server error",
    });
  }
};

export const ingestFromExtension = async (req, res) => {
  try {
    // Reuse createContent with the same validation and structure.
    // This endpoint is designed for browser extension saves.
    return await createContent(req, res);
  } catch (error) {
    console.error("ingestFromExtension error", error);
    return res.status(500).json({
      success: false,
      message: "Unable to ingest content from extension",
      error: error.message || "Internal server error",
    });
  }
};

// PDF import endpoint (file upload through multipart/form-data).
// Reads text from PDF and stores in content.textChunks before vectorization.
export const importPdfContent = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required under `file` field",
      });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({
        success: false,
        message: "Uploaded file must be a PDF",
      });
    }

    const parsed = await pdf(req.file.buffer);
    const pdfText = parsed?.text?.trim() || "";

    const title = req.body.title || req.file.originalname || "Untitled PDF";
    const url = req.body.url || `uploaded://pdf/${crypto.randomUUID()}`;
    const normalizedUrl = buildNormalizedUrl(url);
    const fileHash = buildFileHash(req.file.buffer.toString("base64"));

    const exists = await contentModel.findOne({
      userId,
      $or: [{ normalizedUrl }, { fileHash }],
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Similar content already exists",
        data: { existingContentId: exists._id },
      });
    }

    const data = await contentModel.create({
      userId,
      title,
      url,
      normalizedUrl,
      fileHash,
      description: req.body.description || "",
      tags: Array.isArray(req.body.tags)
        ? req.body.tags
        : (req.body.tags || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
      category: req.body.category || "",
      subCategory: req.body.subCategory || "",
      type: "pdf",
      image: req.body.image || "",
      summary: req.body.summary || "",
      textChunks: pdfText ? [pdfText] : [],
      vectorReady: false,
      contentId: crypto.randomUUID(),
    });

    enqueueContentEnrichment(data._id).catch((err) =>
      console.error("enqueueContentEnrichment importPdfContent", err),
    );

    return res.status(201).json({
      success: true,
      message: "PDF content created and queued for enrichment",
      data,
    });
  } catch (error) {
    console.error("importPdfContent error", error);
    return res.status(500).json({
      success: false,
      message: "Unable to import PDF content",
      error: error.message || "Internal server error",
    });
  }
};

// YouTube import endpoint: fetch transcript via youtube-transcript, metadata by OG, create content, queue enrichment.
export const importYoutubeContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const url = req.body.url;

    if (!url || !url.trim()) {
      return res.status(400).json({
        success: false,
        message: "YouTube URL is required",
      });
    }

    let videoId = null;
    try {
      const parsedUrl = new URL(url);
      videoId = parsedUrl.searchParams.get("v");
      if (!videoId) {
        const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
        if (pathParts[0] === "shorts" && pathParts[1]) {
          videoId = pathParts[1];
        }
      }
    } catch (err) {
      // fallback regex extraction
      const match = url.match(/(?:v=|\/)([\w-]{11})/);
      videoId = match?.[1] || null;
    }

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: "Unable to parse YouTube video ID from URL",
      });
    }

    let transcriptText = "";
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      transcriptText = transcript.map((item) => item.text).join(" \n");
    } catch (err) {
      transcriptText = "";
    }

    const { error, result } = await ogs({ url });
    const title =
      req.body.title || result.ogTitle || `YouTube Video ${videoId}`;
    const description = req.body.description || result.ogDescription || "";
    const image = result.ogImage?.url || result.twitterImage?.url || "";

    const normalizedUrl = buildNormalizedUrl(url);
    const fileHash = buildFileHash(url + title + description);

    const exists = await contentModel.findOne({
      userId,
      $or: [{ normalizedUrl }, { fileHash }],
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Similar content already exists",
        data: { existingContentId: exists._id },
      });
    }

    const data = await contentModel.create({
      userId,
      title,
      url,
      normalizedUrl,
      fileHash,
      description,
      tags: Array.isArray(req.body.tags)
        ? req.body.tags
        : (req.body.tags || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
      category: req.body.category || "",
      subCategory: req.body.subCategory || "",
      type: "youtube",
      image,
      summary: req.body.summary || "",
      textChunks: transcriptText ? [transcriptText] : [],
      vectorReady: false,
      contentId: crypto.randomUUID(),
    });

    enqueueContentEnrichment(data._id).catch((err) =>
      console.error("enqueueContentEnrichment importYoutubeContent", err),
    );

    return res.status(201).json({
      success: true,
      message: "YouTube content created and queued for enrichment",
      data,
    });
  } catch (error) {
    console.error("importYoutubeContent error", error);
    return res.status(500).json({
      success: false,
      message: "Unable to import YouTube content",
      error: error.message || "Internal server error",
    });
  }
};

// Tweet import endpoint: fetch OG metadata + tweet text from OG description, create content, queue enrichment.
export const importTweetContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const url = req.body.url;

    if (!url || !url.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tweet URL is required",
      });
    }

    const { error, result } = await ogs({ url });
    const title = req.body.title || result.ogTitle || "Tweet";
    const description = req.body.description || result.ogDescription || "";
    const image = result.ogImage?.url || result.twitterImage?.url || "";
    const tweetText = description || result.twitterDescription || "";

    const normalizedUrl = buildNormalizedUrl(url);
    const fileHash = buildFileHash(url + title + description);

    const exists = await contentModel.findOne({
      userId,
      $or: [{ normalizedUrl }, { fileHash }],
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Similar content already exists",
        data: { existingContentId: exists._id },
      });
    }

    const data = await contentModel.create({
      userId,
      title,
      url,
      normalizedUrl,
      fileHash,
      description,
      tags: Array.isArray(req.body.tags)
        ? req.body.tags
        : (req.body.tags || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
      category: req.body.category || "",
      subCategory: req.body.subCategory || "",
      type: "tweet",
      image,
      summary: req.body.summary || "",
      textChunks: tweetText ? [tweetText] : [],
      vectorReady: false,
      contentId: crypto.randomUUID(),
    });

    enqueueContentEnrichment(data._id).catch((err) =>
      console.error("enqueueContentEnrichment importTweetContent", err),
    );

    return res.status(201).json({
      success: true,
      message: "Tweet content created and queued for enrichment",
      data,
    });
  } catch (error) {
    console.error("importTweetContent error", error);
    return res.status(500).json({
      success: false,
      message: "Unable to import Tweet content",
      error: error.message || "Internal server error",
    });
  }
};

// Image import endpoint: upload image, OCR text, store metadata, queue enrichment.
export const importImageContent = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required under `file` field",
      });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "Uploaded file must be an image",
      });
    }

    const fileBufferBase64 = req.file.buffer.toString("base64");
    const imageUpload = await imageKit.upload({
      file: fileBufferBase64,
      fileName: req.file.originalname || `image-${Date.now()}`,
    });

    const extractedText = await extractTextFromImage(req.file.buffer);

    const title = req.body.title || req.file.originalname || "Untitled Image";
    const url = req.body.url || `uploaded://image/${crypto.randomUUID()}`;
    const normalizedUrl = buildNormalizedUrl(url);
    const fileHash = buildFileHash(req.file.buffer.toString("base64"));

    const exists = await contentModel.findOne({
      userId,
      $or: [{ normalizedUrl }, { fileHash }],
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Similar content already exists",
        data: { existingContentId: exists._id },
      });
    }

    const data = await contentModel.create({
      userId,
      title,
      url,
      normalizedUrl,
      fileHash,
      description: req.body.description || "",
      tags: Array.isArray(req.body.tags)
        ? req.body.tags
        : (req.body.tags || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
      category: req.body.category || "",
      subCategory: req.body.subCategory || "",
      type: "image",
      image: imageUpload.url || "",
      fileStorageId: imageUpload.fileId || "",
      summary: req.body.summary || "",
      textChunks: extractedText ? [extractedText] : [],
      vectorReady: false,
      contentId: crypto.randomUUID(),
    });

    enqueueContentEnrichment(data._id).catch((err) =>
      console.error("enqueueContentEnrichment importImageContent", err),
    );

    return res.status(201).json({
      success: true,
      message: "Image content created and queued for enrichment",
      data,
    });
  } catch (error) {
    console.error("importImageContent error", error);
    return res.status(500).json({
      success: false,
      message: "Unable to import image content",
      error: error.message || "Internal server error",
    });
  }
};

// Manual re-enrich endpoint: triggers queue for existing content by id.
export const enrichExistingPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const item = await contentModel.findById(id);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Content item not found" });
    }

    ensureOwnership(item, userId);

    const queued = await enqueueContentEnrichment(item._id);
    if (!queued) {
      return res.status(200).json({
        success: true,
        message: "Enrichment already queued or in progress",
      });
    }

    return res.status(202).json({
      success: true,
      message: "Enrichment queued",
    });
  } catch (error) {
    console.error("enrichExistingPost error", error);
    if (error.statusCode === 403) {
      return res.status(403).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: "Unable to queue enrichment",
      error: error.message || "Internal server error",
    });
  }
};
