import { Request, Response } from 'express';
import {
    createProject,
    deleteProject,
    getUserProjects,
    getProjectById,
    addMemberToProject,
    updateProject,
} from '../services/project.service.js';
import { asyncHandler } from '../lib/errors.js';
import { getParam } from '../lib/request.js';

export const createProjectHandler = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { name, description } = req.body;

    const project = await createProject(userId, name, description);

    return res.status(201).json(project);
});

export const getProjectsHandler = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const projects = await getUserProjects(userId);

    return res.json(projects);
});

export const getProjectHandler = asyncHandler(async (req: Request, res: Response) => {
    const projectId = getParam(req, 'projectId');
    const userId = req.user!.userId;
    const project = await getProjectById(projectId, userId);
    return res.json(project);
});

export const addMemberHandler = asyncHandler(async (req: Request, res: Response) => {
    const projectId = getParam(req, 'projectId');
    const { email, role } = req.body;

    const member = await addMemberToProject(projectId, email, role);

    return res.status(201).json(member);
});

export const updateProjectHandler = asyncHandler(async (req: Request, res: Response) => {
    const projectId = getParam(req, 'projectId');

    const project = await updateProject(projectId, req.body);

    return res.json(project);
});

export const deleteProjectHandler = asyncHandler(async (req: Request, res: Response) => {
    const projectId = getParam(req, 'projectId');

    await deleteProject(projectId);

    return res.status(204).send();
});
