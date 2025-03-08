import { Router } from "express";

import { createNewGroup, updateGroupProfile } from '../controllers/groupController.js';
import wrapAsync from "../utils/wrapAsync.js";
import { upload } from "../utils/cloudinaryConfig.js";

const router = Router();

router.post('/new-group', upload.single('image'), wrapAsync(createNewGroup));

router.patch('/update-group-profile', upload.single('image'), wrapAsync(updateGroupProfile));

export default router;