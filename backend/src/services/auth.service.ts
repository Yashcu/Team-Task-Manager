import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';

export const findUserByEmail = (email: string) =>
    prisma.user.findUnique({ where: { email } });

export const findUserById = (id: string) =>
    prisma.user.findUnique({ where: { id } });

export const createUser = async (
    name: string,
    email: string,
    password: string
) => {
    const passwordHash = await bcrypt.hash(password, 10);

    return prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
        },
    });
};

export const validatePassword = (password: string, hash: string) =>
    bcrypt.compare(password, hash);
