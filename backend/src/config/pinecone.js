import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENV || "us-west1-gcp",
});

export const pineconeIndex = pc.index("neuro-vault");
