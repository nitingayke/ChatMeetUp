import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import {
    createNewConnection,
    getBlockUsers,
    getLiveUsersData,
    getNetworkData,
    unblockUser,
    userProfile
} from "../controllers/userChatController.js";

const router = Router();

router.post('/block-users', wrapAsync(getBlockUsers));

router.post('/unblock-user', wrapAsync(unblockUser));

router.post('/user-profile', wrapAsync(userProfile));

router.post('/create-connection', wrapAsync(createNewConnection));

router.post('/live-users-data', wrapAsync(getLiveUsersData));

router.post('/total-Network', wrapAsync(getNetworkData));

export default router;