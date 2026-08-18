import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { supplierRepository } from "./repositories/supplier.repository.js";
import { SupplierController } from "./controllers/supplier.controller.js";
import { SupplierService } from "./services/supplier.service.js";

const supplierService = new SupplierService(supplierRepository);
const supplierController = new SupplierController(supplierService);
const app = createApp(supplierController);

app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});
