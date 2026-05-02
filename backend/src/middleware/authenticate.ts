import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt.js';

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        req.user = verifyToken(token);
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
