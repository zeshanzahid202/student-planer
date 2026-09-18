import express from 'express';
import { generatePlan, getCurrentPlan, updateSessionStatus } from '../controllers/plannerController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/generate', generatePlan);
router.get('/current', getCurrentPlan);
router.post('/session-status', updateSessionStatus);

export default router;
