import { createApp } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { logger } from "./utils/logger";

async function bootstrap() {
  await connectDB();

  // Ensure existing staff and pre-existing active users are safely handled without lockout
  try {
    const { User } = await import("./models/User");
    await User.updateMany({ isEmailVerified: { $exists: false } }, { $set: { isEmailVerified: true } });
    await User.updateMany({ role: { $ne: "customer" }, isEmailVerified: false }, { $set: { isEmailVerified: true } });
  } catch (migErr) {
    logger.warn("Initial user verification migration check skipped:", migErr);
  }

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`Fire Safety API listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  // Initialize Phase 4 Automated Cron Reminder Engine
  const { initializeReminderCron } = await import("./jobs/reminder.cron");
  initializeReminderCron();

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection", reason);
  });

  process.on("SIGTERM", () => {
    logger.info("SIGTERM received, shutting down gracefully");
    server.close(() => process.exit(0));
  });
}

bootstrap();
