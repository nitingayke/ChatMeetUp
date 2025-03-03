import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { getUserChat, deleteChatMessage, updatedBackgroundImage, setBlockUser, cleanUserChats, exitGroup } from "../controllers/chatController.js";

const router = Router();

router.post('/user-chat', wrapAsync(getUserChat));

router.patch('/delete-chat', wrapAsync(deleteChatMessage));

router.patch('/update-wallpaper', wrapAsync(updatedBackgroundImage));

router.patch('/block-entity', wrapAsync(setBlockUser));

router.patch('/clean-chats', wrapAsync(cleanUserChats));

router.delete('/exit-group/:groupId/:userId', wrapAsync(exitGroup));

export default router;