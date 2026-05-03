import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import type { Prisma, TaskStatus } from '@prisma/client';

type StatusFilter = TaskStatus | TaskStatus[];

const forwardStatus: Record<TaskStatus, TaskStatus | null> = {
    PENDING: 'IN_PROGRESS',
    IN_PROGRESS: 'COMPLETED',
    COMPLETED: null,
};

const applyStatusFilter = (
    where: Prisma.TaskWhereInput,
    status?: StatusFilter
) => {
    if (!status) return;

    where.status = Array.isArray(status) ? { in: status } : status;
};

// CREATE TASK (ADMIN)
export const createTask = async (
    projectId: string,
    userId: string,
    data: {
        title: string;
        description?: string;
        assigneeId?: string;
        priority?: 'LOW' | 'MEDIUM' | 'HIGH';
        dueDate?: Date;
    }
) => {
    // ensure assignee is part of project
    if (data.assigneeId) {
        const member = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId: data.assigneeId,
                },
            },
        });

        if (!member) throw new AppError('Assignee not in project', 400);
    }

    return prisma.task.create({
        data: {
            title: data.title,
            description: data.description,
            projectId,
            assigneeId: data.assigneeId,
            createdById: userId,
            priority: data.priority,
            dueDate: data.dueDate,
        },
    });
};

// GET TASKS (ROLE AWARE)
export const getTasks = async (
    projectId: string,
    userId: string,
    role: 'ADMIN' | 'MEMBER',
    status?: StatusFilter
) => {
    const include = {
        assignee: {
            select: { id: true, name: true },
        },
    };

    const where: Prisma.TaskWhereInput = role === 'ADMIN'
        ? { projectId }
        : { projectId, assigneeId: userId };

    applyStatusFilter(where, status);

    const onlyCompleted = status === 'COMPLETED';
    const orderBy: Prisma.TaskOrderByWithRelationInput[] = onlyCompleted
        ? [{ updatedAt: 'desc' }]
        : [{ dueDate: 'asc' }, { createdAt: 'desc' }];

    return prisma.task.findMany({
        where,
        orderBy,
        include,
    });
};

// UPDATE STATUS (ASSIGNEE ONLY)
export const updateTaskStatus = async (
    taskId: string,
    userId: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { id: true, assigneeId: true, projectId: true, status: true },
    });

    if (!task) throw new AppError('Task not found', 404);

    const nextStatus = forwardStatus[task.status];

    if (!nextStatus) throw new AppError('Completed tasks cannot change status', 400);

    if (status !== nextStatus) {
        throw new AppError(`Task status can only move from ${task.status} to ${nextStatus}`, 400);
    }

    const membership = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId: task.projectId,
                userId,
            },
        },
    });

    if (!membership) {
        throw new AppError('Not a project member', 403);
    }

    if (task.assigneeId !== userId) {
        throw new AppError('Only the assigned user can change task status', 403);
    }

    return prisma.task.update({
        where: { id: taskId },
        data: { status },
    });
};

// UPDATE TASK DETAILS (ADMIN)
export const updateTask = async (
    projectId: string,
    taskId: string,
    data: {
        title?: string;
        description?: string | null;
        dueDate?: Date | null;
    }
) => {
    const task = await prisma.task.findFirst({
        where: { id: taskId, projectId },
        select: { id: true, status: true },
    });

    if (!task) throw new AppError('Task not found', 404);

    if (task.status === 'COMPLETED') {
        throw new AppError('Completed tasks cannot be updated', 400);
    }

    return prisma.task.update({
        where: { id: taskId },
        data,
    });
};

// DELETE TASK (ADMIN)
export const deleteTask = async (projectId: string, taskId: string) => {
    const task = await prisma.task.findFirst({
        where: { id: taskId, projectId },
        select: { id: true, status: true },
    });

    if (!task) throw new AppError('Task not found', 404);

    if (task.status === 'COMPLETED') {
        throw new AppError('Completed tasks cannot be deleted', 400);
    }

    await prisma.task.delete({
        where: { id: taskId },
    });
};

// GET MY TASKS (GLOBAL)
export const getMyTasks = async (
    userId: string,
    status?: StatusFilter
) => {
    const where: Prisma.TaskWhereInput = { assigneeId: userId };

    applyStatusFilter(where, status);

    const onlyCompleted = status === 'COMPLETED';
    const orderBy: Prisma.TaskOrderByWithRelationInput[] = onlyCompleted
        ? [{ updatedAt: 'desc' }]
        : [{ dueDate: 'asc' }, { createdAt: 'desc' }];

    return prisma.task.findMany({
        where,
        orderBy,
        include: {
            project: { select: { id: true, name: true } },
            assignee: { select: { id: true, name: true } },
        },
    });
};
