import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt.js';
import { AppError } from '../lib/errors.js';

export const authenticate = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies?.token;

        if (!token) throw new AppError('Unauthorized', 401);

        req.user = verifyToken(token);

        next();
    } catch (err) {
        next(err);
    }
};