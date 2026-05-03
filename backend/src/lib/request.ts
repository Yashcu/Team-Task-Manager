import { Request } from 'express';
import { AppError } from './errors.js';

export const getParam = (req: Request, name: string): string => {
    const value = req.params[name];

    if (!value || Array.isArray(value)) {
        throw new AppError(`Missing route parameter: ${name}`, 400);
    }
    
    return value;
};
