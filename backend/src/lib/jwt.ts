import jwt from 'jsonwebtoken';

import { env } from './env.js';

const SECRET = env.JWT_SECRET;

export interface JwtPayload {
    userId: string;
    role: 'ADMIN' | 'MEMBER';
}

export const signToken = (payload: JwtPayload) =>
    jwt.sign(payload, SECRET, { expiresIn: '7d' });

export const verifyToken = (token: string) =>
    jwt.verify(token, SECRET) as JwtPayload;
