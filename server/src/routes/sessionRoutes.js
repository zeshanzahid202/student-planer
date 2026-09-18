import express from 'express';
import { getSessions, createSession, deleteSession } from '../controllers/sessionController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getSessions);
router.post('/', createSession);
router.delete('/:id', deleteSession);

export default router;
