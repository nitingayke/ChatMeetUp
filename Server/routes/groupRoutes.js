import { Router } from "express";

import {
    createNewGroup,
    updateGroupProfile,
    userLeaveGroup,
    userJoinGroup,
    groupProfile,
    exitGroup
} from '../controllers/groupController.js';

import wrapAsync from "../utils/wrapAsync.js";
import { upload } from "../utils/cloudinaryConfig.js";

const router = Router();

router.post('/new-group', upload.single('image'), wrapAsync(createNewGroup));

router.patch('/update-group-profile', upload.single('image'), wrapAsync(updateGroupProfile));

router.delete('/leave-group', wrapAsync(userLeaveGroup));

router.post('/join-group', wrapAsync(userJoinGroup));

router.post('/group-profile', wrapAsync(groupProfile));

router.delete('/exit-group/:groupId/:userId', wrapAsync(exitGroup));

export default router;