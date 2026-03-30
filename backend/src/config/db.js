import mongoose from "mongoose";
import { MONGO_URI } from "./env.js";

export const connectToDb = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Mongodb connected. ✅");
  } catch (error) {
    console.error("MongoDb connection failed", error);
  }
};
