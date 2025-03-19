import { Router } from "express";
import { upload } from '../utils/cloudinaryConfig.js'
import wrapAsync from "../utils/wrapAsync.js";

import { getActiveUsers, updateUserData, updateUserProfileImage } from '../controllers/userController.js';

const router = Router();

router.patch('/update-profile', wrapAsync(updateUserData));

router.patch('/update-profile-image', upload.single("image"), wrapAsync(updateUserProfileImage));

router.get('/get-active-users', wrapAsync(getActiveUsers));

export default router;