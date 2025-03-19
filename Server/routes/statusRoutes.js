import { Router } from 'express';
import wrapAsync from '../utils/wrapAsync.js';
import { upload } from '../utils/cloudinaryConfig.js'
import { deleteUserStatus, getTotalStatusViews, getTotalUserStatus, uploadNewStatus } from '../controllers/statusController.js';

const router = Router();

router.get('/:statusType', wrapAsync(getTotalUserStatus));

router.post('/upload', upload.single("file") ,wrapAsync(uploadNewStatus));

router.delete('/delete/:statusId', wrapAsync(deleteUserStatus));

router.post('/views', wrapAsync(getTotalStatusViews));

export default router;