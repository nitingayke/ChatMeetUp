import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import multer from 'multer';

import { updateUserData, updateUserProfileImage } from '../controllers/userController.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.patch('/update-profile', wrapAsync(updateUserData));

router.patch('/update-profile-image', upload.single("image"), wrapAsync(updateUserProfileImage));

export default router;