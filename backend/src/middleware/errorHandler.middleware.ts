import type { Request, Response, NextFunction } from "express";
import type { Error as MongooseError } from "mongoose";
import AppError from "../utils/AppError.js";

type MongoDuplicateError = {
  code?: number;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
};

const isMongoDuplicateKeyError = (err: unknown): err is MongoDuplicateError => {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as MongoDuplicateError).code === 11000
  );
};

const getMongooseValidationMessage = (err: MongooseError.ValidationError): string => {
  const messages = Object.values(err.errors).map((item) => item.message);
  return messages.join(". ") || err.message;
};

const getDuplicateKeyMessage = (err: MongoDuplicateError): string => {
  const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : undefined;

  if (field === "email") return "This email is already registered";
  if (field === "licenseNumber") return "This license number is already registered";
  return "A record with this information already exists";
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

  if (err.name === "ValidationError") {
    res.status(400).json({
      status: "error",
      message: getMongooseValidationMessage(err as MongooseError.ValidationError),
    });
    return;
  }

  if (isMongoDuplicateKeyError(err)) {
    res.status(400).json({
      status: "error",
      message: getDuplicateKeyMessage(err),
    });
    return;
  }

  console.error("Unexpected error:", err);

  const isDev = process.env.NODE_ENV !== "production";
  res.status(500).json({
    status: "error",
    message: isDev && err.message
      ? err.message
      : "Something went wrong. Please try again.",
  });
};

export default errorHandler;
