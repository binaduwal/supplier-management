import { Router } from "express";
import type { SupplierController } from "../controllers/supplier.controller.js";
import { currentUser } from "../middleware/currentUser.js";

export function createSupplierRouter(controller: SupplierController): Router {
  const router = Router();

  router.use(currentUser);
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.post("/", controller.create);
  router.post("/:id/submit", controller.submit);
  router.post("/:id/approve", controller.approve);
  router.post("/:id/reject", controller.reject);

  return router;
}
