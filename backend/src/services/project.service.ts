import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';

export const createProject = async (
    userId: string,
    name: string,
    description?: string
) => {
    return prisma.$transaction(async (tx) => {
        const project = await tx.project.create({
            data: {
                name,
                description,
                ownerId: userId,
            },
        });

        await tx.projectMember.create({
            data: {
                projectId: project.id,
                userId,
                role: 'ADMIN',
            },
        });

        return project;
    });
};

export const getUserProjects = async (userId: string) => {
    const projects = await prisma.project.findMany({
        where: {
            members: {
                some: { userId },
            },
        },
        include: {
            members: {
                where: { userId },
                select: { role: true },
            },
        },
    });

    return projects.map((project) => ({
        ...project,
        role: project.members[0]?.role ?? null,
    }));
};

export const getProjectById = async (
    projectId: string,
    userId: string
) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
            },
        },
    });

    if (!project) throw new AppError('Project not found', 404);

    const currentMember = project.members.find(
        (m) => m.userId === userId
    );

    return {
        ...project,
        currentUserId: userId,
        currentUserRole: currentMember?.role || null,
    };
};

export const updateProject = async (
    projectId: string,
    data: {
        name?: string;
        description?: string | null;
    }
) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true },
    });

    if (!project) throw new AppError('Project not found', 404);

    return prisma.project.update({
        where: { id: projectId },
        data,
    });
};

export const deleteProject = async (projectId: string) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true },
    });

    if (!project) throw new AppError('Project not found', 404);

    await prisma.project.delete({
        where: { id: projectId },
    });
};

export const addMemberToProject = async (
    projectId: string,
    email: string,
    role: 'ADMIN' | 'MEMBER' = 'MEMBER'
) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('User not found', 404);

    try {
        return await prisma.projectMember.create({
            data: {
                projectId,
                userId: user.id,
                role,
            },
        });
    } catch {
        throw new AppError('User already in project', 400);
    }
};
