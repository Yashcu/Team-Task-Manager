import { z } from 'zod';

export const createProjectSchema = z.object({
    name: z.string().min(2).max(100).trim(),
    description: z.string().max(500).trim().optional(),
}).strict();

export const updateProjectSchema = z.object({
    name: z.string().min(2).max(100).trim().optional(),
    description: z.string().max(500).trim().nullable().optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
    message: 'At least one project field is required',
});

export const addMemberSchema = z.object({
    email: z.string().email().trim().toLowerCase(),
    role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
}).strict();
