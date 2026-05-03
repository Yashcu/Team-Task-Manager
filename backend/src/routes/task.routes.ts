import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

import {
    updateTaskStatusHandler,
    getMyTasksHandler
} from '../controllers/task.controller.js';

import {
    updateTaskStatusSchema,
} from '../schemas/task.schema.js';

const router = Router();

// GET MY TASKS
router.get(
    '/me',
    authenticate,
    getMyTasksHandler
);

// UPDATE STATUS
router.patch(
    '/:taskId/status',
    authenticate,
    validate(updateTaskStatusSchema),
    updateTaskStatusHandler
);

export default router;