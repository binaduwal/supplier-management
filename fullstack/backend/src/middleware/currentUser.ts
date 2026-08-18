import type { NextFunction, Request, Response } from "express";
import { isKnownUserId } from "../constants/users.js";
import { AppError, ErrorCode } from "../errors/AppError.js";

export function currentUser(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("x-user-id")?.trim().toLowerCase();

  if (!header) {
    next(
      new AppError(
        ErrorCode.MISSING_USER,
        "X-User-Id header is required.",
        400,
      ),
    );
    return;
  }

  if (!isKnownUserId(header)) {
    next(
      new AppError(
        ErrorCode.UNKNOWN_USER,
        "Unknown user. Use X-User-Id: anna or X-User-Id: max.",
        400,
      ),
    );
    return;
  }

  req.userId = header;
  next();
}
