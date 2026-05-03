import { RequestHandler } from "express";

export const asyncHandler =
    (fn: RequestHandler): RequestHandler =>
        (req, res, next) =>
            Promise.resolve(fn(req, res, next)).catch(next);

export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 500) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}