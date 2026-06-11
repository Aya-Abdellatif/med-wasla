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

export const protect = (req: Request, res: Response, next: NextFunction) => {

    const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"

    if (!token) {
        return next(new AppError("Not logged in", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
            role: "patient" | "specialist" | "admin";
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