// Minimal structured logger. Swap for pino/winston later without touching call sites.
type Level = "info" | "warn" | "error" | "debug";

function line(level: Level, message: string, meta?: unknown) {
  const entry = { level, message, meta, timestamp: new Date().toISOString() };
  const serialized = meta !== undefined ? `${message} ${JSON.stringify(meta)}` : message;
  if (level === "error") console.error(`[${entry.timestamp}] ERROR ${serialized}`);
  else if (level === "warn") console.warn(`[${entry.timestamp}] WARN ${serialized}`);
  else console.log(`[${entry.timestamp}] ${level.toUpperCase()} ${serialized}`);
}

export const logger = {
  info: (msg: string, meta?: unknown) => line("info", msg, meta),
  warn: (msg: string, meta?: unknown) => line("warn", msg, meta),
  error: (msg: string, meta?: unknown) => line("error", msg, meta),
  debug: (msg: string, meta?: unknown) => line("debug", msg, meta),
};
