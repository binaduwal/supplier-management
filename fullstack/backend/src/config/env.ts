import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 3001,
  databaseUrl: process.env.DATABASE_URL ?? "file:./dev.db",
  nodeEnv: process.env.NODE_ENV ?? "development",
};
