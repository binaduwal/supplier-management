import type { NextFunction, Request, Response } from "express";
import { AppError, ErrorCode } from "../errors/AppError.js";
import { SupplierService } from "../services/supplier.service.js";
import {
  createSupplierSchema,
  rejectSupplierSchema,
} from "../validation/supplier.schemas.js";

export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.supplierService.list();
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.supplierService.getById(req.params.id as string);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createSupplierSchema.parse(req.body);
      const data = await this.supplierService.create(input, req.userId);
      res.status(201).json({ data });
    } catch (error) {
      next(error);
    }
  };

  submit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.supplierService.submit(req.params.id as string);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  approve = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.supplierService.approve(
        req.params.id as string,
        req.userId,
      );
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  reject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = rejectSupplierSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(
          ErrorCode.REJECTION_REASON_REQUIRED,
          "A rejection reason is required.",
          400,
        );
      }

      const data = await this.supplierService.reject(
        req.params.id as string,
        parsed.data.reason,
        req.userId,
      );
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };
}
