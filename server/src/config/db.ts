import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    logger.error("MongoDB connection failed", err);
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => logger.error("MongoDB runtime error", err));
  mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
