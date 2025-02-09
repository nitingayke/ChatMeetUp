import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { getUserChat, deleteChatMessage } from "../controllers/chatController.js";

const router = Router();

router.post('/user-chat', wrapAsync(getUserChat));

router.put('/delete-chat', wrapAsync(deleteChatMessage));

export default router;