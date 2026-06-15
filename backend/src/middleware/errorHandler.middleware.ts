import type { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";

type MongoError = {
  code?: number;
};

const isMongoDuplicateKeyError = (err: unknown): err is MongoError => {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as MongoError).code === 11000
  );
};

const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  // Duplicate key error (MongoDB)
  if ((isMongoDuplicateKeyError(err))) {
    res.status(400).json({ status: "error", message: "Email already in use" });
    return;
  }

  // server error
  console.error("Unexpected error:", err);
  res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

export default errorHandler;