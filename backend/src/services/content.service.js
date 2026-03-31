import contentModel from "../models/content.model.js";
import { getEmbeddings, getSummary } from "./ai.service.js";
import { upsertVectors } from "./vector.service.js";
import { splitTextToChunks } from "./text.service.js";

// Service function that handles core enrichment pipeline for a content document.
// 1) text assembly, 2) chunk splitting, 3) embeddings generation, 4) summary generation, 5) Pinecone upsert, 6) Mongo update.
export const enrichContentAsync = async (content) => {
  try {
    const textCorpus = [
      content.title,
      content.description,
      content.summary,
      ...(content.textChunks || []),
    ]
      .filter(Boolean)
      .join("\n\n");

    let textToProcess = textCorpus;

    if (!textToProcess) {
      return;
    }

    const chunks = await splitTextToChunks(textToProcess);
    const embeddings = await getEmbeddings(chunks);

    if (!embeddings || embeddings.length === 0) {
      return;
    }

    const calculatedSummary = await getSummary(textToProcess);

    await upsertVectors({
      contentId: content.contentId,
      userId: content.userId,
      chunks,
      embeddings,
    });

    await contentModel.findByIdAndUpdate(content._id, {
      textChunks: chunks,
      embedding: embeddings[0] || [],
      summary: calculatedSummary || content.summary,
      vectorReady: true,
      vectorIds: chunks.map((_, idx) => `${content.contentId}-${idx}`),
    });

    return true;
  } catch (error) {
    console.error("enrichContentAsync error", error);
    return false;
  }
};
