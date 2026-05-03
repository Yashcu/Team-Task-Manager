import { Router } from 'express';
import {
    createProjectHandler,
    deleteProjectHandler,
    getProjectsHandler,
    getProjectHandler,
    addMemberHandler,
    updateProjectHandler,
} from '../controllers/project.controller.js';

import {
    createTaskHandler,
    deleteTaskHandler,
    getTasksHandler,
    updateTaskHandler,
} from '../controllers/task.controller.js';

import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

import {
    createProjectSchema,
    addMemberSchema,
    updateProjectSchema,
} from '../schemas/project.schema.js';

import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema.js';

import {
    requireProjectMember,
    requireProjectAdmin,
} from '../middleware/projectAuth.js';

const router = Router();

// CREATE PROJECT
router.post(
    '/',
    authenticate,
    validate(createProjectSchema),
    createProjectHandler
);

// GET ALL PROJECTS
router.get(
    '/',
    authenticate,
    getProjectsHandler
);

// GET SINGLE PROJECT
router.get(
    '/:projectId',
    authenticate,
    requireProjectMember,
    getProjectHandler
);

// UPDATE PROJECT (ADMIN)
router.patch(
    '/:projectId',
    authenticate,
    requireProjectMember,
    requireProjectAdmin,
    validate(updateProjectSchema),
    updateProjectHandler
);

// DELETE PROJECT (ADMIN)
router.delete(
    '/:projectId',
    authenticate,
    requireProjectMember,
    requireProjectAdmin,
    deleteProjectHandler
);

// ADD MEMBER
router.post(
    '/:projectId/members',
    authenticate,
    requireProjectMember,
    requireProjectAdmin,
    validate(addMemberSchema),
    addMemberHandler
);

// GET TASKS (PROJECT SCOPED)
router.get(
    '/:projectId/tasks',
    authenticate,
    requireProjectMember,
    getTasksHandler
);

// CREATE TASK (ADMIN)
router.post(
    '/:projectId/tasks',
    authenticate,
    requireProjectMember,
    requireProjectAdmin,
    validate(createTaskSchema),
    createTaskHandler
);

// UPDATE TASK DETAILS (ADMIN)
router.patch(
    '/:projectId/tasks/:taskId',
    authenticate,
    requireProjectMember,
    requireProjectAdmin,
    validate(updateTaskSchema),
    updateTaskHandler
);

// DELETE TASK (ADMIN)
router.delete(
    '/:projectId/tasks/:taskId',
    authenticate,
    requireProjectMember,
    requireProjectAdmin,
    deleteTaskHandler
);

export default router;
