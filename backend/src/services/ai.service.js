import { MistralAIEmbeddings, ChatMistralAI } from "@langchain/mistralai";

const embeddingClient = new MistralAIEmbeddings({
  apiKey: process.env.MISTRAL_API_KEY,
  model: "mistral-embed",
});

const llmClient = new ChatMistralAI({
  apiKey: process.env.MISTRAL_API_KEY,
  model: "mistral-large",
});

// Return embeddings for array of text chunks via Mistral embeddings model.
export const getEmbeddings = async (textArray) => {
  if (!Array.isArray(textArray) || textArray.length === 0) return [];
  const cleanArray = textArray.filter(
    (item) => typeof item === "string" && item.trim(),
  );
  if (cleanArray.length === 0) return [];
  return embeddingClient.embedDocuments(cleanArray);
};

// Generate a short summary of full text content using Mistral (LLM).
export const getSummary = async (text) => {
  if (!text || !text.trim()) return "";

  const prompt = `Summarize the following content in 2-3 sentences, highlighting key ideas.\n\n${text}`;

  const response = await llmClient.generate([
    { role: "user", content: prompt },
  ]);
  const content = response.generations?.[0]?.[0]?.text;

  if (!content) {
    throw new Error("Mistral summary generation returned empty response");
  }

  return content.trim();
};

// Build a RAG-style answer from user query + extracted context snippets.
export const generateRagAnswer = async (query, snippets = []) => {
  if (!query || !query.trim()) {
    throw new Error("RAG query text is required");
  }

  const context = snippets.filter(Boolean).slice(0, 8).join("\n\n");
  const prompt = `Answer the user query using only the provided context and without making up facts.\n\nContext:\n${context}\n\nQuestion:\n${query}\n\nAnswer:`;

  const response = await llmClient.generate([
    { role: "user", content: prompt },
  ]);

  const answer = response.generations?.[0]?.[0]?.text;

  if (!answer) {
    throw new Error("Mistral RAG generation returned empty response");
  }

  return answer.trim();
};
