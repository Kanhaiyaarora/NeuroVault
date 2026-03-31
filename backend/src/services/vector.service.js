import { pineconeIndex } from "../config/pinecone.js";

// Persist one content's embedding chunks to Pinecone vector index.
export const upsertVectors = async ({
  contentId,
  userId,
  chunks,
  embeddings,
}) => {
  if (
    !Array.isArray(chunks) ||
    !Array.isArray(embeddings) ||
    chunks.length !== embeddings.length
  ) {
    throw new Error("Chunks and embeddings must be arrays of equal length");
  }

  const vectors = chunks.map((chunk, i) => ({
    id: `${contentId}-${i}`,
    values: embeddings[i],
    metadata: {
      userId: userId.toString(),
      contentId,
      chunkIndex: i,
      text: chunk,
    },
  }));

  const response = await pineconeIndex.upsert({ vectors });
  return response;
};

// Query Pinecone to find top K nearest vectors for the user.
export const querySimilarVectors = async ({ userId, vector, topK = 10 }) => {
  const queryReq = {
    vector,
    topK,
    includeMetadata: true,
    filter: {
      userId: userId.toString(),
    },
  };

  const result = await pineconeIndex.query({ queryRequest: queryReq });
  return result.matches || [];
};
