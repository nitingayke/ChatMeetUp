import { Router } from 'express';
import wrapAsync from '../utils/wrapAsync.js';
import { getTotalUserStatus } from '../controllers/statusController.js';

const router = Router();

router.get('/:statusType', wrapAsync(getTotalUserStatus));

export default router;