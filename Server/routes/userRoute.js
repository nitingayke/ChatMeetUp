import { Router } from "express";
import { upload } from '../utils/cloudinaryConfig.js'
import wrapAsync from "../utils/wrapAsync.js";

import { updateUserData, updateUserProfileImage } from '../controllers/userController.js';

const router = Router();

router.patch('/update-profile', wrapAsync(updateUserData));

router.patch('/update-profile-image', upload.single("image"), wrapAsync(updateUserProfileImage));

export default router;