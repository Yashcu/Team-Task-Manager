import { Response } from 'express';
import { env } from './env.js';

export const setAuthCookie = (res: Response, token: string) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

export const clearAuthCookie = (res: Response) => {
    res.clearCookie('token', {
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
};
