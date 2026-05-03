import { Request, Response, NextFunction } from 'express';
import { signToken } from '../lib/jwt.js';
import {
    findUserByEmail,
    findUserById,
    createUser,
    validatePassword,
} from '../services/auth.service.js';
import { setAuthCookie, clearAuthCookie } from '../lib/cookie.js';
import { AppError } from '../lib/errors.js';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
    } catch (err) {
        next(err);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
    } catch (err) {
        next(err);
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await findUserById(req.user!.userId);
        if (!user) throw new AppError('User not found', 404);

        return res.json({
            id: user.id,
            name: user.name,
            email: user.email,
        });
    } catch (err) {
        next(err);
    }
};

export const logout = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        clearAuthCookie(res);
        return res.json({ message: 'Logged out' });
    } catch (err) {
        next(err);
    }
};