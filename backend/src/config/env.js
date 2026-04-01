import dotenv from "dotenv";
dotenv.config();

// validation
if (!process.env.PORT) throw new Error("PORT is missing in .env");
if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing in .env");
if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing in .env");
if (!process.env.MISTRAL_API_KEY)
  throw new Error("MISTRAL_API_KEY is missing in .env");
if (!process.env.NODE_ENV) throw new Error("NODE_ENV is missing in .env");
if (!process.env.PINECONE_API_KEY)
  throw new Error("PINECONE_API_KEY is missing in .env");
if (!process.env.IMAGEKIT_PUBLIC_KEY)
  throw new Error("IMAGEKIT_PUBLIC_KEY is missing in .env");
if (!process.env.IMAGEKIT_PRIVATE_KEY)
  throw new Error("IMAGEKIT_PRIVATE_KEY is missing in .env");
if (!process.env.IMAGEKIT_URL_ENDPOINT)
  throw new Error("IMAGEKIT_URL_ENDPOINT is missing in .env");

export const PORT = process.env.PORT || 3000;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
export const NODE_ENV = process.env.NODE_ENV;
export const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
export const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
export const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
export const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;
