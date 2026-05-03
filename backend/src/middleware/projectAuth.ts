import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { getParam } from '../lib/request.js';

export const requireProjectMember = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.userId;
        const projectId = getParam(req, 'projectId');

        const member = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
        });

        if (!member) throw new AppError('Access denied', 403);

        req.projectRole = member.role as 'ADMIN' | 'MEMBER';

        next();
    } catch (err) {
        next(err);
    }
};

export const requireProjectAdmin = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    const role = req.projectRole;

    if (!role) {
        throw new AppError('Project role is missing', 500);
    }

    if (role !== 'ADMIN') {
        throw new AppError('Admin role required', 403);
    }

    next();
};
