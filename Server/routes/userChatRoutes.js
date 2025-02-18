import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { createNewConnection, getBlockUsers, groupProfile, unblockUser, userJoinGroup, userLeaveGroup, userProfile } from "../controllers/userChatController.js";

const router = Router();

router.post('/block-users', wrapAsync(getBlockUsers));

router.post('/unblock-user', wrapAsync(unblockUser));

router.post('/user-profile', wrapAsync(userProfile));

router.post('/group-profile', wrapAsync(groupProfile));

router.post('/create-connection', wrapAsync(createNewConnection));

router.post('/join-group', wrapAsync(userJoinGroup));

router.delete('/leave-group', wrapAsync(userLeaveGroup));

export default router;