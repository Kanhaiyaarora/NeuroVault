import crypto from "crypto";
import contentModel from "../models/content.model.js";
import { enrichContentAsync } from "../services/content.service.js";

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

    // async enrichment pipeline: summary + embedding + pinecone.
    setImmediate(() => {
      enrichContentAsync(data).catch((err) => console.error(err));
    });

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

    setImmediate(() => {
      enrichContentAsync(item).catch((err) => console.error(err));
    });

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
      return res.status(501).json({
        success: false,
        message: "Semantic search is not implemented yet",
      });
    }

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
