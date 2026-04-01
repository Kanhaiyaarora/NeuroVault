import ImageKit from "@imagekit/nodejs";
import { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } from "./env.js";

if (!IMAGEKIT_PUBLIC_KEY)
  throw new Error("IMAGEKIT_PUBLIC_KEY is missing in .env");
if (!IMAGEKIT_PRIVATE_KEY)
  throw new Error("IMAGEKIT_PRIVATE_KEY is missing in .env");
if (!IMAGEKIT_URL_ENDPOINT)
  throw new Error("IMAGEKIT_URL_ENDPOINT is missing in .env");

export const imageKit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});
