// Centralized, validated environment configuration.
// Fails fast and loudly at boot if a required variable is missing —
// far better than a mysterious runtime crash three requests later.
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("5000"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  JWT_SECRET: z.string().min(10, "JWT_SECRET must be set to a long random string"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z.string().min(10, "JWT_REFRESH_SECRET must be set to a long random string"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  CLIENT_URL: z.string().default("http://localhost:5173"),
  ADMIN_URL: z.string().default("http://localhost:5174"),

  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),

  EMAIL_MODE: z.enum(["development", "smtp"]).default("development"),
  EMAIL_HOST: z.string().optional().default(""),
  EMAIL_PORT: z.string().optional().default("587"),
  EMAIL_USER: z.string().optional().default(""),
  EMAIL_PASSWORD: z.string().optional().default(""),
  EMAIL_FROM: z.string().default("AK Fire Safety <no-reply@akfiresafety.example>"),

  PAYMENT_MODE: z.enum(["mock", "razorpay"]).default("mock"),
  RAZORPAY_KEY_ID: z.string().optional().default(""),
  RAZORPAY_KEY_SECRET: z.string().optional().default(""),

  SMS_MODE: z.enum(["mock", "live"]).default("mock"),
  SMS_API_KEY: z.string().optional().default(""),
  WHATSAPP_MODE: z.enum(["mock", "live"]).default("mock"),
  WHATSAPP_API_KEY: z.string().optional().default(""),

  REFILL_REMINDER_CRON: z.string().default("0 9 * * *"),
  AMC_REMINDER_CRON: z.string().default("0 9 * * *"),
  ABANDONED_CART_CRON: z.string().default("0 11 * * *"),
  LOW_STOCK_CRON: z.string().default("0 8 * * *"),

  SEED_ADMIN_EMAIL: z.string().email().default("admin@akfiresafety.example"),
  SEED_ADMIN_PASSWORD: z.string().default("ChangeMe123!"),
  SEED_ADMIN_NAME: z.string().default("Platform Admin"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
