import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import type { SupplierController } from "./controllers/supplier.controller.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { createSupplierRouter } from "./routes/supplier.routes.js";

export function createApp(controller: SupplierController) {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    }),
  );
  app.use(express.json());

  if (env.nodeEnv !== "test") {
    app.use(morgan("dev"));
  }

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ data: { status: "ok" } });
  });

  app.use("/api/suppliers", createSupplierRouter(controller));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
