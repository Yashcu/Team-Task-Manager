import { Request } from 'express';
import { AppError } from '../lib/errors.js';

export const getUserId = (req: Request) => {
    if (!req.user?.userId) {
        throw new AppError('Unauthorized', 401);
    }
    return req.user.userId;
};