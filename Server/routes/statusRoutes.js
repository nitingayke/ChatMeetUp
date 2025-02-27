import { Router } from 'express';
import wrapAsync from '../utils/wrapAsync.js';
import { upload } from '../utils/cloudinaryConfig.js'
import { getTotalUserStatus, uploadNewStatus } from '../controllers/statusController.js';

const router = Router();

router.get('/:statusType', wrapAsync(getTotalUserStatus));

router.post('/upload', upload.single("file") ,wrapAsync(uploadNewStatus));

export default router;