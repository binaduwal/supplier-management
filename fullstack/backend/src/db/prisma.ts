import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client.js";
import { env } from "../config/env.js";

function sqlitePath(databaseUrl: string): string {
  return databaseUrl.replace(/^file:/, "");
}

const adapter = new PrismaBetterSqlite3({
  url: sqlitePath(env.databaseUrl),
});

export const prisma = new PrismaClient({ adapter });
