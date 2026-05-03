import { z } from 'zod';

export const createTaskSchema = z.object({
    title: z.string().min(2).max(100).trim(),
    description: z.string().max(500).trim().optional(),
    assigneeId: z.uuid().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    dueDate: z.coerce.date().optional(),
}).strict();

export const updateTaskStatusSchema = z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
}).strict();

export const updateTaskSchema = z.object({
    title: z.string().min(2).max(100).trim().optional(),
    description: z.string().max(500).trim().nullable().optional(),
    dueDate: z.coerce.date().nullable().optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
    message: 'At least one task field is required',
});
