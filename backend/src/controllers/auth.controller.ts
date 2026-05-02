import { Request, Response } from 'express';
import { signToken } from '../lib/jwt.js';
import { findUserByEmail, findUserById, createUser, validatePassword } from '../services/auth.service.js';
import { setAuthCookie, clearAuthCookie } from '../lib/cookie.js';

export const signup = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    const existing = await findUserByEmail(email);
    if (existing) {
        return res.status(409).json({ error: 'Email already exists' });
    }

    const user = await createUser(name, email, password);

    const token = signToken({
        userId: user.id,
        role: user.role,
    });

    setAuthCookie(res, token);

    return res.status(201).json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await validatePassword(password, user.passwordHash);
    if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({
        userId: user.id,
        role: user.role,
    });

    setAuthCookie(res, token);

    return res.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};

export const getMe = async (req: Request, res: Response) => {
    const user = await findUserById(req.user!.userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    });
};

export const logout = (_req: Request, res: Response) => {
    clearAuthCookie(res);
    return res.json({ message: 'Logged out' });
};
