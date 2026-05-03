import { Response } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'secretkey';

export interface JwtPayload {
    userId: string;
}

export const signToken = (payload: JwtPayload) =>
    jwt.sign(payload, SECRET, { expiresIn: '7d' });

export const verifyToken = (token: string) =>
    jwt.verify(token, SECRET) as JwtPayload;

export const setAuthCookie = (res: Response, token: string) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

export const clearAuthCookie = (res: Response) => {
    res.clearCookie('token', {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
};