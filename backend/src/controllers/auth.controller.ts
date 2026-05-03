import { Request, Response, NextFunction } from 'express';
import { signToken, setAuthCookie, clearAuthCookie } from '../lib/jwt.js';
import {
    findUserByEmail,
    findUserById,
    createUser,
    validatePassword,
} from '../services/auth.service.js';
import { AppError, asyncHandler } from '../lib/errors.js';

export const signup = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    const existing = await findUserByEmail(email);
    if (existing) throw new AppError('Email already exists', 409);

    const user = await createUser(name, email, password);

    const token = signToken({ userId: user.id });
    setAuthCookie(res, token);

    return res.status(201).json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const user = await findUserByEmail(email);
        if (!user) throw new AppError('Invalid credentials', 401);

        const isValid = await validatePassword(password, user.passwordHash);
        if (!isValid) throw new AppError('Invalid credentials', 401);

        const token = signToken({ userId: user.id });
        setAuthCookie(res, token);

        return res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
        const user = await findUserById(req.user!.userId);
        if (!user) throw new AppError('User not found', 404);

        return res.json({
            id: user.id,
            name: user.name,
            email: user.email,
        });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
        clearAuthCookie(res);
        return res.json({ message: 'Logged out' });
});