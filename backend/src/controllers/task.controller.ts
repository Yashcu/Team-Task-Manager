import { Request, Response } from 'express';
import {
    createTask,
    deleteTask,
    getMyTasks,
    getTasks,
    updateTask,
    updateTaskStatus,
} from '../services/task.service.js';
import { AppError, asyncHandler } from '../lib/errors.js';
import { getParam } from '../lib/request.js';
import type { TaskStatus } from '@prisma/client';

const taskStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const;

const getStatusFilter = (value: unknown): TaskStatus | TaskStatus[] | undefined => {
    const raw = Array.isArray(value) ? value.join(',') : value;

    if (raw === undefined || raw === '') return undefined;

    if (typeof raw !== 'string') {
        throw new AppError('Invalid task status filter', 400);
    }

    const statuses = raw.split(',').map((status) => status.trim()).filter(Boolean);

    if (statuses.some((status) => !taskStatuses.includes(status as TaskStatus))) {
        throw new AppError('Invalid task status filter', 400);
    }

    return statuses.length === 1 ? statuses[0] as TaskStatus : statuses as TaskStatus[];
};

export const createTaskHandler = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const projectId = getParam(req, 'projectId');

    const task = await createTask(projectId, userId, req.body);

    return res.status(201).json(task);
});

export const getTasksHandler = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const projectId = getParam(req, 'projectId');

    const role = req.projectRole!;
    const status = getStatusFilter(req.query.status);

    const tasks = await getTasks(projectId, userId, role, status);

    return res.json(tasks);
});

export const updateTaskStatusHandler = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const taskId = getParam(req, 'taskId');
    const { status } = req.body;

    const task = await updateTaskStatus(taskId, userId, status);

    return res.json(task);
});

export const getMyTasksHandler = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const status = getStatusFilter(req.query.status);
    const tasks = await getMyTasks(userId, status);
    return res.json(tasks);
});

export const updateTaskHandler = asyncHandler(async (req: Request, res: Response) => {
    const projectId = getParam(req, 'projectId');
    const taskId = getParam(req, 'taskId');

    const task = await updateTask(projectId, taskId, req.body);

    return res.json(task);
});

export const deleteTaskHandler = asyncHandler(async (req: Request, res: Response) => {
    const projectId = getParam(req, 'projectId');
    const taskId = getParam(req, 'taskId');

    await deleteTask(projectId, taskId);

    return res.status(204).send();
});
