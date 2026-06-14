import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: "patient" | "specialist" | "admin";
            };
        }
    }
}

export const protect = async (req: Request, _res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError("Not authenticated", 401));
    }

    const token = authHeader.split(" ")[1];

    if (!token?.trim()) {
        return next(new AppError("Not logged in", 401));
    }

    try {
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error("JWT_SECRET is not defined");
        }

        const decoded = jwt.verify(token, secret) as {
            id: string;
            role: "patient" | "specialist" | "admin"
        };

        req.user = decoded;
        next();
    } catch {
        next(new AppError("Invalid token", 401));
    }
};

export const restrictTo = (...roles: ("patient" | "specialist" | "admin")[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError("You don't have permission", 403));
        }
        next();
    };
};