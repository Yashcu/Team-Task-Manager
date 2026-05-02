import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            error: 'Validation failed',
            details: result.error.issues.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
    }

    req.body = result.data;
    next();
};
